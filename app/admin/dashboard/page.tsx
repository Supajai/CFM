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
      {/* 1. Header: ศูนย์บริหารจัดการและจ่ายงานซ่อม อาคารแผนกเทคโนโลยีคอมพิวเตอร์ */}
      <div className="card-elevated p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    ศูนย์บริหารจัดการและจ่ายงานซ่อม
                  </h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> ระบบออนไลน์
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">
                  อาคารแผนกเทคโนโลยีคอมพิวเตอร์ • คัดกรอง จ่ายงาน และควบคุม SLA ช่างประจำแผนก
                </p>
              </div>
            </div>

            {/* Department Location Badge */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center space-x-2 rounded-xl bg-slate-50/80 px-3 py-1.5 border border-slate-200/80 text-slate-700 shadow-2xs">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-medium">{DEPARTMENT_BUILDING_NAME}</span>
                <span className="font-mono text-xs text-slate-700 bg-white border border-slate-200 py-0.5 px-2 rounded-lg font-bold shadow-2xs">
                  4 Floors • 12 Rooms
                </span>
              </div>

              <div className="inline-flex items-center space-x-2 rounded-xl bg-slate-50/80 px-3 py-1.5 border border-slate-200/80 text-slate-700 text-xs font-medium shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>ผู้ดูแลระบบ: <strong className="text-slate-900">{session.name}</strong></span>
                <span className="font-mono text-xs text-slate-700 bg-white border border-slate-200 py-0.5 px-1.5 rounded-md font-bold">{session.role}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              href="/admin/triage"
              className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-700/25 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            >
              <span>เปิดคิวจ่ายงานช่าง</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Operational KPIs - Modern Crafted Accent Glow Cards with Micro-Interactions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2.5">
              <span>ใบงานทั้งหมดในอาคาร</span>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50/60 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {totalTickets}
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-500 font-medium">
            ครอบคลุมทุกห้องและพื้นที่ชั้น 1-4
          </div>
        </div>

        {/* Urgent Critical */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-rose-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-rose-700 font-semibold mb-2.5">
              <span>งานเร่งด่วนวิกฤต (SLA 15m)</span>
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 ring-4 ring-rose-50/60 flex items-center justify-center shrink-0">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-rose-600 font-mono">
              {urgentCount}
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-rose-50/50 border border-rose-100 p-2 text-[11px] text-rose-700 font-medium">
            ต้องส่งช่างถึงจุดเกิดเหตุทันที
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-2.5">
              <span>กำลังดำเนินการซ่อม</span>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50/60 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-amber-700 font-mono">
              {inProgressCount}
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-amber-50/50 border border-amber-100 p-2 text-[11px] text-amber-800 font-medium">
            ช่างกำลังปฏิบัติงานหน้างาน
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 p-5 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-2.5">
              <span>แก้ไขสำเร็จ / ปิดงาน</span>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 ring-4 ring-emerald-50/60 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-emerald-700 font-mono">
              {resolvedCount}
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-emerald-50/50 border border-emerald-100 p-2 text-[11px] text-emerald-800 font-medium">
            ปิดงานสมบูรณ์เรียบร้อยแล้ว
          </div>
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
                      className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-800 text-xs font-bold text-white shadow-sm">
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

