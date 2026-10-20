// app/technician/layout.tsx
import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import Link from "next/link";
import { Hammer, LogOut, Wrench } from "lucide-react";

export default async function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/technician/dashboard");
  }

  // Strict RBAC: อนุญาตเฉพาะ TECHNICIAN (และ SUPER_ADMIN)
  if (session.role !== "TECHNICIAN" && session.role !== "SUPER_ADMIN") {
    if (session.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* 1. Dedicated Technician Sidebar (Desktop) */}
      <TechnicianSidebar currentUser={session} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Navigation */}
        <header className="md:hidden flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
          <Link href="/technician/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
              <Hammer className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">CampusOps</span>
              <span className="ml-1.5 rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                TECH
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/technician/kanban"
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              คันบัน
            </Link>
            <Link
              href="/technician/dashboard"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              งานของฉัน
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
