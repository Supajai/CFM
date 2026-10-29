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
        return <span className="bg-zinc-100 text-zinc-800 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-200">Super Admin</span>;
      case "ADMIN":
        return <span className="bg-zinc-100 text-zinc-800 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-200">Admin อาคาร</span>;
      case "TECHNICIAN":
        return <span className="bg-amber-50 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-amber-200">ช่างเทคนิค</span>;
      case "USER":
      default:
        return <span className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-emerald-200">นักศึกษา/บุคลากร</span>;
    }
  };

  return (
    <>
      {/* 1. Sticky Bottom Navigation Bar (Visible on mobile screens < md) */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 inset-x-0 z-50 block md:hidden border-t border-slate-200/80 bg-white/85 backdrop-blur-lg shadow-[0_-2px_12px_rgba(0,0,0,0.05)]"
      >
        <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
          {/* Tab 1: หน้าหลัก */}
          <Link
            href={homeHref}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              isHomeActive
                ? "text-emerald-700 font-semibold"
                : "text-slate-500 font-medium hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isHomeActive ? "bg-emerald-50 text-emerald-700" : ""}`}>
              <Home className="h-4 w-4" />
            </div>
            <span className="text-[10px] mt-0.5">หน้าหลัก</span>
          </Link>

          {/* Tab 2: แจ้งซ่อมใหม่ */}
          <Link
            href="/report"
            className="flex flex-col items-center justify-center -mt-4 group"
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.35)] transition-all active:scale-95 ${
                isReportActive
                  ? "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white ring-2 ring-emerald-200"
                  : "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
              }`}
            >
              <PlusCircle className="h-5 w-5" />
            </div>
            <span className={`text-[10px] mt-0.5 font-medium ${isReportActive ? "text-emerald-700" : "text-slate-600"}`}>
              แจ้งซ่อม
            </span>
          </Link>

          {/* Tab 3: ประวัติแจ้งซ่อม */}
          <Link
            href={currentUser ? "/student/dashboard#history" : "/tracking/REP-089"}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
              isHistoryActive
                ? "text-emerald-700 font-semibold"
                : "text-slate-500 font-medium hover:text-slate-900"
            }`}
          >
            <div className={`p-1 rounded-lg transition ${isHistoryActive ? "bg-emerald-50 text-emerald-700" : ""}`}>
              <ClipboardList className="h-4 w-4" />
            </div>
            <span className="text-[10px] mt-0.5">ประวัติงาน</span>
          </Link>

          {/* Tab 4: โปรไฟล์ / เข้าสู่ระบบ */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setShowProfileSheet(true)}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-md text-zinc-500 font-medium hover:text-zinc-900 transition"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-semibold border border-zinc-200">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-[10px] mt-0.5 truncate max-w-[56px]">
                {currentUser.name.split(" ")[0]}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-md transition-colors ${
                pathname === "/login"
                  ? "text-emerald-700 font-semibold"
                  : "text-zinc-500 font-medium hover:text-zinc-900"
              }`}
            >
              <div className="p-1">
                <UserIcon className="h-4 w-4" />
              </div>
              <span className="text-[10px] mt-0.5">เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </nav>

      {/* 2. Mobile Profile Bottom Sheet Modal */}
      {showProfileSheet && currentUser && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 backdrop-blur-xs md:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-t-lg border-t border-zinc-200 bg-white p-5 shadow-lg space-y-4 animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="mx-auto h-1 w-10 rounded-full bg-zinc-300" />

            {/* Profile Info Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-900 text-white font-semibold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-zinc-500">
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
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-0.5 text-xs font-medium text-zinc-700">
              {currentUser.role === "USER" && (
                <>
                  <Link
                    href="/student/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>แดชบอร์ดนักศึกษา / ประวัติงาน</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                  <Link
                    href="/report"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>ส่งคำร้องแจ้งซ่อมใหม่</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </>
              )}

              {currentUser.role === "TECHNICIAN" && (
                <>
                  <Link
                    href="/technician/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>งานที่ได้รับมอบหมาย (Assigned)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                  <Link
                    href="/technician/kanban"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>กระดานคันบันงานช่าง</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </>
              )}

              {currentUser.role === "ADMIN" && (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>ภาพรวมระบบบริหารอาคาร (Admin)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                  <Link
                    href="/admin/triage"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>คัดกรองและจ่ายงานช่าง</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </>
              )}

              {currentUser.role === "SUPER_ADMIN" && (
                <>
                  <Link
                    href="/super-admin/dashboard"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>ศูนย์ควบคุมระบบ (Super Admin)</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                  <Link
                    href="/super-admin/users"
                    onClick={() => setShowProfileSheet(false)}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-zinc-50 transition"
                  >
                    <span>จัดการผู้ใช้และสิทธิ์ RBAC</span>
                    <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </>
              )}
            </div>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center justify-center space-x-1.5 rounded-md border border-zinc-200 bg-white py-2 text-xs font-medium text-zinc-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-xs"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
