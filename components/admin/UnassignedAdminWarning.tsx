// components/admin/UnassignedAdminWarning.tsx
import React from "react";
import Link from "next/link";
import { ShieldAlert, Building2, ArrowLeft, Mail, AlertTriangle } from "lucide-react";

interface UnassignedAdminWarningProps {
  userName?: string;
  userEmail?: string;
  userId?: string;
}

export default function UnassignedAdminWarning({
  userName,
  userEmail,
}: UnassignedAdminWarningProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto my-12">
      <div className="card-elevated p-8 sm:p-10 text-center space-y-6 relative overflow-hidden">
        {/* Amber status glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs relative">
          <ShieldAlert className="h-7 w-7" strokeWidth={1.75} />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <div className="inline-flex items-center space-x-1.5 chip-tech text-amber-800 bg-amber-50/90 border-amber-200">
            <Building2 className="h-3.5 w-3.5 text-amber-600" strokeWidth={1.75} />
            <span>Scoped Building Authorization</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            ยังไม่ได้รับการมอบหมายให้ดูแลอาคาร
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            บัญชีของคุณยังไม่ได้รับการกำหนดสิทธิ์ดูแลอาคารใด กรุณาติดต่อผู้ดูแลระบบส่วนกลาง (Super Admin) เพื่อกำหนดขอบเขตความรับผิดชอบ
          </p>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 backdrop-blur-sm p-5 max-w-md mx-auto text-left space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <span className="text-slate-500 font-medium">ชื่อผู้ดูแล:</span>
            <span className="font-semibold text-slate-900">{userName || "ไม่ระบุ"}</span>
          </div>
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
            <span className="text-slate-500 font-medium">อีเมลบัญชี:</span>
            <span className="chip-tech text-[11px] font-mono text-slate-700">{userEmail || "ไม่ระบุ"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">สถานะสิทธิ์:</span>
            <span className="chip-tech text-[11px] font-semibold text-amber-700 bg-amber-50 border-amber-200">
              ADMIN (รอมอบหมายอาคาร)
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:superadmin@campus.ac.th?subject=ขอรับการมอบหมายอาคารรับผิดชอบสำหรับ Admin"
            className="w-full sm:w-auto btn-primary-gradient px-5 py-2.5 inline-flex items-center justify-center space-x-2 text-xs font-semibold"
          >
            <Mail className="h-4 w-4" strokeWidth={1.75} />
            <span>ติดต่อ Super Admin ทางอีเมล</span>
          </a>
          <Link
            href="/student/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl border border-slate-200/90 bg-white/90 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
            <span>กลับสู่หน้าแรก</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

