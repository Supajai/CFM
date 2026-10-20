// components/navigation/MobileBottomNav.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PlusCircle,
  ClipboardList,
  User as UserIcon,
  LogOut,
  X,
  ExternalLink,
  GraduationCap,
  Shield,
  Hammer,
  Building,
  CheckCircle2,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SessionPayload } from "@/lib/auth";

interface MobileBottomNavProps {
  currentUser?: SessionPayload | null;
}

export default function MobileBottomNav({ currentUser }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // คำนวณหน้าหลักตามบทบาท
  const getHomeHref = () => {
    if (!currentUser) return "/";
    switch (currentUser.role) {
      case "TECHNICIAN":
        return "/technician/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      case "SUPER_ADMIN":
        return "/super-admin/dashboard";
      case "USER":
      default:
        return "/student/dashboard";
    }
  };

  const homeHref = getHomeHref();
  const isHomeActive = pathname === homeHref || (currentUser?.role === "USER" && pathname === "/student/dashboard");
  const isReportActive = pathname === "/report";
  const isHistoryActive = pathname.startsWith("/tracking") || (pathname === "/student/dashboard" && typeof window !== "undefined" && window.location.hash === "#history");

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      setShowProfileSheet(false);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Super Admin</span>;
      case "ADMIN":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Admin อาคาร</span>;
      case "TECHNICIAN":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ช่างเทคนิค</span>;
      case "USER":
      default:
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">นักศึกษา/บุคลากร</span>;
    }
  };

  return (
    <>
      {/* 1. Sticky Bottom Navigation Bar (Visible on mobile screens < md) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 inset-x-0 z-50 block md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {/* Tab 1: หน้าหลัก */}
          <Link
            href={homeHref}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isHomeActive
                ? "text-slate-950 font-bold"
                : "text-slate-400 font-medium hover:text-slate-600"
            }`}
          >
            <div className={`relative p-1 rounded-xl transition ${isHomeActive ? "bg-slate-100 text-slate-950" : ""}`}>
              <Home className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">หน้าหลัก</span>
          </Link>

          {/* Tab 2: แจ้งซ่อมใหม่ (Hero Raised Button) */}
          <Link
            href="/report"
            className="flex flex-col items-center justify-center -mt-4 group"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-95 ${
                isReportActive
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                  : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              <PlusCircle className="h-6 w-6 fill-white text-slate-950" />
            </div>
            <span className={`text-[10px] mt-1 font-bold ${isReportActive ? "text-blue-600" : "text-slate-700"}`}>
              แจ้งซ่อม
            </span>
          </Link>

          {/* Tab 3: ประวัติแจ้งซ่อม */}
          <Link
            href={currentUser ? "/student/dashboard#history" : "/tracking/REP-089"}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isHistoryActive
                ? "text-slate-950 font-bold"
                : "text-slate-400 font-medium hover:text-slate-600"
            }`}
          >
            <div className={`relative p-1 rounded-xl transition ${isHistoryActive ? "bg-slate-100 text-slate-950" : ""}`}>
              <ClipboardList className="h-5 w-5" />
            </div>
            <span className="text-[10px] mt-0.5">ประวัติงาน</span>
          </Link>

          {/* Tab 4: โปรไฟล์ / เข้าสู่ระบบ */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setShowProfileSheet(true)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-400 font-medium hover:text-slate-600 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-800 text-xs font-bold ring-1 ring-slate-200">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[56px]">
                {currentUser.name.split(" ")[0]}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                pathname === "/login"
                  ? "text-slate-950 font-bold"
                  : "text-slate-400 font-medium hover:text-slate-600"
              }`}
            >
              <div className="p-1">
                <UserIcon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5">เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </nav>

      {/* 2. Mobile Profile Bottom Sheet Modal */}
      {showProfileSheet && currentUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-3xl border-t border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />

            {/* Profile Info Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold text-base shadow">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      {currentUser.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    {currentUser.email}
                  </p>
                  <div className="mt-1">
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileSheet(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1 text-xs font-semibold text-slate-700">
              {currentUser.role === "USER" && (
                <>
                  <Link
                    href="/student/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>แดชบอร์ดนักศึกษา / ประวัติงาน</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/report"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>ส่งคำร้องแจ้งซ่อมใหม่</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                </>
              )}

              {currentUser.role === "TECHNICIAN" && (
                <>
                  <Link
                    href="/technician/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>งานที่ได้รับมอบหมาย (Assigned)</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/technician/kanban"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>กระดานคันบันงานช่าง</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/report"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>ส่งคำร้องแจ้งซ่อมใหม่</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                </>
              )}

              {currentUser.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>ภาพรวมระบบบริหารอาคาร (Admin)</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/admin/triage"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>คัดกรองและจ่ายงานช่าง</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/admin/tickets"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>รายการตั๋วทั้งหมดในระบบ</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                </>
              )}

              {currentUser.role === "SUPER_ADMIN" && (
                <>
                  <Link
                    href="/super-admin/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>ศูนย์ควบคุมระบบ (Super Admin)</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                  <Link
                    href="/super-admin/users"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-xl p-3 hover:bg-slate-50 transition"
                  >
                    <span>จัดการผู้ใช้และสิทธิ์ RBAC</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </Link>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-600 hover:bg-rose-100 transition active:scale-95 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
