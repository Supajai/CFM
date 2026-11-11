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
import { TicketSummary } from "@/components/building/BuildingFloorMap";
import TechnicianDashboardClient from "@/components/technician/TechnicianDashboardClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

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

  // 1. ดึงตั๋วทั้งหมดในระบบจาก Database จริงครั้งเดียว (Single Source of Truth)
  const allTickets = await prisma.ticket.findMany({
    orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    include: {
      attachments: true,
      reporter: {
        select: { id: true, name: true, email: true, phone: true, role: true },
      },
      technician: {
        select: { id: true, name: true, email: true, technicianCode: true },
      },
    },
  });

  // งานของช่างคนนี้ (Assigned to Current Technician)
  const myTickets = allTickets.filter(
    (t) =>
      t.technicianId === session.userId ||
      (session.email && t.technician?.email === session.email) ||
      (session.technicianCode && t.technician?.technicianCode === session.technicianCode)
  );

  // งานค้างที่ต้องเข้าดำเนินการของช่าง (Active Work Orders: PENDING, ASSIGNED, IN_PROGRESS, ON_HOLD)
  const myActiveTickets = myTickets.filter(
    (t) =>
      t.status === "PENDING" ||
      t.status === "ASSIGNED" ||
      t.status === "IN_PROGRESS" ||
      t.status === "ON_HOLD"
  );

  // คำนวณ KPI สถิติช่างให้ตรงกับฐานข้อมูลจริง 100%
  const assignedCount = myTickets.filter(
    (t) => t.status === "ASSIGNED" || t.status === "PENDING"
  ).length;
  const inProgressCount = myTickets.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = myTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;
  const urgentCount = myActiveTickets.filter(
    (t) => t.isUrgent || t.priority === "URGENT" || t.priority === "CRITICAL"
  ).length;

  // Format tickets for 2.5D Building Floor Map
  const formattedTickets: TicketSummary[] = allTickets.map((t) => {
    const beforePhoto =
      t.beforeImageUrl ||
      t.attachments.find((a: any) => a.type === "BEFORE")?.url ||
      (t.attachments.length > 0 && t.attachments[0].type !== "AFTER" ? t.attachments[0].url : null) ||
      (t.attachments.length > 0 ? t.attachments[0].url : null);

    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      description: t.description,
      category: t.category,
      priority: t.priority,
      isUrgent: Boolean(t.isUrgent || t.priority === "URGENT" || t.priority === "CRITICAL"),
      slaTargetMinutes: t.slaTargetMinutes || 15,
      status: t.status,
      floor: t.floor,
      room: t.room,
      roomName: t.roomName || t.room,
      roomId: t.room,
      roomCode: t.room,
      location: t.specificPoint ? `${t.roomName || t.room} • ${t.specificPoint}` : t.roomName || t.room,
      specificPoint: t.specificPoint,
      createdAt: t.createdAt.toISOString(),
      beforeImageUrl: beforePhoto,
      afterImageUrl: t.afterImageUrl,
      reporterId: t.reporterId,
      reporterName: t.reporter?.name,
      reporterPhone: t.reporter?.phone,
      reporterRole: t.reporter?.role,
      technicianId: t.technicianId,
      technicianName: t.technician?.name,
    };
  });

  // ตั๋วงานที่ยังค้างอยู่ในระบบทั้งหมด (สำหรับตัวนับ "งานทั้งหมด" ในแถบแผนผัง)
  const allActiveTickets = allTickets.filter(
    (t) =>
      t.status === "PENDING" ||
      t.status === "ASSIGNED" ||
      t.status === "IN_PROGRESS" ||
      t.status === "ON_HOLD"
  );

  return (
    <div className="p-4 pt-4 sm:pt-6 sm:p-6 lg:p-8 pb-28 md:pb-8 space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      {/* 1. Unified Page Header (ยุบเหลือบรรทัดเดียวตามหลัก Enterprise SaaS) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            <Hammer className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              งานซ่อมบำรุงของฉัน
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>พร้อมปฏิบัติการ</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/technician/kanban"
            className="flex items-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-sm active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <KanbanSquare className="h-4 w-4" />
            <span>กระดานงานช่าง</span>
          </Link>
        </div>
      </div>

      {/* 2. Modern Compact Metric Cards (ตัด border-t-4 สีรุ้งและคำบรรยายซ้ำซ้อนออก) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Assigned */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>งานที่รอดำเนินการ</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {assignedCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-normal">รายการ</span>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>กำลังดำเนินการซ่อม</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wrench className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {inProgressCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-normal">รายการ</span>
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>ซ่อมเสร็จสิ้นวันนี้</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {resolvedCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-normal">รายการ</span>
          </div>
        </div>

        {/* Card 4: Urgent */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 hover:border-slate-300 transition-all shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-2">
            <span>งานด่วนวิกฤต (SLA 15m)</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums font-mono">
              {urgentCount}
            </span>
            <span className="text-xs text-slate-400 ml-1.5 font-normal">รายการ</span>
          </div>
        </div>
      </div>

      {/* 3. Single Integrated Operational Canvas (รวม Toolbar ทั้งหมดอยู่บนหัวการ์ดเดียว) */}
      <TechnicianDashboardClient
        formattedTickets={formattedTickets}
        session={session}
        myActiveCount={myActiveTickets.length}
        allActiveCount={allActiveTickets.length}
        defaultView="map"
        listView={
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                  รายการใบงานที่ต้องเข้าดำเนินการ (Active Work Orders)
                </h2>
                <p className="text-xs text-slate-500">
                  กดปุ่ม &quot;เริ่มงานซ่อม&quot; เมื่อถึงหน้างาน หรือกด &quot;แนบรูป & ปิดงาน&quot; หลังซ่อมเสร็จ
                </p>
              </div>

              <span className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                {myActiveTickets.length} รายการ
              </span>
            </div>

            {myActiveTickets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myActiveTickets.map((ticket) => (
                  <TechnicianTaskCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center space-y-3">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  ไม่มีงานค้างในขณะนี้
                </h3>
                <p className="text-xs text-slate-500">
                  คุณได้เคลียร์งานซ่อมที่ได้รับมอบหมายทั้งหมดเรียบร้อยแล้ว
                </p>
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
