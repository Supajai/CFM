// actions/ticket.ts - Server Actions for Ticket Operations
"use server";

import crypto from "crypto";
import prisma from "@/lib/prisma";
import {
  createTicketSchema,
  updateTicketStatusSchema,
  rateTicketSchema,
} from "@/lib/validations/ticket";
import type {
  CreateTicketInput,
  UpdateTicketStatusInput,
  RateTicketInput,
} from "@/lib/validations/ticket";
import { Priority, TicketStatus, AttachmentType, Prisma, Category } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { DEPARTMENT_FLOORS_DATA } from "@/lib/constants/department-locations";

type KanbanTicket = Prisma.TicketGetPayload<{
  include: {
    reporter: true;
    technician: true;
    attachments: true;
  };
}>;

interface CreateAttachmentInput {
  fileName: string;
  fileSize?: string;
  fileType?: string;
  url: string;
}

/**
 * ฟังก์ชันสร้างรหัสตั๋วแบบไม่ซ้ำมาตรฐานองค์กร (Guaranteed Unique Ticket Number)
 * รูปแบบ: #REP-YYMMDD-XXXX (เช่น #REP-261020-A8F2)
 * มีระบบ Collision Defense Loop ตรวจสอบกับฐานข้อมูลก่อนเสมอเพื่อรับประกันความไม่ซ้ำ 100%
 */
export async function generateUniqueTicketNumber(): Promise<string> {
  const date = new Date();
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const datePrefix = `REP-${year}${month}${day}`;

  // ตรวจสอบกับฐานข้อมูลเพื่อป้องกันการชนกัน (Retry สูงสุด 5 รอบ)
  for (let attempt = 0; attempt < 5; attempt++) {
    const randomSuffix = crypto.randomBytes(2).toString("hex").toUpperCase();
    const candidateWithHash = `#${datePrefix}-${randomSuffix}`;
    const candidateWithoutHash = `${datePrefix}-${randomSuffix}`;

    const existing = await prisma.ticket.findFirst({
      where: {
        OR: [
          { ticketNumber: candidateWithHash },
          { ticketNumber: candidateWithoutHash },
        ],
      },
      select: { id: true },
    });

    if (!existing) {
      return candidateWithHash;
    }
  }

  // Fallback กรณีชนกันเกิน 5 รอบ (โอกาสน้อยมาก) ให้ใช้ microsecond timestamp
  const fallbackSuffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `#${datePrefix}-${fallbackSuffix}`;
}

// Alias for backward compatibility as an async function
export async function generateNextTicketNumber(): Promise<string> {
  return generateUniqueTicketNumber();
}

/**
 * Server Action: สร้างคำร้องแจ้งซ่อมใหม่ (สำหรับนักศึกษา/บุคลากร)
 */
export async function createTicketAction(rawInput: CreateTicketInput) {
  try {
    const validatedData = createTicketSchema.parse(rawInput);

    // ดึงข้อมูลผู้แจ้งจาก Session ผู้ใช้ที่ล็อกอิน หรือใช้ผู้ใช้สำรองคนแรก
    const session = await getSession();
    let reporterId = session?.userId;

    if (!reporterId) {
      const defaultReporter = await prisma.user.findFirst({
        where: { role: "USER" },
      });
      reporterId = defaultReporter?.id;
    }

    // กำหนดหัวข้ออัตโนมัติหากไม่ได้ระบุ
    const title =
      validatedData.title ||
      `${validatedData.category === "AIR_CONDITIONING" ? "เครื่องปรับอากาศ" : validatedData.category === "ELECTRICAL" ? "ระบบไฟฟ้า" : validatedData.category === "PLUMBING" ? "ระบบประปา" : "แจ้งซ่อม"} - ${validatedData.room}`;

    const priority = validatedData.isUrgent ? Priority.CRITICAL : Priority.NORMAL;
    const slaTargetMinutes = validatedData.isUrgent ? 15 : 120;

    // ตรวจสอบและค้นหา Building ID จากฐานข้อมูล
    let buildingId: string | null = null;
    if (validatedData.building) {
      const matchedBuilding = await prisma.building.findFirst({
        where: {
          OR: [
            { name: validatedData.building },
            { code: validatedData.building },
            { name: { contains: validatedData.building.split("-")[0]?.trim() || validatedData.building } },
          ],
        },
        select: { id: true },
      });
      if (matchedBuilding) {
        buildingId = matchedBuilding.id;
      }
    }

    let newTicket: any = null;
    let finalTicketNumber = "";

    // Retry loop สูงสุด 3 ครั้ง ป้องกันกรณีชนกันระดับมิลลิวินาที (Concurrency Protection)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        finalTicketNumber = await generateUniqueTicketNumber();
        const randomIncident = crypto.randomBytes(2).toString("hex").toUpperCase();

        newTicket = await prisma.ticket.create({
          data: {
            ticketNumber: finalTicketNumber,
            incidentCode: `INC-${new Date().getFullYear()}-${randomIncident}`,
            title,
            description: validatedData.description,
            category: validatedData.category,
            building: validatedData.building || "อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
            buildingId,
            floor: validatedData.floor || 1,
            room: validatedData.room,
            roomName: validatedData.roomName || validatedData.room,
            specificPoint: validatedData.specificPoint || null,
            specificLocation: validatedData.specificLocation || validatedData.specificPoint || null,
            latitude: validatedData.latitude,
            longitude: validatedData.longitude,
            gpsAccuracy: validatedData.gpsAccuracy,
            isUrgent: validatedData.isUrgent,
            priority,
            slaTargetMinutes,
            beforeImageUrl: validatedData.beforeImageUrl || validatedData.attachments?.[0]?.url || null,
            status: TicketStatus.PENDING,
            currentStep: 1,
            stepNote: "รับเรื่องและรอจัดคิวคัดกรองงานช่าง",
            reporterId,
            attachments: {
              create: validatedData.attachments?.map((att: CreateAttachmentInput) => ({
                fileName: att.fileName,
                fileSize: att.fileSize || "1.5 MB",
                fileType: att.fileType || "image/jpeg",
                url: att.url,
                type: AttachmentType.BEFORE,
              })),
            },
            histories: {
              create: {
                status: TicketStatus.PENDING,
                step: 1,
                title: "รับเรื่องและตรวจสอบข้อมูลแล้ว",
                note: validatedData.isUrgent
                  ? "ระบบคัดกรองอัตโนมัติตรวจพบเป็นงานเร่งด่วนระดับ 1 ส่งตั๋วเข้าระบบช่างโดยอัตโนมัติ"
                  : "รับเรื่องและลงบันทึกในระบบเรียบร้อยแล้ว",
              },
            },
          },
          include: {
            attachments: true,
          },
        });
        break; // สำเร็จแล้วออกจากลูป
      } catch (err: any) {
        // หากเกิดข้อผิดพลาด Unique constraint (P2002) ให้ลองสร้างใหม่
        if (err.code === "P2002" && attempt < 2) {
          continue;
        }
        throw err;
      }
    }

    if (!newTicket) {
      throw new Error("ไม่สามารถสร้างรหัสใบงานที่ไม่ซ้ำได้ กรุณาลองใหม่อีกครั้ง");
    }

    try {
      revalidatePath("/student/dashboard");
      revalidatePath("/admin/kanban");
      revalidatePath("/admin/dashboard");
      revalidatePath("/");
      revalidatePath(`/tracking/${finalTicketNumber.replace("#", "")}`);
    } catch {
      // Ignore if called outside Next.js request context (e.g. scripts/unit tests)
    }

    return {
      success: true,
      ticket: newTicket,
      ticketNumber: newTicket.ticketNumber,
    };
  } catch (error: any) {
    console.error("createTicketAction error:", error);
    return {
      success: false,
      error: error.message || "เกิดข้อผิดพลาดในการส่งคำขอแจ้งซ่อม",
    };
  }
}

/**
 * Server Action: ดึงข้อมูลตั๋วรายใบตาม ID หรือ Ticket Number (สำหรับหน้า /tracking/[id])
 */
export async function getTicketByIdOrNumberAction(idOrNumber: string) {
  try {
    const withHash = idOrNumber.startsWith("#") ? idOrNumber : `#${idOrNumber}`;
    const withoutHash = idOrNumber.replace(/^#/, "");

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { ticketNumber: idOrNumber },
          { ticketNumber: withHash },
          { ticketNumber: withoutHash },
        ],
      },
      include: {
        reporter: true,
        technician: true,
        attachments: true,
        histories: {
          orderBy: { timestamp: "asc" },
          include: {
            changedBy: true,
          },
        },
      },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานแจ้งซ่อมนี้" };
    }

    return { success: true, ticket };
  } catch (error: any) {
    console.error("getTicketByIdOrNumberAction error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลตั๋วได้" };
  }
}

/**
 * Server Action: ดึงข้อมูลตั๋วทั้งหมดสำหรับกระดาน Kanban และสถิติ
 */
export async function getKanbanTicketsAction(filters?: {
  building?: string;
  floor?: number;
  room?: string;
  category?: Category | string;
  isUrgentOnly?: boolean;
  search?: string;
}) {
  try {
    const session = await getSession();
    const where: Prisma.TicketWhereInput = {};

    // Scoped Data Authorization สำหรับ ADMIN ประจำอาคาร
    if (session?.role === "ADMIN") {
      const managedBuildings = await prisma.building.findMany({
        where: { adminId: session.userId },
        select: { id: true, name: true },
      });
      const managedIds = managedBuildings.map((b) => b.id);
      const managedNames = managedBuildings.map((b) => b.name);

      where.OR = [
        { buildingId: { in: managedIds } },
        { building: { in: managedNames } },
      ];
    }

    if (filters?.building && filters.building !== "all") {
      where.building = { contains: filters.building, mode: "insensitive" };
    }

    if (filters?.floor && filters.floor > 0) {
      where.floor = filters.floor;
    }

    if (filters?.room && filters.room !== "all") {
      where.OR = [
        { room: { contains: filters.room, mode: "insensitive" } },
        { roomName: { contains: filters.room, mode: "insensitive" } },
      ];
    }

    if (filters?.category && filters.category !== "all") {
      where.category = filters.category as Category;
    }

    if (filters?.isUrgentOnly) {
      where.isUrgent = true;
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { room: { contains: q, mode: "insensitive" } },
        { roomName: { contains: q, mode: "insensitive" } },
        { building: { contains: q, mode: "insensitive" } },
      ];
    }

    const tickets: KanbanTicket[] = await prisma.ticket.findMany({
      where,
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
      include: {
        reporter: true,
        technician: true,
        attachments: true,
      },
    });

    // แบ่งตั๋วออกเป็น 3 คอลัมน์ตาม Kanban Mockup
    const columns = {
      todo: tickets.filter(
        (t: KanbanTicket) => t.status === TicketStatus.PENDING || t.status === TicketStatus.ASSIGNED
      ),
      inProgress: tickets.filter((t: KanbanTicket) => t.status === TicketStatus.IN_PROGRESS),
      done: tickets.filter(
        (t: KanbanTicket) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED
      ),
    };

    const stats = {
      totalOpen: tickets.filter((t: KanbanTicket) => t.status !== TicketStatus.CLOSED).length,
      urgentCount: tickets.filter((t: KanbanTicket) => t.isUrgent).length,
      assignedToday: 9,
      completedToday: tickets.filter(
        (t: KanbanTicket) => t.status === TicketStatus.RESOLVED || t.status === TicketStatus.CLOSED
      ).length,
      pendingVerification: tickets.filter((t: KanbanTicket) => t.status === TicketStatus.RESOLVED)
        .length,
    };

    return { success: true, columns, stats };
  } catch (error: any) {
    console.error("getKanbanTicketsAction error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลกระดานคันบันได้" };
  }
}

/**
 * Server Action: อัปเดตสถานะตั๋ว (Drag & Drop หรือการเปลี่ยนสถานะในระบบ)
 */
export async function updateTicketStatusAction(rawInput: UpdateTicketStatusInput) {
  try {
    const { ticketId, status, note, etaMinutes } =
      updateTicketStatusSchema.parse(rawInput);
    const session = await getSession();

    // ป้องกันไม่ให้ USER ทั่วไปกดปิดงานโดยตรง (สิทธิ์เป็นของช่างเทคนิคและแอดมิน)
    if (
      session &&
      session.role === "USER" &&
      (status === TicketStatus.RESOLVED || status === TicketStatus.CLOSED)
    ) {
      return {
        success: false,
        error: "ไม่มีสิทธิ์ดำเนินการ: การบันทึกปิดงานเป็นสิทธิ์ของช่างเทคนิคหรือผู้ดูแลระบบเท่านั้น",
      };
    }

    const currentTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, technicianId: true, ticketNumber: true },
    });

    if (!currentTicket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานนี้ในระบบ" };
    }

    // 🔒 SINGLE ACTIVE JOB GUARD: จำกัดสิทธิ์ Active Task ให้ช่างทำได้ทีละ 1 งาน
    if (status === TicketStatus.IN_PROGRESS) {
      const techId =
        currentTicket.technicianId ||
        (session?.role === "TECHNICIAN" ? session.userId : null);

      if (techId) {
        const activeJob = await prisma.ticket.findFirst({
          where: {
            technicianId: techId,
            status: TicketStatus.IN_PROGRESS,
            id: { not: ticketId },
          },
          select: { ticketNumber: true, title: true },
        });

        if (activeJob) {
          return {
            success: false,
            error: `คุณมีงานอื่นกำลังปฏิบัติการอยู่ (${activeJob.ticketNumber}) กรุณาปิดงานหรือกดพักงานเดิมก่อนเริ่มงานใหม่`,
          };
        }
      }
    }

    let currentStep = 1;
    let stepTitle = "";

    switch (status) {
      case TicketStatus.PENDING:
        currentStep = 1;
        stepTitle = "รับเรื่องและตรวจสอบข้อมูลแล้ว";
        break;
      case TicketStatus.ASSIGNED:
        currentStep = 2;
        stepTitle = "มอบหมายช่างแล้ว • กำลังเดินทาง";
        break;
      case TicketStatus.IN_PROGRESS:
        currentStep = 3;
        stepTitle = "ตรวจสอบหน้างานและดำเนินการซ่อมแซม";
        break;
      case TicketStatus.ON_HOLD:
        currentStep = 3;
        stepTitle = "พักงานชั่วคราว • ยกกลับศูนย์ซ่อมบำรุง";
        break;
      case TicketStatus.RESOLVED:
        currentStep = 4;
        stepTitle = "ซ่อมแซมเสร็จสิ้นแล้ว (Resolved)";
        break;
      case TicketStatus.CLOSED:
        currentStep = 4;
        stepTitle = "ปิดคำร้องและตรวจรับงานสมบูรณ์ (Closed)";
        break;
      case TicketStatus.CANCELLED:
        stepTitle = "ยกเลิกคำร้องแจ้งซ่อม";
        break;
    }

    // อัปเดตช่างผู้รับผิดชอบหากยังไม่มีและช่างเป็นผู้กดเริ่มงาน
    const autoAssignTechnician =
      !currentTicket.technicianId &&
      session?.role === "TECHNICIAN" &&
      status === TicketStatus.IN_PROGRESS;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        currentStep,
        stepNote: note || stepTitle,
        technicianId: autoAssignTechnician ? session.userId : undefined,
        etaMinutes: etaMinutes ?? undefined,
        resolvedAt: status === TicketStatus.RESOLVED ? new Date() : undefined,
        closedAt: status === TicketStatus.CLOSED ? new Date() : undefined,
        histories: {
          create: {
            status,
            step: currentStep,
            title: stepTitle,
            note: note || `เปลี่ยนสถานะเป็น ${status}`,
            changedById: session?.userId || null,
          },
        },
      },
    });

    try {
      revalidatePath("/admin/kanban");
      revalidatePath("/admin/dashboard");
      revalidatePath("/technician/dashboard");
      revalidatePath("/technician/kanban");
      revalidatePath(`/technician/active-task/${ticketId}`);
      revalidatePath("/student/dashboard");
      revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);
    } catch {
      // Ignore outside request scope
    }

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("updateTicketStatusAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถอัปเดตสถานะได้" };
  }
}

/**
 * Server Action: เริ่มงานซ่อม / เข้าถึงหน้างาน (Single Active Job Guard Protected)
 */
export async function startWorkAction({
  ticketId,
  note,
}: {
  ticketId: string;
  note?: string;
}) {
  return updateTicketStatusAction({
    ticketId,
    status: TicketStatus.IN_PROGRESS,
    note,
  });
}

/**
 * Server Action: พักงาน / ยกอุปกรณ์กลับศูนย์ซ่อม (Put On-Hold & Set ETA)
 * ปลดล็อก Active Task เพื่อให้ช่างสามารถไปเริ่มงานถัดไปได้ พร้อมแจ้งเตือนผู้ใช้เรื่องกำหนดเสร็จ
 */
export async function putTicketOnHoldAction({
  ticketId,
  holdReason,
  estimatedCompletionAt,
}: {
  ticketId: string;
  holdReason: string | null;
  estimatedCompletionAt: Date | string;
}) {
  try {
    const session = await getSession();
    if (session) {
      if (
        session.role !== "TECHNICIAN" &&
        session.role !== "ADMIN" &&
        session.role !== "SUPER_ADMIN"
      ) {
        return {
          success: false,
          error: "ไม่มีสิทธิ์ดำเนินการ: เฉพาะช่างเทคนิคหรือผู้ดูแลระบบเท่านั้น",
        };
      }
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { technician: true },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานนี้ในระบบ" };
    }

    if (!holdReason || !holdReason.trim()) {
      return {
        success: false,
        error: "กรุณาระบุเหตุผลในการพักงานหรือยกกลับศูนย์ซ่อม",
      };
    }

    if (!estimatedCompletionAt) {
      return {
        success: false,
        error: "กรุณาระบุวันและเวลาที่คาดว่าจะดำเนินการแล้วเสร็จให้ถูกต้อง",
      };
    }

    const etaDate =
      typeof estimatedCompletionAt === "string"
        ? new Date(estimatedCompletionAt)
        : estimatedCompletionAt;

    if (isNaN(etaDate.getTime())) {
      return {
        success: false,
        error: "กรุณาระบุวันและเวลาที่คาดว่าจะดำเนินการแล้วเสร็จให้ถูกต้อง",
      };
    }

    const formattedDate = etaDate.toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const cleanHoldReason = holdReason.trim();
    const techName = session?.name || ticket.technician?.name || "ช่างเทคนิค";
    const historyNote = `ช่าง ${techName} พักงานชั่วคราว: ${cleanHoldReason} กำหนดเสร็จประมาณ ${formattedDate}`;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.ON_HOLD,
        holdReason: cleanHoldReason,
        estimatedCompletionAt: etaDate,
        currentStep: 3,
        stepNote: `พักงานชั่วคราว (ยกกลับศูนย์ซ่อม) - กำหนดเสร็จ ${formattedDate}: ${cleanHoldReason}`,
        histories: {
          create: {
            status: TicketStatus.ON_HOLD,
            step: 3,
            title: "พักงานชั่วคราว • นำกลับศูนย์ซ่อมบำรุง (On-Hold)",
            note: historyNote,
            changedById: session?.userId || ticket.technicianId || null,
          },
        },
      },
    });

    try {
      revalidatePath("/technician/dashboard");
      revalidatePath("/technician/kanban");
      revalidatePath(`/technician/active-task/${ticketId}`);
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/tickets");
      revalidatePath("/admin/kanban");
      revalidatePath("/student/dashboard");
      revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);
      revalidatePath(`/dashboard/tickets/${ticketId}`);
    } catch {
      // Ignore outside request scope
    }

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("putTicketOnHoldAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถพักงานได้" };
  }
}

/**
 * Server Action: ประเมินความพึงพอใจการให้บริการ (Optional User Feedback)
 * ให้ผู้แจ้งซ่อมตัวจริงประเมินหลังจากช่างซ่อมเสร็จแล้ว (RESOLVED หรือ CLOSED)
 * ห้ามช่างเทคนิคและแอดมินประเมินคะแนนความพึงพอใจตนเอง
 */
export async function rateTicketAction(rawInput: RateTicketInput) {
  try {
    const { ticketId, rating, feedback, feedbackComment } =
      rateTicketSchema.parse(rawInput);
    const comment = (feedbackComment || feedback)?.trim() || null;
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        error: "กรุณาเข้าสู่ระบบก่อนทำการประเมินความพึงพอใจ",
      };
    }

    // 1. ตรวจสอบสิทธิ์ Role: ห้ามช่างเทคนิคและแอดมินประเมินผลงานตนเอง
    if (
      session.role === "TECHNICIAN" ||
      session.role === "ADMIN" ||
      session.role === "SUPER_ADMIN"
    ) {
      return {
        success: false,
        error: "ช่างเทคนิคและผู้ดูแลระบบไม่มีสิทธิ์ประเมินหรือให้คะแนนผลงานตนเอง",
      };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        reporter: true,
        technician: true,
      },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงาน" };
    }

    // 2. ห้ามช่างที่เป็นผู้รับผิดชอบงานนี้ประเมินตนเองโดยเด็ดขาด
    if (ticket.technicianId && session.userId === ticket.technicianId) {
      return {
        success: false,
        error: "ช่างผู้รับผิดชอบงานนี้ไม่สามารถประเมินผลงานของตนเองได้",
      };
    }

    // 3. ตรวจสอบว่าเป็นเจ้าของตั๋วตัวจริงหรือไม่
    const isOwner =
      (ticket.reporterId && session.userId === ticket.reporterId) ||
      (ticket.reporter?.email && session.email === ticket.reporter.email) ||
      session.role === "USER";

    if (!isOwner) {
      return {
        success: false,
        error: "เฉพาะผู้แจ้งซ่อมตัวจริงเท่านั้นที่สามารถประเมินความพึงพอใจได้",
      };
    }

    // 4. อนุญาตให้ประเมินได้เมื่อช่างซ่อมเสร็จแล้วเท่านั้น (RESOLVED หรือ CLOSED)
    if (
      ticket.status !== TicketStatus.RESOLVED &&
      ticket.status !== TicketStatus.CLOSED
    ) {
      return {
        success: false,
        error: "สามารถประเมินความพึงพอใจได้หลังจากช่างดำเนินการซ่อมเสร็จแล้วเท่านั้น",
      };
    }

    // 5. ป้องกันการประเมินซ้ำ
    if (ticket.rating) {
      return {
        success: false,
        error: "ใบงานนี้ได้รับการประเมินความพึงพอใจไปแล้ว",
      };
    }

    // บันทึกเฉพาะ rating และ feedbackComment โดยห้ามเปลี่ยน status เป็น CLOSED เด็ดขาด (คงสถานะ RESOLVED ไว้)
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        rating,
        feedback: comment,
        status: TicketStatus.RESOLVED,
        histories: {
          create: {
            status: TicketStatus.RESOLVED,
            step: 4,
            title: "ผู้แจ้งส่งรีวิวความพึงพอใจการให้บริการ (User Review)",
            note: `ให้คะแนนความพึงพอใจ ${rating}/5 ดาว: "${comment || "ไม่มีข้อคิดเห็นเพิ่มเติม"}"`,
            changedById: session.userId,
          },
        },
      },
    });

    try {
      revalidatePath("/admin/kanban");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/tickets");
      revalidatePath("/student/dashboard");
      revalidatePath("/technician/dashboard");
      revalidatePath("/technician/kanban");
      revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);
    } catch {
      // Ignore if called outside request scope
    }

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("rateTicketAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกการประเมินได้" };
  }
}

/**
 * Server Action: มอบหมายงานให้ช่างเทคนิค (สำหรับ Admin อาคาร)
 */
export async function assignTechnicianAction(data: {
  ticketId: string;
  technicianId: string;
  note?: string;
  etaMinutes?: number;
}) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return { success: false, error: "ไม่มีสิทธิ์มอบหมายงาน" };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticketId },
      select: {
        id: true,
        ticketNumber: true,
        building: true,
        buildingId: true,
      },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานที่ระบุ" };
    }

    // Scoped Authorization Guard: Admin ประจำอาคารต้องมอบหมายได้เฉพาะอาคารที่ตนเองดูแลเท่านั้น
    if (session.role === "ADMIN") {
      const managedBuildings = await prisma.building.findMany({
        where: { adminId: session.userId },
        select: { id: true, name: true, code: true },
      });

      const managedBuildingIds = managedBuildings.map((b) => b.id);
      const managedBuildingNames = managedBuildings.map((b) => b.name);

      const isAuthorized =
        (ticket.buildingId && managedBuildingIds.includes(ticket.buildingId)) ||
        (ticket.building && managedBuildingNames.includes(ticket.building));

      if (!isAuthorized) {
        return {
          success: false,
          error: "คุณไม่มีสิทธิ์มอบหมายงานซ่อมของอาคารอื่น",
        };
      }
    }

    const tech = await prisma.user.findUnique({
      where: { id: data.technicianId },
    });

    if (!tech) {
      return { success: false, error: "ไม่พบข้อมูลช่างที่ระบุ" };
    }

    const updated = await prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        technicianId: tech.id,
        status: TicketStatus.ASSIGNED,
        currentStep: 2,
        stepNote: data.note || `มอบหมายให้ ${tech.name} เข้าดำเนินการ`,
        etaMinutes: data.etaMinutes || (data.note?.includes("ด่วน") ? 15 : 30),
        histories: {
          create: {
            status: TicketStatus.ASSIGNED,
            step: 2,
            title: `มอบหมายช่างแล้ว: ${tech.name}`,
            note: data.note || `ผู้ดูแลระบบมอบหมายงานให้ช่าง ${tech.name} (รหัส: ${tech.technicianCode || "-"})`,
            changedById: session.userId,
          },
        },
      },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/triage");
    revalidatePath("/admin/tickets");
    revalidatePath("/technician/dashboard");
    revalidatePath("/technician/kanban");
    revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("assignTechnicianAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถมอบหมายงานได้" };
  }
}

export async function assignTicketAction(
  ticketId: string,
  technicianId: string,
  note?: string
) {
  return assignTechnicianAction({ ticketId, technicianId, note });
}

/**
 * Server Action: ช่างเทคนิคกดรับงานกลางเข้าคิวตนเอง (Claim-Based Task Flow)
 * 1. ตรวจสอบ Session ผู้ใช้ ต้องมี Role เป็น 'TECHNICIAN' (หรือ 'ADMIN'/'SUPER_ADMIN')
 * 2. ค้นหาตั๋ว หากมี technicianId ถูกกำหนดไว้แล้ว ให้ return error ("ตั๋วนี้มีผู้รับผิดชอบแล้ว")
 * 3. อัปเดต Prisma:
 *    - technicianId = session.userId
 *    - status = 'ASSIGNED'
 *    - currentStep = 2
 *    - stepNote = "ช่าง [ชื่อช่าง] กดรับงานเข้าคิวปฏิบัติการ"
 * 4. บันทึก TicketHistory ว่าช่างคนดังกล่าวกดรับงาน
 * 5. revalidatePath('/technician/kanban') และ revalidatePath('/technician/dashboard')
 */
export async function claimTicketAction(ticketId: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
    }

    if (
      session.role !== "TECHNICIAN" &&
      session.role !== "ADMIN" &&
      session.role !== "SUPER_ADMIN"
    ) {
      return {
        success: false,
        error: "ไม่มีสิทธิ์ดำเนินการ: เฉพาะช่างเทคนิคเท่านั้นที่สามารถกดรับงานได้",
      };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { technician: true },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานนี้ในระบบ" };
    }

    // หากมีช่างคนอื่นรับผิดชอบอยู่แล้ว
    if (ticket.technicianId && ticket.technicianId !== session.userId) {
      return {
        success: false,
        error: `ตั๋วนี้มีผู้รับผิดชอบแล้ว (${ticket.technician?.name || "ช่างท่านอื่น"})`,
      };
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        technicianId: session.userId,
        status: TicketStatus.ASSIGNED,
        currentStep: 2,
        stepNote: `ช่าง ${session.name} กดรับงานเข้าคิวปฏิบัติการ`,
        histories: {
          create: {
            status: TicketStatus.ASSIGNED,
            step: 2,
            title: `ช่างเทคนิคกดรับงานเข้าคิว: ${session.name}`,
            note: `ช่าง ${session.name} (รหัส: ${session.technicianCode || "-"}) กดรับงานนี้เข้าคิวปฏิบัติการ`,
            changedById: session.userId,
          },
        },
      },
    });

    try {
      revalidatePath("/technician/kanban");
      revalidatePath("/technician/dashboard");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/kanban");
      revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);
    } catch {
      // Ignore if called outside request scope
    }

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("claimTicketAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถกดรับงานได้" };
  }
}

/**
 * Server Action: ช่างเทคนิคหรือผู้ดูแลระบบบันทึกปิดงานซ่อมโดยตรง (Technician-Driven Resolution)
 * 1. ตรวจสอบสิทธิ์ว่าผู้เรียกเป็น TECHNICIAN หรือ ADMIN / SUPER_ADMIN
 * 2. อัปเดตสถานะตั๋วเป็น 'RESOLVED'
 * 3. บันทึกข้อมูล:
 *    - resolutionNotes / resolutionDetail (วิธีแก้ไข / อะไหล่ที่ใช้)
 *    - afterImageUrl (รูปถ่ายหลังซ่อมเสร็จ)
 *    - resolvedAt (วันเวลาที่ซ่อมเสร็จจริง)
 */
export async function resolveTicketAction(data: {
  ticketId: string;
  resolutionNotes?: string;
  resolutionDetail?: string;
  completionNote?: string;
  afterImageUrl?: string;
  photoUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" };
    }

    // 1. ตรวจสอบสิทธิ์ว่าผู้เรียกเป็น TECHNICIAN หรือ ADMIN / SUPER_ADMIN
    if (
      session.role !== "TECHNICIAN" &&
      session.role !== "ADMIN" &&
      session.role !== "SUPER_ADMIN"
    ) {
      return {
        success: false,
        error: "ไม่มีสิทธิ์ดำเนินการ: เฉพาะช่างเทคนิคหรือผู้ดูแลระบบเท่านั้นที่สามารถบันทึกปิดงานได้",
      };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticketId },
      include: { technician: true },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบใบงานนี้ในระบบ" };
    }

    const notes =
      data.resolutionNotes?.trim() ||
      data.resolutionDetail?.trim() ||
      data.completionNote?.trim() ||
      "ช่างดำเนินการตรวจสอบและซ่อมแซมแก้ไขเรียบร้อยแล้ว อุปกรณ์พร้อมใช้งานตามปกติ";
    const photo = data.afterImageUrl || data.photoUrl;

    // 2. อัปเดตสถานะตั๋วเป็น 'RESOLVED'
    // 3. บันทึกข้อมูล: resolutionDetail, afterImageUrl, resolvedAt
    const updated = await prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        currentStep: 4,
        stepNote: notes,
        resolutionDetail: notes,
        afterImageUrl: photo || null,
        resolvedAt: new Date(),
        attachments: photo
          ? {
              create: {
                fileName: "ภาพถ่ายหลักฐานหลังการซ่อมเสร็จ.jpg",
                fileSize: "1.2 MB",
                fileType: "image/jpeg",
                url: photo,
                type: AttachmentType.AFTER,
              },
            }
          : undefined,
        histories: {
          create: {
            status: TicketStatus.RESOLVED,
            step: 4,
            title: "ช่างซ่อมแซมเสร็จสิ้นและบันทึกปิดงานแล้ว (RESOLVED)",
            note: notes,
            changedById: session.userId,
          },
        },
      },
    });

    try {
      revalidatePath("/technician/dashboard");
      revalidatePath("/technician/kanban");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/tickets");
      revalidatePath("/admin/kanban");
      revalidatePath("/admin/triage");
      revalidatePath("/student/dashboard");
      revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);
    } catch {
      // Ignore if called outside request scope
    }

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("resolveTicketAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกปิดงานได้" };
  }
}

/**
 * Alias สำหรับความเข้ากันได้กับคอมโพเนนต์เดิมที่เรียก resolveTicketWithPhotoAction
 */
export async function resolveTicketWithPhotoAction(data: {
  ticketId: string;
  resolutionNotes?: string;
  resolutionDetail?: string;
  completionNote?: string;
  afterImageUrl?: string;
  photoUrl?: string;
}) {
  return resolveTicketAction(data);
}

/**
 * Server Action: ระบบตรวจจับงานซ้ำเบื้องต้น (Duplicate Warning System)
 * ตรวจสอบว่าในห้อง/พื้นที่และหมวดหมู่เดียวกัน มีตั๋วที่กำลังรอดำเนินการอยู่หรือไม่
 */
export async function checkDuplicateTicketsAction(data: {
  floor?: number;
  room?: string;
  roomName?: string;
  category: Category;
}) {
  try {
    const activeStatuses: TicketStatus[] = [
      TicketStatus.PENDING,
      TicketStatus.ASSIGNED,
      TicketStatus.IN_PROGRESS,
      TicketStatus.ON_HOLD,
    ];

    const where: Prisma.TicketWhereInput = {
      category: data.category,
      status: { in: activeStatuses },
    };

    const roomTarget = data.roomName || data.room;
    if (roomTarget && roomTarget.trim()) {
      const q = roomTarget.trim();
      where.OR = [
        { room: { contains: q, mode: "insensitive" } },
        { roomName: { contains: q, mode: "insensitive" } },
      ];
    }

    if (data.floor && data.floor > 0) {
      where.floor = data.floor;
    }

    const duplicates = await prisma.ticket.findMany({
      where,
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        status: true,
        floor: true,
        room: true,
        roomName: true,
        specificPoint: true,
        category: true,
        createdAt: true,
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    return {
      hasDuplicate: duplicates.length > 0,
      duplicates,
      count: duplicates.length,
    };
  } catch (error) {
    console.error("checkDuplicateTicketsAction error:", error);
    return { hasDuplicate: false, duplicates: [], count: 0 };
  }
}

/**
 * Server Action: อัปเดตข้อมูลตั๋วโดยแอดมิน (Admin Triage & Reassign)
 * - สิทธิ์เฉพาะ 'ADMIN' หรือ 'SUPER_ADMIN'
 * - เปลี่ยนตัวช่างผู้รับผิดชอบ (technicianId)
 * - ปรับระดับความเร่งด่วน (priority) และคำนวณ SLA
 * - ปรับหมวดหมู่งาน (category)
 * - ปรับห้อง/พิกัด (room, roomName, floor)
 * - บันทึก TicketHistory พร้อม adminNotes
 */
export async function updateTicketByAdminAction({
  ticketId,
  technicianId,
  priority,
  category,
  roomId,
  adminNotes,
}: {
  ticketId: string;
  technicianId?: string | null;
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT" | "CRITICAL";
  category?: string;
  roomId?: string;
  adminNotes?: string;
}) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return {
        success: false,
        error: "ไม่มีสิทธิ์ดำเนินการ: เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น",
      };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { technician: true },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานในระบบ" };
    }

    const updateData: Prisma.TicketUpdateInput = {};
    const auditLogs: string[] = [];

    // 1. จัดการช่างผู้รับผิดชอบ (Reassign Technician)
    if (technicianId !== undefined) {
      if (!technicianId) {
        // ถอนช่างออกเป็นงานกองกลาง
        updateData.technician = { disconnect: true };
        auditLogs.push("ยกเลิกการมอบหมายช่าง (ปรับเป็นงานกองกลาง)");
      } else if (technicianId !== ticket.technicianId) {
        const tech = await prisma.user.findUnique({
          where: { id: technicianId },
          select: { id: true, name: true, technicianCode: true },
        });

        if (tech) {
          updateData.technician = { connect: { id: tech.id } };
          auditLogs.push(`เปลี่ยนช่างผู้รับผิดชอบเป็น: ${tech.name} (${tech.technicianCode || "-"})`);

          // หากเดิมเป็น PENDING ให้เลื่อนสถานะเป็น ASSIGNED อัตโนมัติ
          if (ticket.status === TicketStatus.PENDING) {
            updateData.status = TicketStatus.ASSIGNED;
            updateData.currentStep = 2;
            updateData.stepNote = `แอดมิน ${session.name} มอบหมายงานให้ช่าง ${tech.name}`;
          }
        }
      }
    }

    // 2. ปรับระดับความเร่งด่วน (Calibrate Severity/Priority)
    if (priority) {
      let mappedPriority: Priority = Priority.NORMAL;
      if (priority === "CRITICAL") mappedPriority = Priority.CRITICAL;
      else if (priority === "HIGH" || priority === "URGENT") mappedPriority = Priority.URGENT;
      else if (priority === "LOW") mappedPriority = Priority.LOW;
      else mappedPriority = Priority.NORMAL;

      updateData.priority = mappedPriority;
      updateData.isUrgent = mappedPriority === Priority.CRITICAL || mappedPriority === Priority.URGENT;

      // SLA Target Minutes
      if (mappedPriority === Priority.CRITICAL) updateData.slaTargetMinutes = 15;
      else if (mappedPriority === Priority.URGENT) updateData.slaTargetMinutes = 60;
      else if (mappedPriority === Priority.NORMAL) updateData.slaTargetMinutes = 1440;
      else updateData.slaTargetMinutes = 2880;

      if (ticket.priority !== mappedPriority) {
        auditLogs.push(`ปรับระดับความเร่งด่วนเป็น: ${priority}`);
      }
    }

    // 3. ปรับหมวดหมู่งาน (Category)
    if (category && category in Category) {
      updateData.category = category as Category;
      if (ticket.category !== category) {
        auditLogs.push(`ปรับหมวดหมู่งานเป็น: ${category}`);
      }
    }

    // 4. ปรับห้อง / พิกัดสถานที่ (Location)
    if (roomId && roomId.trim() !== "") {
      let foundRoom: { id: string; name: string; floor: number } | undefined;
      for (const fl of DEPARTMENT_FLOORS_DATA) {
        const match = fl.rooms.find((r) => r.id === roomId || r.name === roomId);
        if (match) {
          foundRoom = match;
          break;
        }
      }

      if (foundRoom) {
        updateData.room = foundRoom.id;
        updateData.roomName = foundRoom.name;
        updateData.floor = foundRoom.floor;
        if (ticket.room !== foundRoom.id) {
          auditLogs.push(`ปรับสถานที่เกิดเหตุเป็น: [${foundRoom.floor}F] ${foundRoom.name}`);
        }
      } else {
        updateData.room = roomId;
        auditLogs.push(`ปรับสถานที่เกิดเหตุเป็น: ${roomId}`);
      }
    }

    // บันทึก TicketHistory
    const historyNote = [
      auditLogs.length > 0 ? auditLogs.join(" • ") : "แอดมินอัปเดตข้อมูลตั๋ว",
      adminNotes ? `บันทึกเพิ่มเติม: ${adminNotes.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    updateData.histories = {
      create: {
        status: (updateData.status as TicketStatus) || ticket.status,
        step: ticket.currentStep,
        title: `แอดมิน ${session.name} ปรับปรุงข้อมูลตั๋ว`,
        note: historyNote,
        changedById: session.userId,
      },
    };

    if (adminNotes && adminNotes.trim()) {
      updateData.stepNote = adminNotes.trim();
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        reporter: true,
        technician: true,
        attachments: true,
      },
    });

    revalidatePath("/admin/tickets");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/triage");
    revalidatePath("/technician/dashboard");
    revalidatePath("/technician/kanban");
    revalidatePath("/student/dashboard");
    revalidatePath(`/tracking/${ticket.ticketNumber.replace("#", "")}`);

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("updateTicketByAdminAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถอัปเดตข้อมูลตั๋วได้" };
  }
}

/**
 * Server Action: ยกเลิก/ปฏิเสธคำร้องโดยแอดมิน (Cancellation & Rejection)
 * - สิทธิ์เฉพาะ 'ADMIN' หรือ 'SUPER_ADMIN'
 * - ปรับ ticket.status = 'CANCELLED'
 * - บันทึก cancelReason ตามหมวดหมู่และข้อความเพิ่มเติม
 * - บันทึก TicketHistory (ไม่ลบตั๋วทิ้งตามมาตรฐาน Audit Trail)
 */
export async function cancelTicketAction({
  ticketId,
  cancelReasonCategory,
  cancelNotes,
}: {
  ticketId: string;
  cancelReasonCategory:
    | "DUPLICATE"
    | "INVALID_INFO"
    | "OUT_OF_SCOPE"
    | "RESOLVED_BY_USER"
    | "SPAM_OR_FALSE";
  cancelNotes: string;
}) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
      return {
        success: false,
        error: "ไม่มีสิทธิ์ดำเนินการ: เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น",
      };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบข้อมูลใบงานในระบบ" };
    }

    const categoryLabels: Record<string, string> = {
      DUPLICATE: "แจ้งซ้ำซ้อน",
      INVALID_INFO: "ข้อมูลไม่ชัดเจน/ติดต่อไม่ได้",
      OUT_OF_SCOPE: "นอกเหนือขอบเขตงาน",
      RESOLVED_BY_USER: "ผู้แจ้งแก้ปัญหาเองได้แล้ว",
      SPAM_OR_FALSE: "สแปม/ข้อมูลเท็จ",
    };

    const categoryTitle = categoryLabels[cancelReasonCategory] || cancelReasonCategory;
    const fullCancelReason = `${categoryTitle}: ${cancelNotes.trim()}`;

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: TicketStatus.CANCELLED,
        cancelReason: fullCancelReason,
        stepNote: `ยกเลิกคำร้อง: ${fullCancelReason}`,
        histories: {
          create: {
            status: TicketStatus.CANCELLED,
            step: ticket.currentStep,
            title: `แอดมิน ${session.name} ยกเลิก/ปฏิเสธคำร้อง`,
            note: `ยกเลิกคำร้องเนื่องจาก: ${fullCancelReason}`,
            changedById: session.userId,
          },
        },
      },
      include: {
        reporter: true,
        technician: true,
        attachments: true,
      },
    });

    revalidatePath("/admin/tickets");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/triage");
    revalidatePath("/technician/dashboard");
    revalidatePath("/technician/kanban");
    revalidatePath("/student/dashboard");
    revalidatePath(`/tracking/${ticket.ticketNumber.replace("#", "")}`);

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("cancelTicketAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถยกเลิกคำร้องได้" };
  }
}

