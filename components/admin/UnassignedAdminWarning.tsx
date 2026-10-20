// components/admin/UnassignedAdminWarning.tsx
import React from "react";
import Link from "next/link";
import { ShieldAlert, Building2, UserX, ArrowLeft, Mail, Phone, ExternalLink } from "lucide-react";

interface UnassignedAdminWarningProps {
  userName?: string;
  userEmail?: string;
  userId?: string;
}

export default function UnassignedAdminWarning({
  userName,
  userEmail,
  userId,
}: UnassignedAdminWarningProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto my-8">
      <div className="rounded-3xl border-2 border-amber-200 bg-amber-50/40 p-6 sm:p-10 shadow-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2 max-w-lg mx-auto">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            <Building2 className="h-3.5 w-3.5" />
            <span>Scoped Building Authorization</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            ยังไม่ได้รับการมอบหมายให้ดูแลอาคาร
          </h2>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            บัญชีของคุณยังไม่ได้รับการมอบหมายให้ดูแลอาคารใด กรุณาติดต่อ Super Admin
          </p>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl border border-amber-200/80 bg-white p-4 max-w-md mx-auto text-left space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-semibold">ชื่อผู้ดูแล:</span>
            <span className="font-bold text-slate-800">{userName || "ไม่ระบุ"}</span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-semibold">อีเมลบัญชี:</span>
            <span className="font-mono text-slate-700">{userEmail || "ไม่ระบุ"}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">สถานะสิทธิ์:</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ADMIN (รอมอบหมายอาคาร)
            </span>
          </div>
        </div>

        {/* Help & Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:superadmin@campus.ac.th?subject=ขอรับการมอบหมายอาคารรับผิดชอบสำหรับ Admin"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition active:scale-95"
          >
            <Mail className="h-4 w-4" />
            <span>ติดต่อ Super Admin ทางอีเมล</span>
          </a>
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับหน้าหลัก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
