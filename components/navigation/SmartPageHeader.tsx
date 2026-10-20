// components/navigation/SmartPageHeader.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Home,
  SlidersHorizontal,
  Moon,
  Sparkles,
} from "lucide-react";
import { SessionPayload } from "@/lib/auth";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface SmartPageHeaderProps {
  title: string;
  subtitle?: string;
  ticketNumber?: string;
  currentUser?: SessionPayload | null;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
  rightAction?: React.ReactNode;
}

export default function SmartPageHeader({
  title,
  subtitle,
  ticketNumber,
  currentUser,
  breadcrumbs = [],
  backHref,
  backLabel,
  rightAction,
}: SmartPageHeaderProps) {
  const router = useRouter();

  // กำหนดเส้นทางย้อนกลับอัจฉริยะ (Smart Destination Target)
  const getSmartBackInfo = () => {
    if (backHref && backLabel) {
      return { href: backHref, label: backLabel };
    }

    if (!currentUser) {
      return { href: "/", label: "หน้าหลัก" };
    }

    switch (currentUser.role) {
      case "TECHNICIAN":
        return { href: "/technician/kanban", label: "กระดานคันบันช่าง" };
      case "ADMIN":
        return { href: "/admin/dashboard", label: "ภาพรวมระบบ" };
      case "SUPER_ADMIN":
        return { href: "/super-admin/dashboard", label: "ศูนย์ควบคุมระบบ" };
      case "USER":
      default:
        return { href: "/student/dashboard", label: "แดชบอร์ดนักศึกษา" };
    }
  };

  const smartBack = getSmartBackInfo();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 px-4 py-2.5 backdrop-blur-md">
      {/* 1. Breadcrumbs Row */}
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center space-x-1.5 text-[11px] text-slate-400">
          <Link
            href="/"
            className="flex items-center space-x-1 hover:text-slate-800 transition"
          >
            <Home className="h-3 w-3" />
            <span>หน้าหลัก</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-800 transition truncate max-w-[120px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* 2. Main App Bar Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Smart Back Button with Dynamic Role Destination Label */}
        <Link
          href={smartBack.href}
          className="group flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
          title={`ย้อนกลับไป: ${smartBack.label}`}
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 text-slate-600" />
          <span className="text-[11px]">{smartBack.label}</span>
        </Link>

        {/* Center Title & Subtitle */}
        <div className="text-center overflow-hidden">
          {subtitle && (
            <p className="text-[10px] font-medium text-slate-400 truncate">
              {subtitle}
            </p>
          )}
          <div className="flex items-center justify-center space-x-1.5">
            <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate">
              {title}
            </h1>
            {ticketNumber && (
              <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                {ticketNumber}
              </span>
            )}
          </div>
        </div>

        {/* Right Action (Sliders / Status) */}
        <div>
          {rightAction ? (
            rightAction
          ) : (
            <div className="flex items-center space-x-1 text-slate-400">
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ออนไลน์</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
