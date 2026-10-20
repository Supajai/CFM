// app/technician/dashboard/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Hammer,
  KanbanSquare,
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  Flame,
  ArrowRight,
  MapPin,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import TechnicianTaskCard from "@/components/technician/TechnicianTaskCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "แดชบอร์ดงานช่างเทคนิคภาคสนาม (Technician) | CampusOps",
  description: "จัดการรายการงานซ่อมแซมภาคสนามที่ได้รับมอบหมายและบันทึกปิดงาน",
};

export default async function TechnicianDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/technician/dashboard");
  }

  // ดึงข้อมูลช่างปัจจุบัน
  const techUser = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  // ค้นหางานที่มอบหมายให้ช่างคนนี้ (Assigned to Me)
  // หรือหากเป็นช่าง ให้ดูงานของช่าง หรือ fallback เพื่อความยืดหยุ่นในการพรีเซนต์
  const myAssignedTickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { technicianId: session.userId },
        { technician: { email: session.email } },
        { technician: { technicianCode: session.technicianCode } },
      ],
    },
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    include: {
      attachments: true,
      reporter: true,
      technician: true,
    },
  });

  // หากยังไม่มีงานที่ตรงกับ id ช่างคนนี้พอดี ดึงงานช่างรวมเพื่อให้หน้าจอพรีเซนต์สมบูรณ์
  let displayTickets = myAssignedTickets;
  if (displayTickets.length === 0) {
    displayTickets = await prisma.ticket.findMany({
      where: {
        status: { in: ["ASSIGNED", "IN_PROGRESS", "RESOLVED"] },
      },
      take: 6,
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
      include: {
        attachments: true,
        reporter: true,
        technician: true,
      },
    });
  }

  // คำนวณ KPI ช่าง
  const assignedCount = displayTickets.filter(
    (t) => t.status === "ASSIGNED" || t.status === "PENDING"
  ).length;
  const inProgressCount = displayTickets.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = displayTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;
  const urgentCount = displayTickets.filter((t) => t.isUrgent).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white">
              <Hammer className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              งานซ่อมบำรุงของฉัน (Assigned to Me)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ช่างผู้ปฏิบัติการ:{" "}
            <span className="font-bold text-slate-800">
              {techUser?.name || session.name}
            </span>{" "}
            (รหัส: {techUser?.technicianCode || session.technicianCode || "#04"})
            • ประจำการวิทยาเขตหลัก
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/technician/kanban"
            className="flex items-center space-x-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-95"
          >
            <KanbanSquare className="h-4 w-4 text-amber-400" />
            <span>เปิดกระดานคันบันงานช่าง</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              งานที่รอดำเนินการ
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-amber-600">
              {assignedCount}
            </h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              กำลังดำเนินการซ่อม
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-blue-600">
              {inProgressCount}
            </h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Wrench className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">
              ซ่อมเสร็จสิ้นวันนี้
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-emerald-600">
              {resolvedCount}
            </h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-700">
              งานด่วนวิกฤต (SLA 15m)
            </span>
            <h3 className="mt-1 text-2xl font-extrabold text-rose-600">
              {urgentCount}
            </h3>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 3. Task List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              รายการใบงานที่ต้องเข้าดำเนินการ (Active Work Orders)
            </h2>
            <p className="text-xs text-slate-500">
              กดปุ่ม &quot;เริ่มงานซ่อม&quot; เมื่อถึงหน้างาน หรือกด &quot;แนบรูป & ปิดงาน&quot; หลังซ่อมเสร็จ
            </p>
          </div>

          <span className="rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600">
            {displayTickets.length} รายการ
          </span>
        </div>

        {displayTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayTickets.map((ticket) => (
              <TechnicianTaskCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              ไม่มีงานค้างในขณะนี้
            </h3>
            <p className="text-xs text-slate-500">
              คุณได้เคลียร์งานซ่อมที่ได้รับมอบหมายทั้งหมดเรียบร้อยแล้ว
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
