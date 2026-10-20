// components/auth/RegisterForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  User,
  GraduationCap,
  Building,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { registerAction } from "@/actions/auth";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("สาขาวิชาช่างเทคนิคคอมพิวเตอร์");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {
      setIsLoading(true);
      const res = await registerAction({
        name,
        email,
        password,
        studentId,
        department,
        phone,
      });

      if (res.success) {
        router.push("/report");
        router.refresh();
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการลงทะเบียน");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
      <div className="text-center space-y-1">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          ลงทะเบียนสมาชิกใหม่
        </h1>
        <p className="text-xs text-slate-500">
          สำหรับนักศึกษาและบุคลากรเพื่อแจ้งซ่อมและติดตามประวัติ
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            ชื่อ - นามสกุล <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ศุภวิชญ์ ไตรภาคี"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รหัสนักศึกษา / บุคลากร
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="#65-0482"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-xxx-xxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            คณะ / สาขาวิชา หรือหน่วยงาน
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="เช่น สาขาวิชาช่างเทคนิคคอมพิวเตอร์"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            อีเมลสถานศึกษา <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.ac.th"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รหัสผ่าน (ขั้นต่ำ 6 ตัว) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2.5 font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center space-x-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังสร้างบัญชี...</span>
            </>
          ) : (
            <>
              <span>ยืนยันการสมัครสมาชิก</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-500">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-bold text-slate-900 underline underline-offset-2 hover:text-blue-600 transition"
        >
          เข้าสู่ระบบที่นี่
        </Link>
      </div>
    </div>
  );
}
