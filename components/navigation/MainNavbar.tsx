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
  Layers,
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
          <span className="flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-200">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600 inline mr-1" strokeWidth={1.75} />
            <span>นักศึกษา/บุคลากร</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20 transition-all group-hover:scale-105">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-slate-900 flex items-center space-x-1.5">
              <span>CampusOps</span>
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200 font-mono">
                <Layers className="w-3.5 h-3.5 text-emerald-600 inline mr-1" strokeWidth={1.75} />
                แผนกเทคโนโลยีคอมพิวเตอร์
              </span>
            </span>
          </div>
        </Link>

        {/* Center Emergency Line */}
        <div className="hidden md:flex items-center space-x-2 rounded-xl bg-slate-50/90 border border-slate-200/80 px-3 py-1 text-xs text-slate-600 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse"></span>
          <span>สายด่วนฉุกเฉิน:</span>
          <span className="font-semibold text-slate-900 font-mono">02-555-1200 (ต่อ 248)</span>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-2">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <Link
                href={getDashboardHref()}
                className="flex items-center space-x-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-all shadow-sm ring-2 ring-emerald-500/10 hover:shadow hover:border-slate-300"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-semibold">{currentUser.name.split(" ")[0]}</span>
                {getRoleBadge(currentUser.role)}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="ออกจากระบบ"
                className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-all duration-150 active:scale-[0.98] shadow-sm cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98]"
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
