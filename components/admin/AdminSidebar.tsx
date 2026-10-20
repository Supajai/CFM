// components/admin/AdminSidebar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Layers,
  Inbox,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SessionPayload } from "@/lib/auth";

interface AdminSidebarProps {
  currentUser?: SessionPayload | null;
}

export default function AdminSidebar({ currentUser }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    {
      label: "ภาพรวมงานซ่อม (Dashboard)",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "คัดกรองและจ่ายงาน (Triage)",
      href: "/admin/triage",
      icon: Inbox,
      exact: false,
    },
    {
      label: "ตั๋วแจ้งซ่อมทั้งหมด",
      href: "/admin/tickets",
      icon: Layers,
      exact: false,
    },
    {
      label: "สถิติและรายงาน SLA",
      href: "/admin/reports",
      icon: BarChart3,
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
        <Link href="/admin/dashboard" className="flex items-center space-x-3 px-2 py-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                CampusOps
              </h1>
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400">
              บริหารอาคารสถานที่และจ่ายงาน
            </p>
          </div>
        </Link>

        {/* Admin Operational Tag */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            <span className="text-xs font-bold text-blue-900">
              ระบบศูนย์กลางจ่ายงานอาคาร
            </span>
          </div>
          <p className="text-[11px] text-blue-700">
            หัวหน้างาน: {currentUser?.name?.split(" ")[0] || "แอดมินอาคาร"}
          </p>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            เมนูบริหารงานอาคาร (Facility Ops)
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
                      isActive ? "text-blue-400" : "text-slate-400"
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
            {currentUser?.name ? currentUser.name.charAt(0) : "A"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-bold text-slate-900">
              {currentUser?.name || "หัวหน้างานอาคาร"}
            </p>
            <p className="truncate text-[10px] text-slate-400">
              {currentUser?.email || "admin@campus.ac.th"}
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
