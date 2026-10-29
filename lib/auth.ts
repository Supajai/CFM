// lib/auth.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "campus-facility-maintenance-secret-jwt-key-2026-secure"
);

export const SESSION_COOKIE_NAME = "campusops_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  technicianCode?: string | null;
  studentId?: string | null;
}

/**
 * เข้ารหัสผ่าน
 */
export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 10);
}

/**
 * เปรียบเทียบรหัสผ่าน
 */
export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hash);
}

/**
 * สร้าง JWT Token และบันทึกเป็น HTTP-only Cookie
 */
export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 วัน

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

/**
 * ดึงข้อมูล Session ปัจจุบันจาก Cookie
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!cookie?.value) return null;

    const { payload } = await jwtVerify(cookie.value, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * ลบ Session เมื่อผู้ใช้ Logout
 */
export async function destroySession() {
  cookies().delete(SESSION_COOKIE_NAME);
}
