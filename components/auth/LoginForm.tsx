// components/auth/LoginForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Wrench,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Building,
  Hammer,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { loginAction } from "@/actions/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // บัญชี Demo 4 ระดับ สำหรับการพรีเซนต์
  const demoAccounts = [
    {
      role: "Super Admin",
      email: "superadmin@campus.ac.th",
      desc: "สิทธิ์สูงสุด จัดการผู้ใช้และระบบ",
      icon: Crown,
      color: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      role: "Admin อาคาร",
      email: "admin@campus.ac.th",
      desc: "หัวหน้างานอาคารสถานที่และมอบหมายงาน",
      icon: Building,
      color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      role: "Technician ช่าง",
      email: "tech.alex@campus.ac.th",
      desc: "Alex Morgan (#04) คันบันช่าง",
      icon: Hammer,
      color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      role: "Student นักศึกษา",
      email: "student.supawit@campus.ac.th",
      desc: "ศุภวิชญ์ (#65-0482) แจ้งซ่อม",
      icon: GraduationCap,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("123456");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await loginAction({ email, password });

      if (res.success && res.user) {
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          switch (res.user.role) {
            case "SUPER_ADMIN":
              router.push("/super-admin/dashboard");
              break;
            case "ADMIN":
              router.push("/admin/dashboard");
              break;
            case "TECHNICIAN":
              router.push("/technician/dashboard");
              break;
            case "USER":
            default:
              router.push("/student/dashboard");
              break;
          }
        }
        router.refresh();
      } else {
        setErrorMsg(res.error || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl p-8 shadow-xl max-w-md w-full space-y-6 relative z-10">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
          <Wrench className="h-6 w-6 stroke-[1.75]" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          เข้าสู่ระบบ CampusOps
        </h1>
        <p className="text-xs text-slate-500">
          ระบบบริหารจัดการและแจ้งซ่อมประจำอาคารแผนกเทคโนโลยีคอมพิวเตอร์
        </p>
      </div>

      {/* Callback Notice Alert (หากถูกส่งมาจากหน้าที่ต้องสงวนสิทธิ์ เช่น /report) */}
      {callbackUrl && (
        <div className="flex items-start space-x-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 shadow-2xs animate-in fade-in duration-300">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold text-amber-950">
              {callbackUrl.startsWith("/report")
                ? "กรุณาเข้าสู่ระบบก่อนทำรายการแจ้งซ่อม"
                : callbackUrl.startsWith("/super-admin")
                ? "กรุณาเข้าสู่ระบบด้วยสิทธิ์ผู้ดูแลระบบสูงสุด (Super Admin)"
                : callbackUrl.startsWith("/technician")
                ? "กรุณาเข้าสู่ระบบด้วยบัญชีช่างเทคนิคเพื่อเข้าสู่หน้างานช่าง"
                : callbackUrl.startsWith("/admin")
                ? "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลอาคารเพื่อเข้าสู่หน้าจัดการ"
                : callbackUrl.startsWith("/student")
                ? "กรุณาเข้าสู่ระบบเพื่อเข้าสู่แดชบอร์ดนักศึกษา"
                : "กรุณาเข้าสู่ระบบก่อนเข้าถึงหน้านี้"}
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              ระบบจะนำคุณไปยังหน้า{" "}
              <span className="font-mono font-semibold underline underline-offset-2">
                {callbackUrl}
              </span>{" "}
              โดยอัตโนมัติทันทีหลังเข้าสู่ระบบสำเร็จ
            </p>
          </div>
        </div>
      )}

      {/* Role Switcher for Demo / Presentation */}
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
            <span>ปุ่มลัดสลับ Role ทดสอบ (Demo Switcher)</span>
          </span>
          <span className="font-mono text-[10px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md">
            PW: 123456
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isSelected = email === acc.email;

            return (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectDemo(acc.email)}
                className={`flex flex-col text-left py-2 px-3 rounded-xl border text-xs transition-all active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-1.5 font-medium">
                  <Icon className={`h-3.5 w-3.5 stroke-[1.75] ${isSelected ? "text-emerald-700" : "text-slate-500"}`} />
                  <span className="truncate">{acc.role}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                  {acc.email.split("@")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Error Alert */}
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 shadow-2xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 stroke-[1.75]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5">
            อีเมลสถานศึกษา
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@campus.ac.th"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 font-medium transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-semibold text-slate-700">รหัสผ่าน</label>
            <span className="font-mono text-[10px] text-slate-400">เริ่มต้น: 123456</span>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-xs text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.75]" /> : <Eye className="h-4 w-4 stroke-[1.75]" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl py-3 text-xs font-bold shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>กำลังตรวจสอบสิทธิ์...</span>
            </>
          ) : (
            <>
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            </>
          )}
        </button>
      </form>

      {/* Footer Register Link */}
      <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
        ยังไม่มีบัญชีนักศึกษา/บุคลากร?{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 transition"
        >
          ลงทะเบียนใหม่ที่นี่
        </Link>
      </div>
    </div>
  );
}
