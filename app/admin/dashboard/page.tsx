// app/admin/dashboard/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Building2,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  TrendingUp,
  Users,
  Layers,
  ShieldCheck,
  Calendar,
  ExternalLink,
  MapPin,
  Shield,
  Award,
  Sparkles,
  Activity,
} from "lucide-react";
import UnassignedTriageTable from "@/components/admin/UnassignedTriageTable";
import DepartmentTicketFilter from "@/components/admin/DepartmentTicketFilter";
import RoomHeatmapWidget from "@/components/admin/RoomHeatmapWidget";
import BuildingFloorMap, { TicketSummary, TechnicianOption } from "@/components/building/BuildingFloorMap";
import DashboardViewContainer from "@/components/dashboard/DashboardViewContainer";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma, Category } from "@prisma/client";
import { DEPARTMENT_BUILDING_NAME } from "@/lib/constants/department-locations";
import { getRoomHeatmapStatsAction } from "@/actions/room";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ศูนย์บริหารจัดการและจ่ายงานซ่อม อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ | CampusOps",
  description: "ภาพรวมการดำเนินงานซ่อมบำรุง สถิติ SLA แยกตามห้องแล็บ และคิวจ่ายงานช่างประจำแผนก",
};

interface AdminDashboardPageProps {
  searchParams?: {
    floor?: string;
    room?: string;
    category?: string;
  };
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  // 1. เงื่อนไข Scope กรองข้อมูลตั๋วในอาคารแผนก
  const ticketScopeWhere: Prisma.TicketWhereInput = {};

  if (searchParams?.floor && searchParams.floor !== "ALL") {
    const floorNum = parseInt(searchParams.floor, 10);
    if (!isNaN(floorNum)) {
      ticketScopeWhere.floor = floorNum;
    }
  }

  if (searchParams?.room && searchParams.room !== "ALL") {
    ticketScopeWhere.OR = [
      { room: { contains: searchParams.room, mode: "insensitive" } },
      { roomName: { contains: searchParams.room, mode: "insensitive" } },
    ];
  }

  if (searchParams?.category && searchParams.category !== "ALL") {
    ticketScopeWhere.category = searchParams.category as Category;
  }

  // 2. ดึงข้อมูลสถิติ คิวงาน และช่างประจำแผนก
  const [
    totalTickets,
    urgentCount,
    inProgressCount,
    resolvedCount,
    unassignedTickets,
    technicians,
    heatmapRes,
    activeFloorTickets,
  ] = await Promise.all([
    prisma.ticket.count({ where: ticketScopeWhere }),
    prisma.ticket.count({ where: { ...ticketScopeWhere, isUrgent: true } }),
    prisma.ticket.count({ where: { ...ticketScopeWhere, status: "IN_PROGRESS" } }),
    prisma.ticket.count({
      where: {
        ...ticketScopeWhere,
        status: { in: ["RESOLVED", "CLOSED"] },
      },
    }),
    prisma.ticket.findMany({
      where: {
        AND: [
          ticketScopeWhere,
          {
            OR: [
              { status: "PENDING" },
              { technicianId: null, status: { notIn: ["RESOLVED", "CLOSED", "CANCELLED"] } },
            ],
          },
        ],
      },
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
      include: { reporter: true },
    }),
    prisma.user.findMany({
      where: { role: "TECHNICIAN" },
      select: {
        id: true,
        name: true,
        email: true,
        technicianCode: true,
        department: true,
        specialty: true,
        phone: true,
      },
      orderBy: { name: "asc" },
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
  const formattedFloorTickets: TicketSummary[] = activeFloorTickets.map((t) => ({
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

  // Format technicians for Quick Assignment
  const formattedTechs: TechnicianOption[] = technicians.map((tech) => ({
    id: tech.id,
    name: tech.name,
    technicianCode: tech.technicianCode,
    specialties: tech.specialty ? [tech.specialty] : ["ช่างเทคนิคทั่วไป"],
    activeTasksCount: activeFloorTickets.filter((t) => t.technicianId === tech.id).length,
    phone: tech.phone,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header: ศูนย์บริหารจัดการและจ่ายงานซ่อม อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ */}
      <div className="card-elevated p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-emerald-50/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial-glow pointer-events-none -mr-20 -mt-20 opacity-60" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <Building2 className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    ศูนย์บริหารจัดการและจ่ายงานซ่อม
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Activity className="w-3 h-3 mr-1 text-emerald-600 animate-pulse stroke-[2]" /> Live Hub
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ • คัดกรอง จ่ายงาน และควบคุม SLA ช่างประจำแผนก
                </p>
              </div>
            </div>

            {/* Department Location Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center space-x-2 rounded-xl bg-emerald-50/90 px-3 py-1.5 border border-emerald-200/90 text-emerald-900 shadow-xs">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                <span className="text-xs font-semibold">{DEPARTMENT_BUILDING_NAME}</span>
                <span className="chip-tech text-[10px] text-emerald-800 bg-white border-emerald-200 py-0.5 px-2">
                  4 Floors • 12 Rooms
                </span>
              </div>

              <div className="inline-flex items-center space-x-2 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                <span>ผู้ดูแลระบบ: <strong className="text-slate-900">{session.name}</strong></span>
                <span className="chip-tech text-[10px] py-0.5 px-1.5">{session.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/admin/triage"
              className="btn-primary-gradient flex items-center space-x-2 px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide"
            >
              <span>เปิดคิวจ่ายงานช่าง</span>
              <ArrowRight className="h-4 w-4 stroke-[1.75]" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ใบงานทั้งหมดในอาคาร
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
              <Layers className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            {totalTickets}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            ครอบคลุมทุกห้องแล็บและพื้นที่ชั้น 1-4
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-200 to-slate-400" />
        </div>

        <div className="card-elevated p-5 relative overflow-hidden border-rose-200/80 bg-rose-50/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              งานเร่งด่วนวิกฤต (SLA 15m)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
              <Flame className="h-4 w-4 stroke-[1.75] animate-pulse" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-rose-600 font-mono">
            {urgentCount}
          </h3>
          <p className="mt-1.5 text-xs text-rose-600 font-medium">
            ต้องส่งช่างถึงจุดเกิดเหตุทันที
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
        </div>

        <div className="card-elevated p-5 relative overflow-hidden border-blue-200/80 bg-blue-50/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              กำลังดำเนินการซ่อม
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Wrench className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-blue-600 font-mono">
            {inProgressCount}
          </h3>
          <p className="mt-1.5 text-xs text-blue-600 font-medium">ช่างกำลังปฏิบัติงานหน้างาน</p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-600" />
        </div>

        <div className="card-elevated p-5 relative overflow-hidden border-emerald-200/80 bg-emerald-50/30 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              แก้ไขสำเร็จ / ปิดงาน
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">
            {resolvedCount}
          </h3>
          <p className="mt-1.5 text-xs text-emerald-600 font-medium">
            ส่งมอบงานและผ่านการตรวจรับ
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
        </div>
      </div>

      {/* 3. Operational Mode Canvas: สลับระหว่างแผนผังอาคาร 2.5D และตารางรายการ */}
      <DashboardViewContainer
        roleLabel="ADMIN (ผู้ดูแลอาคาร)"
        defaultView="map"
        mapView={
          <div className="space-y-4">
            <BuildingFloorMap
              initialFloor={1}
              tickets={formattedFloorTickets}
              currentUserRole="ADMIN"
              currentUserId={session.userId}
              currentUserName={session.name}
              technicians={formattedTechs}
              heatmapStats={heatmapStats}
              standalone={true}
            />
          </div>
        }
        listView={
          <div className="space-y-6">
            {/* Filter กรองตาม ชั้น, ห้องแล็บ, และหมวดหมู่ปัญหา */}
            <DepartmentTicketFilter />

            {/* สรุปสถิติจำนวนตั๋วแยกตามห้อง (Room Heatmap Widget) & ช่างประจำแผนก */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Room Heatmap Widget (2 คอลัมน์) */}
              <div className="lg:col-span-2">
                <RoomHeatmapWidget stats={heatmapStats} />
              </div>

              {/* ช่างเทคนิคประจำอาคารแผนก พร้อมสายงานความเชี่ยวชาญ */}
              <div className="card-elevated p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                      <span>ทีมช่างประจำแผนก</span>
                      <span className="chip-tech text-[10px] text-emerald-800 bg-emerald-50 border-emerald-200 py-0.5 px-2">
                        {technicians.length} นาย
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      พร้อมจ่ายงานและสแตนด์บายในอาคาร
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Users className="h-4 w-4 stroke-[1.75]" />
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {technicians.map((tech) => (
                    <div
                      key={tech.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-xs font-bold text-white shadow-xs">
                            {tech.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              รหัส: <span className="font-semibold text-slate-700">{tech.technicianCode || "-"}</span> • {tech.phone || "ต่อ 248"}
                            </p>
                          </div>
                        </div>

                        <span className="flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>พร้อมรับงาน</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-700 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        <Award className="h-3.5 w-3.5 shrink-0 text-emerald-600 stroke-[1.75]" />
                        <span className="truncate font-medium">
                          {tech.specialty || "ช่างประจำห้องปฏิบัติการ"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Unassigned Triage Table พร้อมระบบแนะนำช่างตรงสายงาน */}
            <UnassignedTriageTable
              tickets={unassignedTickets}
              technicians={technicians}
            />
          </div>
        }
      />
    </div>
  );
}

