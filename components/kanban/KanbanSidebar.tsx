// components/kanban/KanbanSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  KanbanSquare,
  History,
  Package,
  BarChart3,
  Wrench,
  Shield,
  Smartphone,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default function KanbanSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: "แดชบอร์ดจัดการ", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "กระดานคันบัน", href: "/admin/kanban", icon: KanbanSquare },
    { label: "คิวงานและจ่ายช่าง", href: "/admin/triage", icon: Wrench },
    { label: "จัดการสิทธิ์ (RBAC)", href: "/admin/users", icon: Shield },
    { label: "ตั๋วทั้งหมดในระบบ", href: "/admin/tickets", icon: History },
    { label: "รายงานสถิติ SLA", href: "/admin/reports", icon: BarChart3 },
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
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-4 shadow-sm">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 px-2 py-1.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-white transition-colors group-hover:bg-emerald-900">
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                CampusOps
              </h1>
              <span className="chip-tech text-[9px] py-0 px-1 bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              แผนกเทคโนโลยีคอมพิวเตอร์
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex items-center justify-between rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-700/30 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-800" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile View Widget */}
        <div className="rounded-md border border-slate-200 bg-slate-50 p-3 space-y-2">
          <div className="flex items-center space-x-2 text-slate-800">
            <Smartphone className="h-4 w-4 text-emerald-800" />
            <span className="text-xs font-semibold">มุมมองผู้ใช้งาน (มือถือ)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
            ทดสอบฟอร์มแจ้งซ่อมและระบบติดตามผลงาน
          </p>
          <div className="pt-1 flex space-x-2">
            <Link
              href="/report"
              className="flex-1 rounded-md bg-white border border-slate-200 py-1.5 text-center text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-colors"
            >
              แจ้งซ่อม
            </Link>
            <Link
              href="/"
              className="flex-1 rounded-md bg-white border border-slate-200 py-1.5 text-center text-[11px] font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:text-slate-900 transition-colors"
            >
              หน้าแรก
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Profile & Logout */}
      <div className="border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center space-x-2 rounded-md border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors shadow-sm"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</span>
        </button>
      </div>
    </aside>
  );
}

