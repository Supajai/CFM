// components/technician/TechnicianProfileSheet.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  LogOut,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Mail,
  User,
  BadgeCheck,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SessionPayload } from "@/lib/auth";

interface TechnicianProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: SessionPayload | null;
}

export default function TechnicianProfileSheet({
  isOpen,
  onClose,
  currentUser,
}: TechnicianProfileSheetProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      setIsLoggingOut(false);
    }
  };

  const initialLetter = currentUser?.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : "T";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden animate-in fade-in duration-200">
      {/* Translucent Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-up Bottom Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="โปรไฟล์และบัญชีผู้ใช้งาน"
        className="relative z-50 w-full max-w-lg rounded-t-3xl bg-white p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-slate-200/90 pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Indicator & Close Button */}
        <div className="flex items-center justify-between pb-1">
          <div className="w-8" />
          <div className="w-12 h-1.5 rounded-full bg-slate-300 mx-auto" />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Account Info Card */}
        <div className="flex items-center space-x-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xl shadow-md shadow-emerald-500/20">
            {initialLetter}
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {currentUser?.name || "ช่างเทคนิค"}
              </h3>
              <span className="chip-tech text-[10px] py-0.5 px-2 bg-emerald-100 text-emerald-800 border-emerald-200 font-mono font-bold">
                {currentUser?.technicianCode || "TECH-01"}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate font-mono">
              {currentUser?.email || "tech@campus.ac.th"}
            </p>
            <p className="text-[11px] text-slate-400">
              ตำแหน่ง: ช่างเทคนิคประจำอาคาร
            </p>
          </div>
        </div>

        {/* Active Duty Status Badge */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800">
          <span className="flex items-center gap-2 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>สถานะการเข้าเวร</span>
          </span>
          <span className="font-bold flex items-center gap-1">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            <span>พร้อมปฏิบัติการเวรหน้างาน</span>
          </span>
        </div>

        {/* System Information */}
        <div className="rounded-xl border border-slate-200/80 divide-y divide-slate-100 text-xs overflow-hidden">
          <div className="p-3 flex items-center justify-between text-slate-600 bg-white">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>ขอบเขตปฏิบัติการ</span>
            </span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
              อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์
            </span>
          </div>
          <div className="p-3 flex items-center justify-between text-slate-600 bg-white">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>ระดับสิทธิ์ระบบ (RBAC)</span>
            </span>
            <span className="font-semibold text-slate-800 font-mono">
              {currentUser?.role || "TECHNICIAN"}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleSignOut}
            className="w-full py-3.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm rounded-2xl border border-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-50 shadow-xs"
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ (Logout)"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
