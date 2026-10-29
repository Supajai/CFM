// lib/validations/user.ts
import { z } from "zod";
import { Role } from "@prisma/client";
import { DEPARTMENT_NAME } from "@/lib/constants/academic-data";

/**
 * Zod Schema: ตรวจสอบความถูกต้องสำหรับการสร้างผู้ใช้งานใหม่ (Add User Modal)
 * ขอบเขต: อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (Single Department Scope)
 */
export const createUserSchema = z.object({
  name: z.string().min(2, "ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  role: z.nativeEnum(Role).default(Role.USER),
  studentId: z.string().optional().nullable(),
  technicianCode: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  department: z.string().optional().nullable().default(DEPARTMENT_NAME),
  classLevel: z.string().optional().nullable(),
  major: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  assignedBuildingId: z.string().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Zod Schema: ตรวจสอบความถูกต้องสำหรับการแก้ไขข้อมูลผู้ใช้งาน (Edit User Modal)
 */
export const updateUserSchema = z.object({
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
