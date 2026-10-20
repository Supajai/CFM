// actions/building.ts
"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Role, TicketStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ข้อมูลเริ่มต้นสำหรับ Auto-seed หากยังไม่มีอาคารในระบบ
const DEFAULT_CAMPUS_BUILDINGS = [
  {
    code: "BLD-01",
    name: "อาคาร 1 - อาคารเรียนรวมและปฏิบัติการวิศวกรรม",
    zone: "โซนกลาง",
    totalFloors: 5,
    latitude: 15.2290,
    longitude: 104.8600,
  },
  {
    code: "BLD-02",
    name: "อาคาร 2 - อาคารบรรยายรวม",
    zone: "โซนเหนือ",
    totalFloors: 3,
    latitude: 15.2300,
    longitude: 104.8585,
  },
  {
    code: "BLD-03",
    name: "อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์",
    zone: "โซนตะวันตก",
    totalFloors: 4,
    latitude: 15.2284,
    longitude: 104.8592,
  },
  {
    code: "BLD-05",
    name: "อาคาร 5 - อาคารเรียนและวิทยบริการ",
    zone: "โซนใต้",
    totalFloors: 6,
    latitude: 15.2270,
    longitude: 104.8610,
  },
  {
    code: "LIB-01",
    name: "หอสมุดกลาง วิทยาเขตหลัก",
    zone: "โซนตะวันออก",
    totalFloors: 4,
    latitude: 15.2295,
    longitude: 104.8625,
  },
  {
    code: "WS-04",
    name: "เวิร์กช็อป 4 - อาคารซ่อมบำรุงกลาง",
    zone: "โซนปฏิบัติการ",
    totalFloors: 2,
    latitude: 15.2260,
    longitude: 104.8570,
  },
];

const buildingSchema = z.object({
  code: z.string().min(2, "รหัสอาคารต้องมีอย่างน้อย 2 ตัวอักษร").toUpperCase().trim(),
  name: z.string().min(2, "ชื่ออาคารต้องมีอย่างน้อย 2 ตัวอักษร").trim(),
  zone: z.string().min(2, "กรุณาระบุโซนพื้นที่").trim(),
  totalFloors: z.coerce.number().int().min(1, "จำนวนชั้นต้องอย่างน้อย 1 ชั้น").max(100, "จำนวนชั้นไม่เกิน 100 ชั้น"),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  adminId: z.string().optional().nullable(),
});

export type BuildingFormInput = z.infer<typeof buildingSchema>;

export interface BuildingItem {
  id: string;
  code: string;
  name: string;
  zone: string;
  totalFloors: number;
  latitude: number | null;
  longitude: number | null;
  adminId: string | null;
  admin?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    position: string | null;
  } | null;
  ticketsCount?: number;
  activeTicketsCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AdminUserOption {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string | null;
  department: string | null;
}

/**
 * Server Action: ดึงรายชื่อผู้ใช้ที่เป็น ADMIN (สำหรับเลือกเป็นผู้ดูแลอาคาร)
 */
export async function getBuildingAdminsAction(): Promise<{
  success: boolean;
  admins?: AdminUserOption[];
  error?: string;
}> {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: Role.ADMIN,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        department: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, admins };
  } catch (error: any) {
    console.error("getBuildingAdminsAction error:", error);
    return { success: false, error: "ไม่สามารถดึงรายชื่อแอดมินได้" };
  }
}

/**
 * Server Action: ดึงข้อมูลอาคารทั้งหมด พร้อมข้อมูลผู้ดูแลอาคาร
 * หากยังไม่มีข้อมูลอาคารในระบบ จะทำการ Auto-seed ข้อมูลมาตรฐานอัตโนมัติ
 */
export async function getBuildingsAction(): Promise<{
  success: boolean;
  buildings?: BuildingItem[];
  error?: string;
}> {
  try {
    let count = await prisma.building.count();

    // หากยังไม่มีอาคาร ให้สร้างข้อมูลเริ่มต้น
    if (count === 0) {
      // ค้นหาแอดมินหลักของระบบมาผูกให้อาคารแรกเพื่อความสมบูรณ์
      const defaultAdmin = await prisma.user.findFirst({
        where: { role: Role.ADMIN },
      });

      for (let i = 0; i < DEFAULT_CAMPUS_BUILDINGS.length; i++) {
        const b = DEFAULT_CAMPUS_BUILDINGS[i];
        await prisma.building.create({
          data: {
            code: b.code,
            name: b.name,
            zone: b.zone,
            totalFloors: b.totalFloors,
            latitude: b.latitude,
            longitude: b.longitude,
            adminId: i === 0 && defaultAdmin ? defaultAdmin.id : null,
          },
        });
      }
    }

    const buildings = await prisma.building.findMany({
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            position: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    });

    return { success: true, buildings: buildings as BuildingItem[] };
  } catch (error: any) {
    console.error("getBuildingsAction error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลอาคารได้" };
  }
}

/**
 * Server Action: ตรวจสอบจำนวนตั๋วแจ้งซ่อมที่เกี่ยวข้องกับอาคาร (ก่อนลบ)
 */
export async function checkBuildingTicketsAction(buildingId: string): Promise<{
  success: boolean;
  totalTickets: number;
  activeTickets: number;
  buildingName?: string;
  error?: string;
}> {
  try {
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      return { success: false, totalTickets: 0, activeTickets: 0, error: "ไม่พบอาคารที่ระบุ" };
    }

    // ค้นหาตั๋วที่มีชื่ออาคารหรือรหัสอาคารตรงกัน
    const tickets = await prisma.ticket.findMany({
      where: {
        OR: [
          { building: building.name },
          { building: { contains: building.code } },
        ],
      },
      select: {
        id: true,
        status: true,
      },
    });

    const activeStatuses: TicketStatus[] = [
      TicketStatus.PENDING,
      TicketStatus.ASSIGNED,
      TicketStatus.IN_PROGRESS,
    ];

    const activeTickets = tickets.filter((t) => activeStatuses.includes(t.status)).length;

    return {
      success: true,
      totalTickets: tickets.length,
      activeTickets,
      buildingName: building.name,
    };
  } catch (error: any) {
    console.error("checkBuildingTicketsAction error:", error);
    return { success: false, totalTickets: 0, activeTickets: 0, error: "เกิดข้อผิดพลาดในการตรวจสอบตั๋ว" };
  }
}

/**
 * Server Action: สร้างอาคารใหม่ (เฉพาะ Super Admin)
 */
export async function createBuildingAction(rawInput: BuildingFormInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถเพิ่มอาคารใหม่ได้" };
    }

    const validated = buildingSchema.parse(rawInput);

    // ตรวจสอบรหัสอาคารซ้ำ
    const existing = await prisma.building.findUnique({
      where: { code: validated.code },
    });

    if (existing) {
      return { success: false, error: `รหัสอาคาร "${validated.code}" มีอยู่ในระบบแล้ว` };
    }

    // หากมีการระบุ adminId ให้ตรวจว่าเป็น User Role ADMIN หรือไม่
    let validAdminId = validated.adminId?.trim() || null;
    if (validAdminId) {
      const adminUser = await prisma.user.findUnique({
        where: { id: validAdminId },
      });
      if (!adminUser) {
        validAdminId = null;
      }
    }

    const newBuilding = await prisma.building.create({
      data: {
        code: validated.code,
        name: validated.name,
        zone: validated.zone,
        totalFloors: validated.totalFloors,
        latitude: validated.latitude ?? null,
        longitude: validated.longitude ?? null,
        adminId: validAdminId,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            position: true,
          },
        },
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/report");

    return { success: true, building: newBuilding as BuildingItem };
  } catch (error: any) {
    console.error("createBuildingAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างอาคาร" };
  }
}

/**
 * Server Action: แก้ไขข้อมูลอาคาร (เฉพาะ Super Admin)
 */
export async function updateBuildingAction(buildingId: string, rawInput: BuildingFormInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถแก้ไขข้อมูลอาคารได้" };
    }

    const targetBuilding = await prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!targetBuilding) {
      return { success: false, error: "ไม่พบข้อมูลอาคารนี้ในระบบ" };
    }

    const validated = buildingSchema.parse(rawInput);

    // ตรวจสอบรหัสอาคารซ้ำหากมีการเปลี่ยน
    if (validated.code !== targetBuilding.code) {
      const duplicateCode = await prisma.building.findUnique({
        where: { code: validated.code },
      });
      if (duplicateCode) {
        return { success: false, error: `รหัสอาคาร "${validated.code}" ถูกใช้งานโดยอาคารอื่นแล้ว` };
      }
    }

    const validAdminId = validated.adminId?.trim() || null;

    const updated = await prisma.building.update({
      where: { id: buildingId },
      data: {
        code: validated.code,
        name: validated.name,
        zone: validated.zone,
        totalFloors: validated.totalFloors,
        latitude: validated.latitude ?? null,
        longitude: validated.longitude ?? null,
        adminId: validAdminId,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            position: true,
          },
        },
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/report");

    return { success: true, building: updated as BuildingItem };
  } catch (error: any) {
    console.error("updateBuildingAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อมูลอาคาร" };
  }
}

/**
 * Server Action: ลบอาคาร (เฉพาะ Super Admin)
 */
export async function deleteBuildingAction(buildingId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถลบอาคารได้" };
    }

    const targetBuilding = await prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!targetBuilding) {
      return { success: false, error: "ไม่พบอาคารที่ต้องการลบ" };
    }

    await prisma.building.delete({
      where: { id: buildingId },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/report");

    return {
      success: true,
      message: `ลบอาคาร "${targetBuilding.name} (${targetBuilding.code})" ออกจากระบบเรียบร้อยแล้ว`,
    };
  } catch (error: any) {
    console.error("deleteBuildingAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบอาคาร" };
  }
}
