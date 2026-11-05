// components/technician/TechnicianBottomNav.tsx
"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ClipboardCheck,
  Building2,
  Columns3,
  History,
  User,
} from "lucide-react";
import { SessionPayload } from "@/lib/auth";
import TechnicianProfileSheet from "@/components/technician/TechnicianProfileSheet";

interface TechnicianBottomNavProps {
  currentUser?: SessionPayload | null;
}

function BottomNavContent({ currentUser }: TechnicianBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get("tab");
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // หากอยู่ในหน้า Active Task เฉพาะกิจ ไม่ต้องแสดง Bottom Nav เพื่อไม่ให้บังปุ่ม Action สั่งการหน้างาน
  if (pathname.includes("/technician/active-task/")) {
    return null;
  }

  // 1. งานของฉัน (/technician/dashboard เมื่อไม่ใช่ tab=map)
  const isMyTasksActive =
    pathname === "/technician/dashboard" && currentTab !== "map" && !isProfileOpen;

  // 2. แผนผัง 2.5D (/technician/dashboard?tab=map หรือ /technician/floor-plan)
  const isMapActive =
    ((pathname === "/technician/dashboard" && currentTab === "map") ||
      pathname.includes("floor-plan")) &&
    !isProfileOpen;

  // 3. คัมบัน
  const isKanbanActive =
    pathname.startsWith("/technician/kanban") && !isProfileOpen;

  // 4. ประวัติงาน
  const isHistoryActive =
    pathname.startsWith("/technician/history") && !isProfileOpen;

  const navItems = [
    {
      label: "งานของฉัน",
      href: "/technician/dashboard",
      icon: ClipboardCheck,
      isActive: isMyTasksActive,
    },
    {
      label: "แผนผัง 2.5D",
      href: "/technician/dashboard?tab=map",
      icon: Building2,
      isActive: isMapActive,
    },
    {
      label: "คัมบัน",
      href: "/technician/kanban",
      icon: Columns3,
      isActive: isKanbanActive,
    },
    {
      label: "ประวัติงาน",
      href: "/technician/history",
      icon: History,
      isActive: isHistoryActive,
    },
  ];

  return (
    <>
      <nav
        aria-label="เมนูหลักสำหรับอุปกรณ์เคลื่อนที่"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 md:hidden shadow-[0_-8px_20px_rgba(0,0,0,0.04)] px-1 sm:px-2 py-1.5 pb-[calc(env(safe-area-inset-bottom,0px)+6px)] transition-all"
      >
        <div className="grid grid-cols-5 gap-0.5 sm:gap-1 items-center max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsProfileOpen(false)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl transition-all duration-200 group relative ${
                  item.isActive
                    ? "text-emerald-700 font-bold bg-emerald-50/80 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-50"
                }`}
              >
                {/* Active Indicator Bar */}
                {item.isActive && (
                  <span className="absolute top-0.5 w-6 h-0.5 rounded-full bg-emerald-500 animate-in fade-in" />
                )}
                <Icon
                  className={`h-5 w-5 mb-0.5 transition-transform duration-200 ${
                    item.isActive
                      ? "stroke-[2.25] scale-110 text-emerald-600"
                      : "stroke-[1.75] group-hover:scale-105"
                  }`}
                />
                <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* 5. เมนูโปรไฟล์ / บัญชีฉัน (เปิด Bottom Sheet) */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-0.5 sm:px-1 rounded-xl transition-all duration-200 group relative cursor-pointer ${
              isProfileOpen
                ? "text-emerald-700 font-bold bg-emerald-50/80 shadow-xs"
                : "text-slate-500 hover:text-slate-800 font-medium hover:bg-slate-50"
            }`}
          >
            {isProfileOpen && (
              <span className="absolute top-0.5 w-6 h-0.5 rounded-full bg-emerald-500 animate-in fade-in" />
            )}
            <User
              className={`h-5 w-5 mb-0.5 transition-transform duration-200 ${
                isProfileOpen
                  ? "stroke-[2.25] scale-110 text-emerald-600"
                  : "stroke-[1.75] group-hover:scale-105"
              }`}
            />
            <span className="text-[10px] sm:text-[11px] leading-tight tracking-tight truncate">
              โปรไฟล์
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-up Profile & Logout Bottom Sheet */}
      <TechnicianProfileSheet
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
}

export default function TechnicianBottomNav({ currentUser }: TechnicianBottomNavProps) {
  return (
    <Suspense fallback={null}>
      <BottomNavContent currentUser={currentUser} />
    </Suspense>
  );
}
