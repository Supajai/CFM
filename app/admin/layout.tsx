// app/admin/layout.tsx
import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  // Strict RBAC: อนุญาตเฉพาะ ADMIN (และ SUPER_ADMIN)
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    if (session.role === "TECHNICIAN") {
      redirect("/technician/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex h-screen bg-slate-100/90 font-sans overflow-hidden">
      {/* 1. Dedicated Admin Sidebar (Desktop) */}
      <AdminSidebar currentUser={session} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Navigation */}
        <header className="md:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
          <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-800 text-white shadow-xs">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">CampusOps</span>
              <span className="ml-1.5 font-mono text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                ADMIN
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/admin/dashboard"
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs"
            >
              ภาพรวม
            </Link>
            <Link
              href="/admin/triage"
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs"
            >
              จ่ายงาน
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
