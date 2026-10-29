// actions/room.ts - Server Actions for Department Rooms & Facilities Management
"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEPARTMENT_FLOORS_DATA, getAllDepartmentRooms } from "@/lib/constants/department-locations";

const roomSchema = z.object({
  code: z.string().min(2, "รหัสห้องต้องมีอย่างน้อย 2 ตัวอักษร").trim(),
  name: z.string().min(3, "ชื่อห้อง/พื้นที่ต้องมีอย่างน้อย 3 ตัวอักษร").trim(),
  floor: z.coerce.number().int().min(1, "ชั้น 1-4 เท่านั้น").max(4, "ชั้น 1-4 เท่านั้น"),
  type: z.string().default("LAB"),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type DepartmentRoomFormInput = z.infer<typeof roomSchema>;

export interface DepartmentRoomItem {
  id: string;
  code: string;
  name: string;
  floor: number;
  type: string;
  description: string | null;
  isActive: boolean;
  ticketsCount?: number;
  activeTicketsCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Server Action: ดึงข้อมูลห้องและพื้นที่ทั้งหมดภายในอาคารแผนก
 * หากยังไม่มีข้อมูลในฐานข้อมูล จะทำ Auto-seed จาก DEPARTMENT_FLOORS_DATA ให้อัตโนมัติ
 */
export async function getDepartmentRoomsAction() {
  try {
    let count = await prisma.departmentRoom.count();

    // Auto-seed ข้อมูลห้องเริ่มต้น 4 ชั้น หากฐานข้อมูลยังว่างอยู่
    if (count === 0) {
      const defaultRooms = getAllDepartmentRooms();
      for (const r of defaultRooms) {
        await prisma.departmentRoom.create({
          data: {
            code: r.id,
            name: r.name,
            floor: r.floor,
            type: r.type.toUpperCase(),
            description: r.description || null,
            isActive: true,
          },
        });
      }
    }

    const rooms = await prisma.departmentRoom.findMany({
      orderBy: [{ floor: "asc" }, { code: "asc" }],
    });

    // ดึงสถิติตั๋วของแต่ละห้อง
    const tickets = await prisma.ticket.findMany({
      select: {
        id: true,
        floor: true,
        room: true,
        roomName: true,
        status: true,
      },
    });

    const enrichedRooms: DepartmentRoomItem[] = rooms.map((r) => {
      const relatedTickets = tickets.filter(
        (t) =>
          t.roomName?.toLowerCase().includes(r.code.toLowerCase()) ||
          t.room?.toLowerCase().includes(r.code.toLowerCase()) ||
          t.roomName?.includes(r.name) ||
          t.room?.includes(r.name) ||
          (t.floor === r.floor && (t.roomName?.includes(r.code) || t.room?.includes(r.code)))
      );

      const activeCount = relatedTickets.filter(
        (t) => t.status !== "CLOSED" && t.status !== "CANCELLED"
      ).length;

      return {
        id: r.id,
        code: r.code,
        name: r.name,
        floor: r.floor,
        type: r.type,
        description: r.description,
        isActive: r.isActive,
        ticketsCount: relatedTickets.length,
        activeTicketsCount: activeCount,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return { success: true, rooms: enrichedRooms };
  } catch (error: any) {
    console.error("getDepartmentRoomsAction error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลห้องได้", rooms: [] };
  }
}

/**
 * Server Action: เพิ่มห้องหรือพื้นที่ใหม่ภายในอาคารแผนก
 */
export async function createDepartmentRoomAction(rawInput: DepartmentRoomFormInput) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return { success: false, error: "ไม่มีสิทธิ์จัดการข้อมูลห้อง" };
    }

    const data = roomSchema.parse(rawInput);

    // ตรวจสอบรหัสห้องซ้ำ
    const existing = await prisma.departmentRoom.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return { success: false, error: `รหัสห้อง "${data.code}" มีอยู่ในระบบแล้ว` };
    }

    const newRoom = await prisma.departmentRoom.create({
      data: {
        code: data.code,
        name: data.name,
        floor: data.floor,
        type: data.type.toUpperCase(),
        description: data.description || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/report");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/triage");

    return { success: true, room: newRoom };
  } catch (error: any) {
    console.error("createDepartmentRoomAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเพิ่มห้อง" };
  }
}

/**
 * Server Action: แก้ไขข้อมูลห้องหรือพื้นที่
 */
export async function updateDepartmentRoomAction(id: string, rawInput: DepartmentRoomFormInput) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return { success: false, error: "ไม่มีสิทธิ์จัดการข้อมูลห้อง" };
    }

    const data = roomSchema.parse(rawInput);

    const existingWithCode = await prisma.departmentRoom.findFirst({
      where: {
        code: data.code,
        id: { not: id },
      },
    });

    if (existingWithCode) {
      return { success: false, error: `รหัสห้อง "${data.code}" ถูกใช้งานโดยห้องอื่นแล้ว` };
    }

    const updated = await prisma.departmentRoom.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        floor: data.floor,
        type: data.type.toUpperCase(),
        description: data.description || null,
        isActive: data.isActive,
      },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/report");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/triage");

    return { success: true, room: updated };
  } catch (error: any) {
    console.error("updateDepartmentRoomAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัปเดตห้อง" };
  }
}

/**
 * Server Action: ลบห้องหรือพื้นที่
 */
export async function deleteDepartmentRoomAction(id: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "SUPER_ADMIN") {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถลบห้องได้" };
    }

    await prisma.departmentRoom.delete({
      where: { id },
    });

    revalidatePath("/super-admin/settings");
    revalidatePath("/report");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/triage");

    return { success: true };
  } catch (error: any) {
    console.error("deleteDepartmentRoomAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบห้อง" };
  }
}

/**
 * Server Action: ดึงสถิติจำนวนปัญหาแยกตามห้องสำหรับ Room Heatmap Widget
 */
export async function getRoomHeatmapStatsAction() {
  try {
    const allRooms = await prisma.departmentRoom.findMany({
      orderBy: [{ floor: "asc" }, { code: "asc" }],
    });

    const tickets = await prisma.ticket.findMany({
      select: {
        id: true,
        floor: true,
        room: true,
        roomName: true,
        status: true,
        isUrgent: true,
        category: true,
      },
    });

    // รวบรวมสถิติตามห้อง
    const heatmapData = allRooms.map((room) => {
      const roomTickets = tickets.filter(
        (t) =>
          t.roomName?.toLowerCase().includes(room.code.toLowerCase()) ||
          t.room?.toLowerCase().includes(room.code.toLowerCase()) ||
          t.roomName?.includes(room.name) ||
          t.room?.includes(room.name) ||
          (t.floor === room.floor && (t.roomName?.includes(room.code) || t.room?.includes(room.code)))
      );

      const urgentCount = roomTickets.filter((t) => t.isUrgent).length;
      const activeCount = roomTickets.filter(
        (t) => t.status !== "CLOSED" && t.status !== "CANCELLED"
      ).length;

      return {
        id: room.id,
        code: room.code,
        name: room.name,
        floor: room.floor,
        type: room.type,
        totalIssues: roomTickets.length,
        activeIssues: activeCount,
        urgentIssues: urgentCount,
      };
    });

    // เรียงตามจำนวนปัญหามากไปน้อย
    heatmapData.sort((a, b) => b.totalIssues - a.totalIssues);

    return { success: true, data: heatmapData };
  } catch (error: any) {
    console.error("getRoomHeatmapStatsAction error:", error);
    return { success: false, data: [] };
  }
}

/**
 * Server Action: เปิด-ปิดสถานะการใช้งานห้อง (Maintenance Mode)
 */
export async function toggleDepartmentRoomActiveAction(idOrCode: string, isActive: boolean) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return { success: false, error: "ไม่มีสิทธิ์ปรับสถานะการใช้งานห้อง" };
    }

    const room = await prisma.departmentRoom.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
    });

    if (!room) {
      return { success: false, error: "ไม่พบข้อมูลห้องนี้ในระบบ" };
    }

    const updated = await prisma.departmentRoom.update({
      where: { id: room.id },
      data: { isActive },
    });

    revalidatePath("/super-admin/dashboard");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/floor-plan");
    revalidatePath("/student/dashboard");

    return { success: true, room: updated };
  } catch (error: any) {
    console.error("toggleDepartmentRoomActiveAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะห้อง" };
  }
}

