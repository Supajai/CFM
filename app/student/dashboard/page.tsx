// app/student/dashboard/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import MainNavbar from "@/components/navigation/MainNavbar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import {
  GraduationCap,
  Plus,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Paperclip,
  Activity,
  User,
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import BuildingFloorMap, { TicketSummary } from "@/components/building/BuildingFloorMap";
import DashboardViewContainer from "@/components/dashboard/DashboardViewContainer";
import { getRoomHeatmapStatsAction } from "@/actions/room";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "แดชบอร์ดนักศึกษา / ประวัติการแจ้งซ่อม | CampusOps",
  description: "จัดการและติดตามประวัติการแจ้งซ่อมบำรุงของนักศึกษาและบุคลากร",
};

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/student/dashboard");
  }

  // ดึงข้อมูลโปรไฟล์นักศึกษา
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  // ดึงข้อมูลตั๋วของฉัน, ตั๋วทั้งหมดในอาคารสำหรับแผนผัง 2.5D, และสถานะห้อง
  const [myTickets, buildingTickets, heatmapRes] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        OR: [
          { reporterId: user.id },
          { reporter: { email: user.email } },
          { reporter: { name: user.name } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        attachments: true,
        technician: true,
      },
    }),
    prisma.ticket.findMany({
      where: {
        status: { notIn: ["CLOSED", "CANCELLED"] },
      },
      select: {
        id: true,
        ticketNumber: true,
        title: true,
        category: true,
        priority: true,
        isUrgent: true,
        status: true,
        floor: true,
        room: true,
        roomName: true,
        specificPoint: true,
        createdAt: true,
        beforeImageUrl: true,
        afterImageUrl: true,
        reporterId: true,
        technicianId: true,
        technician: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getRoomHeatmapStatsAction(),
  ]);

  const heatmapStats = heatmapRes.success ? heatmapRes.data : [];

  // Format tickets for 2.5D Building Floor Map
  const formattedTickets: TicketSummary[] = buildingTickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    category: t.category,
    priority: t.priority,
    isUrgent: t.isUrgent || t.priority === "URGENT",
    status: t.status,
    floor: t.floor,
    room: t.room,
    roomName: t.roomName || t.room,
    roomId: t.room,
    roomCode: t.room,
    location: t.specificPoint ? `${t.roomName || t.room} • ${t.specificPoint}` : t.roomName || t.room,
    specificPoint: t.specificPoint,
    createdAt: t.createdAt.toISOString(),
    beforeImageUrl: t.beforeImageUrl,
    afterImageUrl: t.afterImageUrl,
    reporterId: t.reporterId,
    technicianId: t.technicianId,
    technicianName: t.technician?.name,
  }));

  // คำนวณ KPI Mini Cards
  const totalCount = myTickets.length;
  const pendingCount = myTickets.filter(
    (t) => t.status === "PENDING" || t.status === "ASSIGNED"
  ).length;
  const inProgressCount = myTickets.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = myTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            <span>รอตรวจสอบ</span>
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>มอบหมายช่างแล้ว</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>กำลังดำเนินการซ่อม</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>ซ่อมเสร็จสิ้น (RESOLVED)</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>ปิดงานสมบูรณ์</span>
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col font-sans">
      <MainNavbar currentUser={session} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-28">
        {/* 1. Header: Student Profile Card */}
        <div className="card-elevated p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-lg font-bold text-white shadow-md shadow-emerald-700/20">
              {user.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">{user.name}</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/80 shadow-2xs">
                  นักศึกษา / บุคลากร
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {user.studentId ? `รหัสประจำตัว: ${user.studentId}` : user.email}{" "}
                • {user.department || "แผนกเทคโนโลยีคอมพิวเตอร์"}
              </p>
              {user.phone && (
                <p className="text-xs text-slate-400 font-mono">
                  เบอร์โทรติดต่อ: {user.phone}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/report"
            className="flex items-center justify-center space-x-2 h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 px-5 text-xs font-bold text-white shadow-lg shadow-emerald-700/25 transition-all duration-150 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4 stroke-[2]" />
            <span>แจ้งปัญหา / ส่งคำร้องซ่อมใหม่</span>
          </Link>
        </div>

        {/* 2. KPI Mini Cards with Accent Glow & Hover Physics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                งานของฉันทั้งหมด
              </p>
              <h3 className="mt-1 font-mono text-3xl font-bold tracking-tight text-slate-900">
                {totalCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/60 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 stroke-[2]" />
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-700">
                รอดำเนินการ
              </p>
              <h3 className="mt-1 font-mono text-3xl font-bold tracking-tight text-amber-700">
                {pendingCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50/60 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 stroke-[2]" />
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-blue-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-700">
                กำลังดำเนินการซ่อม
              </p>
              <h3 className="mt-1 font-mono text-3xl font-bold tracking-tight text-blue-700">
                {inProgressCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50/60 flex items-center justify-center shrink-0">
              <Wrench className="h-5 w-5 stroke-[2]" />
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-800">
                ซ่อมเสร็จสิ้น / ปิดงาน
              </p>
              <h3 className="mt-1 font-mono text-3xl font-bold tracking-tight text-emerald-700">
                {resolvedCount}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/60 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* 3. Operational Mode Canvas: สลับระหว่างแผนผังอาคาร 2.5D และตารางรายการ */}
        <DashboardViewContainer
          roleLabel="USER (นักศึกษา / บุคลากร)"
          defaultView="map"
          mapView={
            <div className="space-y-4">
              <BuildingFloorMap
                initialFloor={1}
                tickets={formattedTickets}
                currentUserRole="USER"
                currentUserId={user.id}
                currentUserName={user.name}
                heatmapStats={heatmapStats}
                standalone={true}
              />
            </div>
          }
          listView={
            /* My Ticket History Table */
            <div id="history" className="rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden scroll-mt-6">
              <div className="border-b border-slate-200/80 p-5 flex flex-wrap items-center justify-between gap-4 bg-slate-50/60">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    ประวัติการแจ้งซ่อมของฉัน (My Service Tickets)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คลิกที่รายการใบงานเพื่อเปิดหน้าติดตามสถานะแบบเรียลไทม์
                  </p>
                </div>

                <span className="rounded-xl bg-white border border-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-800 font-mono shadow-2xs">
                  ทั้งหมด {totalCount} รายการ
                </span>
              </div>

              {myTickets.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3.5">รหัสตั๋ว</th>
                        <th className="px-4 py-3.5">หัวข้อ / อาการชำรุด</th>
                        <th className="px-4 py-3.5">สถานที่เกิดเหตุ</th>
                        <th className="px-4 py-3.5">สถานะงาน</th>
                        <th className="px-4 py-3.5">ช่างผู้รับผิดชอบ</th>
                        <th className="px-6 py-3.5 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myTickets.map((t, idx) => {
                        const cleanNumber = t.ticketNumber.replace("#", "");
                        return (
                          <tr
                            key={t.id}
                            className={`transition-colors group hover:bg-slate-50/80 ${
                              idx % 2 === 1 ? "bg-slate-50/30" : "bg-white/40"
                            }`}
                          >
                            {/* 1. Ticket Number */}
                            <td className="px-6 py-4 font-mono">
                              <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200/80 text-slate-800 px-2.5 py-1 rounded-md shadow-2xs">
                                {t.ticketNumber}
                              </span>
                              {t.isUrgent && (
                                <span className="block mt-1 font-sans text-[10px] text-rose-600 font-bold">
                                  • เร่งด่วนวิกฤต
                                </span>
                              )}
                            </td>

                            {/* 2. Issue Title */}
                            <td className="px-4 py-4 max-w-xs">
                              <p className="font-semibold text-slate-900 truncate group-hover:text-emerald-700 transition">
                                {t.title}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {t.description}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1 font-mono">
                                <Calendar className="h-3 w-3 stroke-[1.75]" />
                                <span>{timeAgoThai(t.createdAt)}</span>
                              </span>
                            </td>

                            {/* 3. Location */}
                            <td className="px-4 py-4">
                              <div className="flex items-start space-x-1.5">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0 stroke-[1.75]" />
                                <div>
                                  <p className="font-mono font-semibold text-slate-800">
                                    {t.room}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                    {t.building}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* 4. Status Badge */}
                            <td className="px-4 py-4">{getStatusBadge(t.status)}</td>

                            {/* 5. Technician */}
                            <td className="px-4 py-4">
                              {t.technician ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-xs font-bold text-white shadow-2xs">
                                    {t.technician.name.charAt(0)}
                                  </div>
                                  <span className="font-semibold text-slate-800 truncate">
                                    {t.technician.name.split(" ")[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-xs">
                                  รอมอบหมาย
                                </span>
                              )}
                            </td>

                            {/* 6. Action Button */}
                            <td className="px-6 py-4 text-right">
                              <Link
                                href={`/tracking/${cleanNumber}`}
                                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98]"
                              >
                                <span>ติดตามงาน</span>
                                <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200/80 shadow-2xs">
                    <Wrench className="h-6 w-6 stroke-[1.75]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">
                      คุณยังไม่มีประวัติการส่งคำร้องแจ้งซ่อม
                    </h3>
                    <p className="text-xs text-slate-500">
                      เมื่อคุณแจ้งปัญหาในสถานศึกษา รายการคำร้องจะปรากฏที่นี่เพื่อติดตามสถานะ
                    </p>
                  </div>
                  <Link
                    href="/report"
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-[0_2px_10px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98]"
                  >
                    <Plus className="h-4 w-4 stroke-[1.75]" />
                    <span>ส่งคำร้องแจ้งซ่อมแรกของคุณ</span>
                  </Link>
                </div>
              )}
            </div>
          }
        />
      </main>

      {/* 4. Mobile Bottom Navigation Shell */}
      <MobileBottomNav currentUser={session} />
    </div>
  );
}
