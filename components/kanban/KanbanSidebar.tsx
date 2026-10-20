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
  User,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

export default function KanbanSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: "แดชบอร์ด", href: "/", icon: LayoutDashboard },
    { label: "กระดานคันบัน", href: "/admin/kanban", icon: KanbanSquare },
    { label: "จัดการผู้ใช้งาน (RBAC)", href: "/admin/users", icon: Shield },
    { label: "ประวัติแจ้งซ่อม", href: "/tracking/REP-089", icon: History },
    { label: "ทะเบียนครุภัณฑ์", href: "#", icon: Package },
    { label: "รายงานสถิติ", href: "#", icon: BarChart3 },
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
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-slate-200 bg-white p-4">
      <div className="space-y-6">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center space-x-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-950 tracking-tight leading-tight">
              CampusOps
            </h1>
            <p className="text-[11px] font-medium text-slate-400">
              ระบบจัดการงานซ่อมบำรุง
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
                className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Reporter Link */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
          <div className="flex items-center space-x-2 text-slate-800">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold">มุมมองผู้ใช้งาน (มือถือ)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            ทดสอบหน้าฟอร์มแจ้งซ่อมและติดตามสถานะแบบ Mobile
          </p>
          <div className="mt-2.5 flex space-x-2">
            <Link
              href="/report"
              className="flex-1 rounded-lg bg-white border border-slate-200 py-1.5 text-center text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              หน้าแจ้งซ่อม
            </Link>
            <Link
              href="/tracking/REP-089"
              className="flex-1 rounded-lg bg-white border border-slate-200 py-1.5 text-center text-[10px] font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              หน้าติดตาม
            </Link>
          </div>
        </div>
      </div>

      {/* User Footer with Logout */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex items-center justify-between rounded-xl p-2 bg-slate-50/80">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm ring-2 ring-slate-100">
              AM
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                บัญชีใช้งาน
              </h4>
              <p className="text-[10px] font-medium text-slate-400 truncate">
                สิทธิ์จัดการระบบ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="ออกจากระบบ"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
