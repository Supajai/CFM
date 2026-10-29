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
import BuildingFloorMap, { TicketSummary } from "@/components/building/BuildingFloorMap";
import DashboardViewContainer from "@/components/dashboard/DashboardViewContainer";
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

  return (
    <div className="p-4 pt-4 sm:pt-6 sm:p-6 lg:p-8 pb-28 md:pb-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Header & Live Duty Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
              <Hammer className="h-4.5 w-4.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              งานซ่อมบำรุงของฉัน (Assigned to Me)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            ช่างผู้ปฏิบัติการ:{" "}
            <span className="font-semibold text-slate-800">
              {techUser?.name || session.name}
            </span>{" "}
            (รหัส: {techUser?.technicianCode || session.technicianCode || "#04"})
            • ประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Duty Status Badge */}
          <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3.5 py-1.5 shadow-2xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-900">พร้อมปฏิบัติการ</span>
          </div>

          <Link
            href="/technician/kanban"
            className="flex items-center space-x-2 h-9 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 text-xs font-medium text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition active:scale-[0.98]"
          >
            <KanbanSquare className="h-4 w-4 stroke-[1.75]" />
            <span>กระดานคันบัน</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards with Mini Trend Bars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-amber-400 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">
                งานที่รอดำเนินการ
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-amber-600 font-mono">
                {assignedCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
              <Clock className="h-5 w-5 stroke-[1.75]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, assignedCount * 25)}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">คิวงานรอเข้าซ่อม</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-blue-400 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">
                กำลังดำเนินการซ่อม
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-blue-600 font-mono">
                {inProgressCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              <Wrench className="h-5 w-5 stroke-[1.75]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, inProgressCount * 33)}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ปฏิบัติงานหน้างาน</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-emerald-400 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">
                ซ่อมเสร็จสิ้นวันนี้
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 font-mono">
                {resolvedCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="h-5 w-5 stroke-[1.75]" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, resolvedCount * 20)}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">ส่งมอบงานแล้ว</span>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200/90 bg-rose-50/50 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-rose-400 transition-all flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-rose-700">
                งานด่วนวิกฤต (SLA 15m)
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-rose-600 font-mono">
                {urgentCount}
              </h3>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
              <Flame className="h-5 w-5 stroke-[1.75] animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full bg-rose-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(100, urgentCount * 50)}%` }} />
            </div>
            <span className="text-[10px] text-rose-600 font-mono font-medium">เข้าหน้างานด่วน</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Mode Canvas: สลับระหว่างแผนผังอาคาร 2.5D และตารางรายการ */}
      <DashboardViewContainer
        roleLabel="TECHNICIAN (ช่างเทคนิค)"
        defaultView="map"
        mapView={
          <div className="space-y-4">
            <BuildingFloorMap
              initialFloor={1}
              tickets={formattedTickets}
              currentUserRole="TECHNICIAN"
              currentUserId={session.userId}
              currentUserName={session.name}
              standalone={true}
            />
          </div>
        }
        listView={
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                  รายการใบงานที่ต้องเข้าดำเนินการ (Active Work Orders)
                </h2>
                <p className="text-xs text-zinc-500">
                  กดปุ่ม &quot;เริ่มงานซ่อม&quot; เมื่อถึงหน้างาน หรือกด &quot;แนบรูป & ปิดงาน&quot; หลังซ่อมเสร็จ
                </p>
              </div>

              <span className="rounded-md bg-zinc-100 border border-zinc-200 px-2.5 py-1 font-mono text-xs font-medium text-zinc-700">
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
              <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center space-y-3 shadow-xs">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-5 w-5 stroke-[1.75]" />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  ไม่มีงานค้างในขณะนี้
                </h3>
                <p className="text-xs text-zinc-500">
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
