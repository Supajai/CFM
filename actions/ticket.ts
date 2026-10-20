// actions/ticket.ts - Server Actions for Ticket Operations
"use server";

import prisma from "@/lib/prisma";
import {
  createTicketSchema,
  CreateTicketInput,
  updateTicketStatusSchema,
  UpdateTicketStatusInput,
  rateTicketSchema,
  RateTicketInput,
} from "@/lib/validations/ticket";
import { Priority, TicketStatus, AttachmentType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export type KanbanTicket = Prisma.TicketGetPayload<{
  include: {
    reporter: true;
    technician: true;
    attachments: true;
  };
}>;

export interface CreateAttachmentInput {
  fileName: string;
  fileSize?: string;
  fileType?: string;
  url: string;
}

// ฟังก์ชันสร้างรหัสตั๋วอัตโนมัติ เช่น #REP-090
async function generateNextTicketNumber(): Promise<string> {
  const latestTicket = await prisma.ticket.findFirst({
    orderBy: { createdAt: "desc" },
    select: { ticketNumber: true },
  });

  if (!latestTicket?.ticketNumber) {
    return "#REP-001";
  }

  const match = latestTicket.ticketNumber.match(/#?REP-(\d+)/i);
  if (match && match[1]) {
    const nextNum = parseInt(match[1], 10) + 1;
    return `#REP-${nextNum.toString().padStart(3, "0")}`;
  }

  const randomNum = Math.floor(100 + Math.random() * 900);
  return `#REP-${randomNum}`;
}

/**
 * Server Action: สร้างคำร้องแจ้งซ่อมใหม่ (สำหรับนักศึกษา/บุคลากร)
 */
export async function createTicketAction(rawInput: CreateTicketInput) {
  try {
    const validatedData = createTicketSchema.parse(rawInput);
    const ticketNumber = await generateNextTicketNumber();

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

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        incidentCode: `INC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
        title,
        description: validatedData.description,
        category: validatedData.category,
        building: validatedData.building,
        buildingId,
        room: validatedData.room,
        specificLocation: validatedData.specificLocation,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        gpsAccuracy: validatedData.gpsAccuracy,
        isUrgent: validatedData.isUrgent,
        priority,
        slaTargetMinutes,
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

    revalidatePath("/student/dashboard");
    revalidatePath("/admin/kanban");
    revalidatePath("/admin/dashboard");
    revalidatePath("/");
    revalidatePath(`/tracking/${ticketNumber.replace("#", "")}`);

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
    const cleanNumber = idOrNumber.startsWith("#") ? idOrNumber : `#${idOrNumber}`;

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { id: idOrNumber },
          { ticketNumber: idOrNumber },
          { ticketNumber: cleanNumber },
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

    if (filters?.isUrgentOnly) {
      where.isUrgent = true;
    }

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.trim();
      where.OR = [
        { ticketNumber: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { room: { contains: q, mode: "insensitive" } },
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
      case TicketStatus.RESOLVED:
        currentStep = 4;
        stepTitle = "ซ่อมแซมเสร็จสิ้นและตรวจรับงาน";
        break;
      case TicketStatus.CLOSED:
        currentStep = 4;
        stepTitle = "ตรวจรับงานเสร็จสมบูรณ์และปิดคำร้อง";
        break;
      case TicketStatus.CANCELLED:
        stepTitle = "ยกเลิกคำร้องแจ้งซ่อม";
        break;
    }

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        currentStep,
        stepNote: note || stepTitle,
        etaMinutes: etaMinutes ?? undefined,
        resolvedAt: status === TicketStatus.RESOLVED ? new Date() : undefined,
        closedAt: status === TicketStatus.CLOSED ? new Date() : undefined,
        histories: {
          create: {
            status,
            step: currentStep,
            title: stepTitle,
            note: note || `เปลี่ยนสถานะเป็น ${status}`,
          },
        },
      },
    });

    revalidatePath("/admin/kanban");
    revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("updateTicketStatusAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถอัปเดตสถานะได้" };
  }
}

/**
 * Server Action: ยืนยันปิดงานและให้คะแนนความพึงพอใจ
 */
export async function rateTicketAction(rawInput: RateTicketInput) {
  try {
    const { ticketId, rating, feedback } = rateTicketSchema.parse(rawInput);

    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        rating,
        feedback,
        status: TicketStatus.CLOSED,
        closedAt: new Date(),
        histories: {
          create: {
            status: TicketStatus.CLOSED,
            step: 4,
            title: "ตรวจรับงานและให้คะแนนประเมินแล้ว",
            note: `ให้คะแนนความพึงพอใจ ${rating}/5 ดาว: "${feedback || "ไม่มีข้อคิดเห็นเพิ่มเติม"}"`,
          },
        },
      },
    });

    revalidatePath("/admin/kanban");
    revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("rateTicketAction error:", error);
    return { success: false, error: "ไม่สามารถบันทึกการประเมินได้" };
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

/**
 * Server Action: มอบหมายงานให้ช่างเทคนิค (Alias สำหรับ assignTicketAction)
 */
export async function assignTicketAction(
  ticketId: string,
  technicianId: string,
  note?: string
) {
  return assignTechnicianAction({ ticketId, technicianId, note });
}

/**
 * Server Action: ช่างบันทึกเสร็จสิ้นงาน พร้อมแนบรูปหลังซ่อม (Resolve Ticket with Photo)
 */
export async function resolveTicketWithPhotoAction(data: {
  ticketId: string;
  completionNote: string;
  photoUrl?: string;
}) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: data.ticketId },
    });

    if (!ticket) {
      return { success: false, error: "ไม่พบใบงานนี้" };
    }

    const updated = await prisma.ticket.update({
      where: { id: data.ticketId },
      data: {
        status: TicketStatus.RESOLVED,
        currentStep: 4,
        stepNote: data.completionNote || "ช่างดำเนินการแก้ไขปัญหาเรียบร้อยแล้ว รอผู้แจ้งตรวจรับงาน",
        resolvedAt: new Date(),
        attachments: data.photoUrl
          ? {
              create: {
                fileName: "ภาพถ่ายหลักฐานหลังการซ่อมเสร็จ.jpg",
                fileSize: "1.2 MB",
                fileType: "image/jpeg",
                url: data.photoUrl,
                type: AttachmentType.AFTER,
              },
            }
          : undefined,
        histories: {
          create: {
            status: TicketStatus.RESOLVED,
            step: 4,
            title: "ช่างซ่อมแซมเสร็จสิ้นและแนบรูปหลักฐานแล้ว",
            note: data.completionNote || "งานซ่อมเสร็จสิ้น พร้อมให้ผู้แจ้งตรวจรับงาน",
            changedById: session.userId,
          },
        },
      },
    });

    revalidatePath("/technician/dashboard");
    revalidatePath("/technician/kanban");
    revalidatePath("/admin/dashboard");
    revalidatePath("/student/dashboard");
    revalidatePath(`/tracking/${updated.ticketNumber.replace("#", "")}`);

    return { success: true, ticket: updated };
  } catch (error: any) {
    console.error("resolveTicketWithPhotoAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกปิดงานได้" };
  }
}
