// components/navigation/MainNavbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  PhoneCall,
  Crown,
  Building,
  Hammer,
  GraduationCap,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { SessionPayload } from "@/lib/auth";

interface MainNavbarProps {
  currentUser?: SessionPayload | null;
}

export default function MainNavbar({ currentUser }: MainNavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const getDashboardHref = () => {
    if (!currentUser) return "/login";
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        return "/super-admin/dashboard";
      case "ADMIN":
        return "/admin/dashboard";
      case "TECHNICIAN":
        return "/technician/dashboard";
      case "USER":
      default:
        return "/student/dashboard";
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <span className="flex items-center space-x-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-800 border border-zinc-200">
            <Crown className="h-3 w-3 text-zinc-700" />
            <span>Super Admin</span>
          </span>
        );
      case "ADMIN":
        return (
          <span className="flex items-center space-x-1 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-800 border border-zinc-200">
            <Building className="h-3 w-3 text-zinc-700" />
            <span>Admin อาคาร</span>
          </span>
        );
      case "TECHNICIAN":
        return (
          <span className="flex items-center space-x-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
            <Hammer className="h-3 w-3 text-amber-600" />
            <span>ช่างเทคนิค</span>
          </span>
        );
      case "USER":
      default:
        return (
          <span className="flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
            <GraduationCap className="h-3 w-3 text-emerald-600" />
            <span>นักศึกษา/บุคลากร</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-lg shadow-[0_1px_8px_-2px_rgba(0,0,0,0.04)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-105">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-slate-900 flex items-center space-x-1.5">
              <span>CampusOps</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200/60 font-mono">
                ช่างเทคนิคคอมพิวเตอร์
              </span>
            </span>
          </div>
        </Link>

        {/* Center Emergency Line */}
        <div className="hidden md:flex items-center space-x-2 rounded-full bg-slate-100/80 border border-slate-200/80 px-3.5 py-1 text-xs text-slate-600 shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span>สายด่วนฉุกเฉิน:</span>
          <span className="font-semibold text-slate-900 font-mono">02-555-1200 (ต่อ 248)</span>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <Link
                href={getDashboardHref()}
                className="flex items-center space-x-2 rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition shadow-2xs hover:border-emerald-500/40"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-medium">{currentUser.name.split(" ")[0]}</span>
                {getRoleBadge(currentUser.role)}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="ออกจากระบบ"
                className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition shadow-2xs"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-2xs hover:bg-slate-50 transition"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] hover:from-emerald-600 hover:to-emerald-700 transition"
              >
                ลงทะเบียน
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
