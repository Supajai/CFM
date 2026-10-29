// components/technician/TechnicianSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  KanbanSquare,
  ClipboardList,
  CheckCircle2,
  Map,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SessionPayload } from "@/lib/auth";

interface TechnicianSidebarProps {
  currentUser?: SessionPayload | null;
}

export default function TechnicianSidebar({ currentUser }: TechnicianSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    {
      label: "งานที่ได้รับมอบหมาย",
      href: "/technician/dashboard",
      icon: ClipboardList,
      exact: true,
    },
    {
      label: "แผนผังอาคาร 2.5D",
      href: "/admin/floor-plan",
      icon: Map,
      exact: false,
    },
    {
      label: "กระดานคันบันงานช่าง",
      href: "/technician/kanban",
      icon: KanbanSquare,
      exact: false,
    },
    {
      label: "ประวัติงานที่ซ่อมเสร็จ",
      href: "/technician/history",
      icon: CheckCircle2,
      exact: false,
    },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAction();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error(err);
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col justify-between border-r border-slate-200/90 bg-white/90 backdrop-blur-md p-4 h-screen sticky top-0 select-none shadow-[1px_0_12px_-4px_rgba(0,0,0,0.03)]">
      <div className="space-y-5">
        {/* Brand / Logo */}
        <Link href="/technician/dashboard" className="flex items-center space-x-2.5 px-2 py-1 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                CampusOps
              </h1>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200/80">
                TECH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              หน่วยช่างประจำอาคารแผนก
            </p>
          </div>
        </Link>

        {/* Technician Status Banner */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 space-y-1 shadow-2xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-950">
              พร้อมปฏิบัติการเวรหน้างาน
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-mono font-medium">
            รหัสประจำตัว: {currentUser?.technicianCode || "#04"}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <span className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            งานซ่อมบำรุงภาคสนาม
          </span>

          <nav className="mt-1.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-emerald-50/90 text-emerald-950 border border-emerald-200/90 font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-emerald-600" />
                  )}
                  <Icon
                    className={`h-4 w-4 stroke-[1.75] ${
                      isActive ? "text-emerald-700" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Shortcut to Public Portal */}
        <div className="border-t border-slate-100 pt-3 px-1">
          <Link
            href="/"
            className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 transition py-1"
          >
            <span>พอร์ทัลบริการหลัก</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-200/80 pt-3 space-y-2.5">
        <div className="flex items-center space-x-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-2xs">
            {currentUser?.name ? currentUser.name.charAt(0) : "T"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold text-slate-900">
              {currentUser?.name || "ช่างประจำอาคาร"}
            </p>
            <p className="truncate text-[10px] text-slate-400 font-mono">
              {currentUser?.email || "technician@campus.ac.th"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-slate-200/90 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? "กำลังออก..." : "ออกจากระบบ"}</span>
        </button>
      </div>
    </aside>
  );
}
