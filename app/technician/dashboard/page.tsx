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

  return (
    <div className="p-4 pt-4 sm:pt-6 sm:p-6 lg:p-8 pb-28 md:pb-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Header & Live Duty Status Banner */}
      <div className="card-elevated p-6 relative overflow-hidden flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
              <Hammer className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                งานซ่อมบำรุงของฉัน (Assigned to Me)
              </h1>
              <p className="mt-0.5 text-xs text-slate-500 font-normal">
                ช่างผู้ปฏิบัติการ:{" "}
                <span className="font-semibold text-slate-800">
                  {techUser?.name || session.name}
                </span>{" "}
                (รหัส: {techUser?.technicianCode || session.technicianCode || "#04"})
                • ประจำอาคารแผนกเทคโนโลยีคอมพิวเตอร์
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Duty Status Badge */}
          <div className="flex items-center space-x-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1.5 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-bold text-emerald-900">พร้อมปฏิบัติการ</span>
          </div>

          <Link
            href="/technician/kanban"
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <KanbanSquare className="h-4 w-4 stroke-[2]" />
            <span>กระดานงานช่าง</span>
          </Link>
        </div>
      </div>

      {/* 2. KPI Summary Cards with Accent Glow & Hover Micro-Interactions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-2.5">
              <span>งานที่รอดำเนินการ</span>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50/60 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
                {assignedCount}
              </h3>
              <span className="text-xs text-slate-500 font-medium">รายการ</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-amber-50/50 border border-amber-100 p-2 text-[11px] text-amber-800 font-medium">
            คิวงานรอเข้าซ่อม
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-blue-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-2.5">
              <span>กำลังดำเนินการซ่อม</span>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/60 flex items-center justify-center shrink-0">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-bold tracking-tight text-blue-700 font-mono">
                {inProgressCount}
              </h3>
              <span className="text-xs text-blue-600 font-medium">รายการ</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-blue-50/50 border border-blue-100 p-2 text-[11px] text-blue-800 font-medium">
            ปฏิบัติงานหน้างาน
          </div>
        </div>

        {/* Card 3: Resolved */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-2.5">
              <span>ซ่อมเสร็จสิ้นวันนี้</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-bold tracking-tight text-emerald-700 font-mono">
                {resolvedCount}
              </h3>
              <span className="text-xs text-emerald-600 font-medium">รายการ</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-emerald-50/50 border border-emerald-100 p-2 text-[11px] text-emerald-800 font-medium">
            ส่งมอบงานแล้ว
          </div>
        </div>

        {/* Card 4: Urgent */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-rose-700 font-semibold mb-2.5">
              <span>งานด่วนวิกฤต (SLA 15m)</span>
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 ring-4 ring-rose-50/60 flex items-center justify-center shrink-0">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-bold tracking-tight text-rose-600 font-mono">
                {urgentCount}
              </h3>
              <span className="text-xs text-rose-600 font-medium">รายการ</span>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-rose-50/50 border border-rose-100 p-2 text-[11px] text-rose-700 font-medium">
            เข้าหน้างานด่วน
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
              <div className="rounded-lg border border-slate-200 bg-white p-12 text-center space-y-3 shadow-sm">
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
