// actions/auth.ts
"use server";

import prisma from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getSession,
  hashPassword,
  comparePassword,
} from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

const registerSchema = z.object({
  name: z.string().min(2, "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  studentId: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * Server Action: เข้าสู่ระบบ (Login)
 */
export async function loginAction(formData: { email: string; password: string }) {
  try {
    const { email, password } = loginSchema.parse(formData);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, error: "ไม่พบอีเมลนี้ในระบบ" };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { success: false, error: "รหัสผ่านไม่ถูกต้อง" };
    }

    // สร้าง Session Cookie
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      technicianCode: user.technicianCode,
      studentId: user.studentId,
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error("loginAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
  }
}

/**
 * Server Action: สมัครสมาชิกสำหรับนักศึกษา/บุคลากร (Register)
 */
export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  studentId?: string;
  department?: string;
  phone?: string;
}) {
  try {
    const validated = registerSchema.parse(data);

    // ตรวจสอบว่ามีอีเมลซ้ำหรือไม่
    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (existing) {
      return { success: false, error: "อีเมลนี้มีผู้ใช้งานในระบบแล้ว" };
    }

    const hashedPassword = await hashPassword(validated.password);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.toLowerCase().trim(),
        password: hashedPassword,
        role: Role.USER, // เริ่มต้นเป็น USER เสมอ
        studentId: validated.studentId?.trim(),
        department: validated.department?.trim(),
        phone: validated.phone?.trim(),
      },
    });

    // ล็อกอินให้อัตโนมัติหลังสมัคร
    await createSession({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      studentId: newUser.studentId,
    });

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  } catch (error: any) {
    console.error("registerAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก" };
  }
}

/**
 * Server Action: ออกจากระบบ (Logout)
 */
export async function logoutAction() {
  await destroySession();
  return { success: true };
}

/**
 * Server Action: ดึงข้อมูลผู้ใช้ปัจจุบันจาก Session
 */
export async function getCurrentUserAction() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      studentId: true,
      technicianCode: true,
      position: true,
      avatar: true,
      department: true,
    },
  });

  return user;
}

/**
 * Server Action: ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ Super Admin ในหน้า /admin/users)
 */
export async function getAllUsersAction(searchQuery?: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้งานทั้งหมด" };
    }

    const where: any = {};
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { studentId: { contains: q, mode: "insensitive" } },
        { department: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        studentId: true,
        technicianCode: true,
        position: true,
        department: true,
        classLevel: true,
        major: true,
        specialty: true,
        createdAt: true,
        managedBuildings: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            reportedTickets: true,
            assignedTickets: true,
          },
        },
      },
    });

    return { success: true, users };
  } catch (error: any) {
    console.error("getAllUsersAction error:", error);
    return { success: false, error: "ไม่สามารถดึงรายชื่อผู้ใช้ได้" };
  }
}

/**
 * Server Action: เปลี่ยนสิทธิ์ (Role) ของผู้ใช้งาน (สำหรับ Super Admin เท่านั้น)
 */
export async function updateUserRoleAction(userId: string, newRole: Role) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถเปลี่ยนสิทธิ์ได้" };
    }

    // ห้ามเปลี่ยนสิทธิ์ของตนเองเพื่อความปลอดภัย
    if (session.userId === userId && newRole !== Role.SUPER_ADMIN) {
      return { success: false, error: "ไม่สามารถลดสิทธิ์บัญชีของตนเองได้" };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/kanban");

    return { success: true, user: updated };
  } catch (error: any) {
    console.error("updateUserRoleAction error:", error);
    return { success: false, error: error.message || "ไม่สามารถเปลี่ยนสิทธิ์ได้" };
  }
}
