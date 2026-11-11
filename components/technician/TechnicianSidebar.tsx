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
      label: "แผนผังอาคาร",
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
    <aside className="hidden md:flex w-64 shrink-0 flex-col justify-between border-r border-slate-200/80 bg-white/90 backdrop-blur-md p-4 h-screen sticky top-0 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)] z-30">
      <div className="space-y-5">
        {/* Brand / Logo */}
        <Link href="/technician/dashboard" className="flex items-center space-x-2.5 px-2 py-1 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 transition-all group-hover:scale-105">
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                CampusOps
              </h1>
              <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-800 border border-amber-200">
                TECH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              หน่วยช่างประจำอาคารแผนก
            </p>
          </div>
        </Link>

        {/* Navigation Items */}
        <div className="space-y-1.5 pt-1">
          <span className="px-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
            งานซ่อมบำรุงภาคสนาม
          </span>

          <nav className="mt-2 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center space-x-2.5 px-3 py-2.5 text-xs transition-all ${
                    isActive
                      ? "border-l-4 border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold shadow-xs rounded-r-xl rounded-l-none"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 hover:translate-x-1 rounded-xl font-medium"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
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
            className="flex items-center justify-between text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:translate-x-0.5 transition-all py-1"
          >
            <span>พอร์ทัลบริการหลัก</span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Footer Profile with Integrated Duty Status & Logout */}
      <div className="border-t border-slate-200/80 pt-3 space-y-2.5">
        <div className="flex items-center space-x-2.5 px-1 py-1 rounded-xl bg-slate-50/70 border border-slate-100 p-2">
          <div className="relative shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-bold text-white shadow-xs ring-2 ring-white">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="truncate text-xs font-bold text-slate-900">
              {currentUser?.name || "ช่างประจำอาคาร"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>On Duty</span>
              </span>
              <span className="truncate text-[10px] text-slate-400 font-mono">
                {currentUser?.technicianCode || "#04"}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? "กำลังออก..." : "ออกจากระบบ"}</span>
        </button>
      </div>
    </aside>
  );
}
