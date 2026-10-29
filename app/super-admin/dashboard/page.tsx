// app/super-admin/dashboard/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Crown,
  Shield,
  Users,
  Database,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sliders,
  History,
  Activity,
  Sparkles,
} from "lucide-react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import BuildingFloorMap, { TicketSummary } from "@/components/building/BuildingFloorMap";
import DashboardViewContainer from "@/components/dashboard/DashboardViewContainer";
import { getRoomHeatmapStatsAction } from "@/actions/room";

export const metadata: Metadata = {
  title: "ศูนย์ควบคุมระบบและความปลอดภัย (Super Admin) | CampusOps",
  description: "ศูนย์ควบคุมระบบ สถานะฐานข้อมูล และการกำกับดูแลสิทธิ์ผู้ใช้งาน",
};

export default async function SuperAdminDashboardPage() {
  const session = await getSession();

  const [
    totalUsers,
    superAdminCount,
    adminCount,
    technicianCount,
    studentCount,
    totalTickets,
    recentUsers,
    heatmapRes,
    allTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "TECHNICIAN" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.ticket.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    getRoomHeatmapStatsAction(),
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
  ]);

  const heatmapStats = heatmapRes.success ? heatmapRes.data : [];

  // Format tickets for 2.5D Building Floor Map
  const formattedTickets: TicketSummary[] = allTickets.map((t) => ({
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* 1. Header Card */}
      <div className="card-elevated p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-emerald-50/25">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md shadow-purple-500/20">
                <Crown className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  ศูนย์ควบคุมความปลอดภัยและระบบ (System & Governance Hub)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  บริหารจัดการสถาปัตยกรรมระบบ สิทธิ์ผู้ใช้ 4 ระดับ และการเชื่อมต่อฐานข้อมูลส่วนกลาง
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 rounded-xl bg-purple-50 px-3 py-1.5 border border-purple-200 text-purple-900 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5 text-purple-600 stroke-[2]" />
                <span>Super Administrator Privilege Level</span>
              </span>
              <span className="chip-tech text-xs">
                ผู้ใช้งานทั้งหมด: <strong className="text-slate-900 font-mono">{totalUsers}</strong> บัญชี
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <Link
              href="/super-admin/users"
              className="btn-primary-gradient flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-semibold"
            >
              <Shield className="h-4 w-4 stroke-[1.75]" />
              <span>จัดการสิทธิ์ผู้ใช้งาน (RBAC)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Operational Mode Canvas: สลับระหว่างแผนผังอาคาร 2.5D และตารางรายการ */}
      <DashboardViewContainer
        roleLabel="SUPER_ADMIN (ผู้ดูแลระบบสูงสุด)"
        defaultView="map"
        mapView={
          <div className="space-y-4">
            <BuildingFloorMap
              initialFloor={1}
              tickets={formattedTickets}
              currentUserRole="SUPER_ADMIN"
              currentUserId={session?.userId}
              currentUserName={session?.name}
              heatmapStats={heatmapStats}
              standalone={true}
            />
          </div>
        }
        listView={
          <div className="space-y-6">
            {/* System Infrastructure Health Bar */}
            <div className="card-elevated p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Server className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      สถานะโครงสร้างพื้นฐานระบบ (System Infrastructure Health)
                    </h2>
                    <p className="text-xs text-slate-500">
                      การเชื่อมต่อฐานข้อมูล เซิร์ฟเวอร์ และความปลอดภัยของระบบ
                    </p>
                  </div>
                </div>
                <span className="flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Systems Operational</span>
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white p-3.5 space-y-1.5 transition-all shadow-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 text-xs font-semibold">
                    <Database className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                    <span>ฐานข้อมูลหลัก</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono">PostgreSQL 17</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">● Localhost :5432 (Connected)</p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white p-3.5 space-y-1.5 transition-all shadow-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 text-xs font-semibold">
                    <Cpu className="h-3.5 w-3.5 text-blue-600 stroke-[1.75]" />
                    <span>เว็บเฟรมเวิร์ก</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono">Next.js 14</p>
                  <p className="text-[10px] text-slate-500 font-medium">App Router & Server Actions</p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white p-3.5 space-y-1.5 transition-all shadow-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 text-xs font-semibold">
                    <Lock className="h-3.5 w-3.5 text-amber-600 stroke-[1.75]" />
                    <span>ความปลอดภัย</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono">JWT + Bcrypt</p>
                  <p className="text-[10px] text-slate-500 font-medium">HTTP-Only Edge Cookie</p>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white p-3.5 space-y-1.5 transition-all shadow-xs">
                  <div className="flex items-center space-x-1.5 text-slate-600 text-xs font-semibold">
                    <Layers className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                    <span>ORM & Data Synced</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 font-mono">Prisma ORM 5.x</p>
                  <p className="text-[10px] text-slate-500 font-medium font-mono">{totalTickets} tickets synced</p>
                </div>
              </div>
            </div>

            {/* User Role Distribution */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-tight text-slate-900">
                  สัดส่วนผู้ใช้งานจำแนกตาม 4 บทบาท (Role-Based Distribution)
                </h2>
                <span className="chip-tech text-xs">
                  สมาชิกรวม {totalUsers} บัญชี
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-elevated p-5 relative overflow-hidden group">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <span>Super Admin</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Crown className="h-4 w-4 stroke-[1.75]" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-purple-700 font-mono">{superAdminCount}</h3>
                  <p className="mt-1 text-xs text-slate-500 font-medium">สิทธิ์สูงสุด จัดการระบบ & สิทธิ์</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-600" />
                </div>

                <div className="card-elevated p-5 relative overflow-hidden group">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <span>Admin แผนก</span>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Users className="h-4 w-4 stroke-[1.75]" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">{adminCount}</h3>
                  <p className="mt-1 text-xs text-slate-500 font-medium">คัดกรอง จ่ายงาน และดูสถิติ SLA</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
                </div>

                <div className="card-elevated p-5 relative overflow-hidden group">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-700 uppercase tracking-wider">
                    <span>Technician ช่าง</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Activity className="h-4 w-4 stroke-[1.75]" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-amber-600 font-mono">{technicianCount}</h3>
                  <p className="mt-1 text-xs text-amber-700 font-medium">ปฏิบัติงานภาคสนาม & คันบัน</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
                </div>

                <div className="card-elevated p-5 relative overflow-hidden group">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    <span>User ทั่วไป</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 stroke-[1.75]" />
                    </div>
                  </div>
                  <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">{studentCount}</h3>
                  <p className="mt-1 text-xs text-emerald-700 font-medium">แจ้งซ่อมและติดตามประวัติตัวเอง</p>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
                </div>
              </div>
            </div>

            {/* Quick Governance Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link
                href="/super-admin/users"
                className="card-elevated p-5 hover:border-emerald-500/60 transition-all group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Shield className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    จัดการผู้ใช้และปรับสิทธิ์ (RBAC Table)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ปรับเปลี่ยนระดับสิทธิ์ของบุคลากรรายบุคคลแบบเรียลไทม์
                  </p>
                </div>
              </Link>

              <Link
                href="/super-admin/settings"
                className="card-elevated p-5 hover:border-emerald-500/60 transition-all group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <Sliders className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    ตั้งค่าห้องและ SLA แผนก (Master Data)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    จัดการรายชื่อห้องในอาคาร 4 ชั้น และเป้าหมาย SLA 7 หมวดหมู่
                  </p>
                </div>
              </Link>

              <Link
                href="/super-admin/audit"
                className="card-elevated p-5 hover:border-emerald-500/60 transition-all group space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                    <History className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    บันทึกประวัติความปลอดภัย (System Audit)
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    ตรวจสอบประวัติการเปลี่ยนสถานะตั๋ว และการดำเนินการของผู้ดูแลระบบ
                  </p>
                </div>
              </Link>
            </div>
          </div>
        }
      />
    </div>
  );
}

