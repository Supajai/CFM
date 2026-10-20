// actions/user.ts
"use server";

import prisma from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  role: z.nativeEnum(Role).default(Role.USER),
  studentId: z.string().optional().nullable(),
  technicianCode: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  classLevel: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  assignedBuildingId: z.string().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

const updateUserSchema = z.object({
  name: z.string().min(2, "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  role: z.nativeEnum(Role).optional(),
  studentId: z.string().optional().nullable(),
  technicianCode: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  classLevel: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  assignedBuildingId: z.string().optional().nullable(),
  newPassword: z.string().optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Server Action: สร้างผู้ใช้งานใหม่ (เฉพาะ Super Admin เท่านั้น)
 */
export async function createUserAction(rawInput: CreateUserInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถสร้างผู้ใช้งานใหม่ได้" };
    }

    const validated = createUserSchema.parse(rawInput);
    const cleanEmail = validated.email.toLowerCase().trim();

    // ตรวจสอบอีเมลซ้ำในระบบ
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: false, error: `อีเมล "${cleanEmail}" มีผู้ใช้งานในระบบแล้ว` };
    }

    // แฮชรหัสผ่านด้วย bcryptjs
    const hashedPassword = await hashPassword(validated.password);

    // กำหนดรหัสช่างอัตโนมัติหากเป็นบทบาทช่างและไม่ได้ระบุ
    let techCode = validated.technicianCode?.trim() || null;
    if (validated.role === Role.TECHNICIAN && !techCode) {
      const techCount = await prisma.user.count({ where: { role: Role.TECHNICIAN } });
      techCode = `#${(techCount + 1).toString().padStart(2, "0")}`;
    }

    const newUser = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: validated.role,
        phone: validated.phone?.trim() || null,
        studentId: validated.studentId?.trim() || null,
        technicianCode: techCode,
        position: validated.position?.trim() || null,
        department: validated.department?.trim() || null,
        classLevel: validated.classLevel?.trim() || null,
        major: validated.major?.trim() || null,
        specialty: validated.specialty?.trim() || null,
      },
    });

    // บันทึกความสัมพันธ์อาคารที่รับผิดชอบสำหรับ Role ADMIN ทันที
    if (validated.role === Role.ADMIN && validated.assignedBuildingId) {
      if (validated.assignedBuildingId !== "ALL") {
        await prisma.building.update({
          where: { id: validated.assignedBuildingId },
          data: { adminId: newUser.id },
        });
      }
    }

    revalidatePath("/super-admin/users");
    revalidatePath("/super-admin/dashboard");
    revalidatePath("/super-admin/settings");
    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("createUserAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการสร้างผู้ใช้" };
  }
}

/**
 * Server Action: แก้ไขข้อมูลผู้ใช้งาน (เฉพาะ Super Admin เท่านั้น)
 */
export async function updateUserAction(userId: string, rawInput: UpdateUserInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถแก้ไขข้อมูลผู้ใช้ได้" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "ไม่พบผู้ใช้งานนี้ในระบบ" };
    }

    const validated = updateUserSchema.parse(rawInput);
    const cleanEmail = validated.email.toLowerCase().trim();

    // หากมีการเปลี่ยนอีเมล ตรวจสอบว่าซ้ำกับผู้อื่นหรือไม่
    if (cleanEmail !== targetUser.email.toLowerCase()) {
      const emailExists = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
      if (emailExists) {
        return { success: false, error: `อีเมล "${cleanEmail}" ถูกใช้งานโดยบัญชีอื่นแล้ว` };
      }
    }

    const updateData: any = {
      name: validated.name.trim(),
      email: cleanEmail,
      phone: validated.phone?.trim() || null,
      studentId: validated.studentId?.trim() || null,
      technicianCode: validated.technicianCode?.trim() || null,
      position: validated.position?.trim() || null,
      department: validated.department?.trim() || null,
      classLevel: validated.classLevel?.trim() || null,
      major: validated.major?.trim() || null,
      specialty: validated.specialty?.trim() || null,
    };

    // อัปเดต Role
    if (validated.role) {
      // ห้ามลดสิทธิ์ตนเอง
      if (session.userId === userId && validated.role !== Role.SUPER_ADMIN) {
        return { success: false, error: "ไม่สามารถลดสิทธิ์บัญชี Super Admin ของตนเองได้" };
      }
      updateData.role = validated.role;
    }

    // ตั้งรหัสผ่านใหม่ (Reset Password)
    if (validated.newPassword && validated.newPassword.trim().length > 0) {
      const pass = validated.newPassword.trim();
      if (pass.length < 6) {
        return { success: false, error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" };
      }
      updateData.password = await hashPassword(pass);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // อัปเดตความสัมพันธ์กับตาราง Building สำหรับ Role ADMIN
    if (validated.assignedBuildingId !== undefined) {
      // ตัดความสัมพันธ์เดิมของผู้ใช้นี้
      await prisma.building.updateMany({
        where: { adminId: userId },
        data: { adminId: null },
      });

      // หากเลือกอาคารใหม่ (และไม่ใช่ตัวเลือก ALL หรือ ค่าว่าง) ให้ผูกเข้ากับอาคารนั้น
      if (validated.assignedBuildingId && validated.assignedBuildingId !== "ALL") {
        await prisma.building.update({
          where: { id: validated.assignedBuildingId },
          data: { adminId: userId },
        });
      }
    }

    revalidatePath("/super-admin/users");
    revalidatePath("/super-admin/dashboard");
    revalidatePath("/super-admin/settings");
    revalidatePath("/admin/users");
    revalidatePath("/admin/dashboard");

    return { success: true, user: updated };
  } catch (error: any) {
    console.error("updateUserAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้" };
  }
}

/**
 * Server Action: ลบผู้ใช้งาน (เฉพาะ Super Admin เท่านั้น)
 */
export async function deleteUserAction(userId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== Role.SUPER_ADMIN) {
      return { success: false, error: "เฉพาะ Super Admin เท่านั้นที่สามารถลบผู้ใช้งานได้" };
    }

    // ป้องกันการลบบัญชีตนเอง
    if (session.userId === userId) {
      return {
        success: false,
        error: "เพื่อความปลอดภัยของระบบ ไม่อนุญาตให้ลบบัญชี Super Admin ของตนเองที่กำลังเข้าสู่ระบบอยู่ได้",
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "ไม่พบผู้ใช้นี้ในระบบ หรือถูกลบไปแล้ว" };
    }

    // ดำเนินการตัดความสัมพันธ์อย่างปลอดภัยผ่าน Transaction
    await prisma.$transaction([
      prisma.ticket.updateMany({
        where: { reporterId: userId },
        data: { reporterId: null },
      }),
      prisma.ticket.updateMany({
        where: { technicianId: userId },
        data: { technicianId: null },
      }),
      prisma.ticketHistory.updateMany({
        where: { changedById: userId },
        data: { changedById: null },
      }),
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);

    revalidatePath("/super-admin/users");
    revalidatePath("/super-admin/dashboard");
    revalidatePath("/admin/users");

    return { success: true, message: `ลบบัญชี "${targetUser.name}" สำเร็จเรียบร้อยแล้ว` };
  } catch (error: any) {
    console.error("deleteUserAction error:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลบผู้ใช้งาน" };
  }
}
