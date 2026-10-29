// app/technician/layout.tsx
import React from "react";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import TechnicianSidebar from "@/components/technician/TechnicianSidebar";
import TechnicianActiveJobBanner from "@/components/technician/TechnicianActiveJobBanner";
import TechnicianBottomNav from "@/components/technician/TechnicianBottomNav";
import prisma from "@/lib/prisma";
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

  // ค้นหางานที่ช่างกำลังดำเนินการอยู่ (IN_PROGRESS) สำหรับแสดง Global Floating Banner
  const activeJob = await prisma.ticket.findFirst({
    where: {
      technicianId: session.userId,
      status: "IN_PROGRESS",
    },
    select: {
      id: true,
      ticketNumber: true,
      title: true,
      room: true,
      roomName: true,
      floor: true,
      isUrgent: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex h-screen bg-slate-50/75 font-sans overflow-hidden">
      {/* 1. Dedicated Technician Sidebar (Desktop) */}
      <TechnicianSidebar currentUser={session} />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Top Navigation */}
        <header className="md:hidden flex items-center justify-between border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 py-3 shrink-0 shadow-2xs">
          <Link href="/technician/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
              <Hammer className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">CampusOps</span>
              <span className="ml-1.5 font-mono text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200/80">
                TECH
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              href="/technician/kanban"
              className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs"
            >
              คันบัน
            </Link>
            <Link
              href="/technician/dashboard"
              className="rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              งานของฉัน
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {/* 3. Global Floating Active Job Banner */}
      <TechnicianActiveJobBanner activeJob={activeJob} />

      {/* 4. Mobile Bottom Navigation Bar */}
      <TechnicianBottomNav currentUser={session} />
    </div>
  );
}
