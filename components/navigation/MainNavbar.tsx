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
          <span className="flex items-center space-x-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
            <Crown className="h-3 w-3 text-purple-600" />
            <span>Super Admin</span>
          </span>
        );
      case "ADMIN":
        return (
          <span className="flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
            <Building className="h-3 w-3 text-blue-600" />
            <span>Admin อาคาร</span>
          </span>
        );
      case "TECHNICIAN":
        return (
          <span className="flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
            <Hammer className="h-3 w-3 text-amber-600" />
            <span>ช่างเทคนิค</span>
          </span>
        );
      case "USER":
      default:
        return (
          <span className="flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
            <GraduationCap className="h-3 w-3 text-emerald-600" />
            <span>นักศึกษา/บุคลากร</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 flex items-center space-x-1.5">
              <span>CampusOps</span>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                Service Portal
              </span>
            </span>
            <p className="text-[11px] font-medium text-slate-400">
              ศูนย์บริการซ่อมบำรุงและจัดการอาคารสถานที่
            </p>
          </div>
        </Link>

        {/* Center Emergency Line */}
        <div className="hidden md:flex items-center space-x-2 rounded-full bg-slate-50 border border-slate-200 px-3.5 py-1 text-xs text-slate-600">
          <PhoneCall className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
          <span>สายด่วนแจ้งเหตุฉุกเฉิน:</span>
          <span className="font-bold text-slate-900 font-mono">02-555-1200 (ต่อ 248)</span>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-2.5">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <Link
                href={getDashboardHref()}
                className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition shadow-sm"
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-blue-600" />
                <span className="font-bold">{currentUser.name.split(" ")[0]}</span>
                {getRoleBadge(currentUser.role)}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="ออกจากระบบ"
                className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50 transition"
              >
                เข้าสู่ระบบ (Login)
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 transition active:scale-95"
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
