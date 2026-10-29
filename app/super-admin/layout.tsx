// app/super-admin/layout.tsx
import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar";
import Link from "next/link";
import { Crown } from "lucide-react";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/super-admin/dashboard");
  }

  // Strict RBAC: อนุญาตเฉพาะ SUPER_ADMIN เท่านั้น 100%
  if (session.role !== "SUPER_ADMIN") {
    if (session.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else if (session.role === "TECHNICIAN") {
      redirect("/technician/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex h-screen bg-slate-50/75 font-sans overflow-hidden">
      {/* 1. Dedicated Super Admin Sidebar (Desktop) */}
      <SuperAdminSidebar currentUser={session} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Navigation */}
        <header className="md:hidden flex items-center justify-between border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 py-3 shrink-0 shadow-2xs">
          <Link href="/super-admin/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              <Crown className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">CampusOps</span>
              <span className="ml-1.5 font-mono text-[9px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/80">
                ROOT
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/super-admin/users"
              className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs"
            >
              จัดการสิทธิ์
            </Link>
            <Link
              href="/super-admin/dashboard"
              className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              ระบบ
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
