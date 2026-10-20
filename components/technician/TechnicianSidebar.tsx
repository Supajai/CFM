// components/technician/TechnicianSidebar.tsx - Technician Navigation Sidebar
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Wrench,
  KanbanSquare,
  ClipboardList,
  CheckCircle2,
  LogOut,
  Hammer,
  AlertCircle,
  ExternalLink,
  Smartphone,
  Shield,
  Layers,
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
    <aside className="hidden md:flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-4 h-screen sticky top-0 select-none">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/technician/dashboard" className="flex items-center space-x-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <Hammer className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                CampusOps
              </h1>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                TECH
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              หน่วยช่างซ่อมบำรุงภาคสนาม
            </p>
          </div>
        </Link>

        {/* Technician Status Banner */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-800">
              พร้อมปฏิบัติการเวรหน้างาน
            </span>
          </div>
          <p className="text-[11px] text-emerald-600">
            รหัสประจำตัว: {currentUser?.technicianCode || "#04"}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            เมนูงานช่าง (Field Operations)
          </span>

          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-amber-400" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Shortcut to Public Portal */}
        <div className="border-t border-slate-100 pt-4 px-1">
          <Link
            href="/"
            className="flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition py-1"
          >
            <span>พอร์ทัลหลักระดับสถาบัน</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-200 pt-4 space-y-3">
        <div className="flex items-center space-x-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow">
            {currentUser?.name ? currentUser.name.charAt(0) : "T"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-slate-900">
              {currentUser?.name || "ช่างเทคนิค"}
            </p>
            <p className="truncate text-[10px] text-slate-400">
              {currentUser?.email || "tech@campus.ac.th"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? "กำลังออก..." : "ออกจากระบบ"}</span>
        </button>
      </div>
    </aside>
  );
}
