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
    <div className="w-full max-w-lg rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:border-emerald-500/40 transition-all space-y-5">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.35)]">
          <GraduationCap className="h-6 w-6 stroke-[1.75]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          ลงทะเบียนสมาชิกใหม่
        </h1>
        <p className="text-xs text-slate-500">
          สำหรับนักศึกษาและบุคลากร แผนกวิชาช่างเทคนิคคอมพิวเตอร์
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 stroke-[1.75]" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            ชื่อ - นามสกุล <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ศุภวิชญ์ ไตรภาคี"
              className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-10 pr-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              รหัสนักศึกษา / บุคลากร
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="#65-0482"
              className="w-full h-10 rounded-xl border border-slate-300/80 bg-white px-3 text-xs font-mono font-medium text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 stroke-[1.75]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-xxx-xxxx"
                className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-10 pr-3 text-xs font-mono text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            แผนกวิชาต้นสังกัด
          </label>
          <input
            type="text"
            readOnly
            value={department}
            className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-xs text-slate-700 shadow-2xs cursor-not-allowed font-semibold"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            อีเมลสถานศึกษา <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@campus.ac.th"
              className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-10 pr-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              รหัสผ่าน (ขั้นต่ำ 6 ตัว) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 stroke-[1.75]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-10 pr-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400 stroke-[1.75]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-10 pr-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex w-full items-center justify-center space-x-2 h-10 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังสร้างบัญชี...</span>
            </>
          ) : (
            <>
              <span>ยืนยันการสมัครสมาชิก</span>
              <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-slate-100 pt-3 text-center text-xs text-slate-500">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 transition"
        >
          เข้าสู่ระบบที่นี่
        </Link>
      </div>
    </div>
  );
}
