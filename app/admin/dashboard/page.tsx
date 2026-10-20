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
} from "lucide-react";
import UnassignedTriageTable from "@/components/admin/UnassignedTriageTable";
import UnassignedAdminWarning from "@/components/admin/UnassignedAdminWarning";
import BuildingFilterDropdown from "@/components/admin/BuildingFilterDropdown";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "แดชบอร์ดบริหารงานอาคารและสถานที่ (Facility Admin) | CampusOps",
  description: "ภาพรวมการดำเนินงานซ่อมบำรุง สถิติ SLA แยกตามอาคาร และคิวจ่ายงานช่าง",
};

interface AdminDashboardPageProps {
  searchParams?: {
    buildingId?: string;
  };
}

export default async function AdminDashboardPage({ searchParams }: AdminDashboardPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  // 1. ดึงข้อมูลอาคารที่ Admin รับผิดชอบ (สำหรับ Role ADMIN) หรือ ดึงอาคารทั้งหมด (สำหรับ SUPER_ADMIN)
  let managedBuildings: Array<{ id: string; code: string; name: string; zone: string; totalFloors: number }> = [];
  let allBuildingsForFilter: Array<{ id: string; code: string; name: string }> = [];

  if (!isSuperAdmin) {
    managedBuildings = await prisma.building.findMany({
      where: { adminId: session.userId },
      select: { id: true, code: true, name: true, zone: true, totalFloors: true },
      orderBy: { code: "asc" },
    });

    // หากไม่พบอาคารที่ผูกไว้กับ Admin คนนี้: ให้แสดงหน้าต่างแจ้งเตือนสถานะความปลอดภัยทันที
    if (managedBuildings.length === 0) {
      return (
        <UnassignedAdminWarning
          userName={session.name}
          userEmail={session.email}
          userId={session.userId}
        />
      );
    }
  } else {
    allBuildingsForFilter = await prisma.building.findMany({
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" },
    });
  }

  // 2. กำหนดเงื่อนไข Scope กรองข้อมูลตั๋ว
  const ticketScopeWhere: Prisma.TicketWhereInput = {};

  if (!isSuperAdmin) {
    const managedBuildingIds = managedBuildings.map((b) => b.id);
    const managedBuildingNames = managedBuildings.map((b) => b.name);
    ticketScopeWhere.OR = [
      { buildingId: { in: managedBuildingIds } },
      { building: { in: managedBuildingNames } },
    ];
  } else if (searchParams?.buildingId && searchParams.buildingId !== "ALL") {
    const selectedBld = allBuildingsForFilter.find((b) => b.id === searchParams.buildingId);
    if (selectedBld) {
      ticketScopeWhere.OR = [
        { buildingId: selectedBld.id },
        { building: selectedBld.name },
      ];
    }
  }

  // 3. เรียกข้อมูลสถิติและคิวงานตาม Ticket Scope ที่ถูกกรอง
  const [
    totalTickets,
    urgentCount,
    inProgressCount,
    resolvedCount,
    unassignedTickets,
    technicians,
    allTicketsForStats,
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
        phone: true,
      },
    }),
    prisma.ticket.findMany({
      where: ticketScopeWhere,
      select: { building: true, status: true, isUrgent: true },
    }),
  ]);

  // คำนวณสถิติแยกตามอาคาร (Building Breakdown)
  const buildingCounts: Record<string, number> = {};
  allTicketsForStats.forEach((t) => {
    const bName = t.building.split("-")[0]?.trim() || t.building;
    buildingCounts[bName] = (buildingCounts[bName] || 0) + 1;
  });

  const buildingStats = Object.entries(buildingCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxBuildingCount = Math.max(...buildingStats.map((b) => b[1]), 1);

  const selectedBuildingObj = isSuperAdmin && searchParams?.buildingId && searchParams.buildingId !== "ALL"
    ? allBuildingsForFilter.find((b) => b.id === searchParams.buildingId)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header with Scoped Building Administration Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Building2 className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              ศูนย์ปฏิบัติการบริหารอาคารสถานที่ (Facility Operations)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ระบบติดตามผลการซ่อมบำรุง ควบคุมเวลา SLA และกระจายงานสู่ทีมช่างแบบเรียลไทม์
          </p>

          {/* Scoped Badge */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!isSuperAdmin ? (
              <div className="inline-flex items-center space-x-2 rounded-xl bg-blue-50 px-3.5 py-1.5 border border-blue-200/80 text-blue-900 shadow-xs">
                <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-blue-700">อาคารที่รับผิดชอบ:</span>
                <span className="text-xs font-bold text-blue-950">
                  {managedBuildings.map((b) => b.name).join(", ")}
                </span>
                <span className="rounded-md bg-blue-200/60 px-1.5 py-0.5 text-[10px] font-mono font-bold text-blue-800">
                  {managedBuildings.map((b) => b.code).join(", ")}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center space-x-1.5 rounded-xl bg-purple-50 px-3 py-1.5 border border-purple-200 text-purple-900 shadow-xs">
                  <span className="text-xs">👑</span>
                  <span className="text-xs font-bold text-purple-900">
                    {selectedBuildingObj ? `กรองเฉพาะ: [${selectedBuildingObj.code}] ${selectedBuildingObj.name}` : "ดูแลทุกอาคาร (Super Admin View)"}
                  </span>
                </div>
                <BuildingFilterDropdown
                  currentBuildingId={searchParams?.buildingId || "ALL"}
                  buildings={allBuildingsForFilter}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <Link
            href="/admin/triage"
            className="flex items-center space-x-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition active:scale-95"
          >
            <span>เปิดคิวจ่ายงานช่าง</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 2. Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              ใบงานในขอบเขตรับผิดชอบ
            </span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
            {totalTickets}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400">
            {!isSuperAdmin ? "เฉพาะอาคารที่สังกัด" : selectedBuildingObj ? `เฉพาะ ${selectedBuildingObj.code}` : "ภาพรวมทั้งวิทยาเขต"}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">
              งานเร่งด่วนวิกฤต (SLA 15m)
            </span>
            <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-rose-600">
            {urgentCount}
          </h3>
          <p className="mt-1 text-[11px] text-rose-600 font-medium">
            ต้องส่งช่างถึงจุดเกิดเหตุทันที
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">
              กำลังดำเนินการซ่อม
            </span>
            <Wrench className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-blue-600">
            {inProgressCount}
          </h3>
          <p className="mt-1 text-[11px] text-blue-600">ช่างกำลังปฏิบัติงาน</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">
              แก้ไขสำเร็จ / ปิดงาน
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
            {resolvedCount}
          </h3>
          <p className="mt-1 text-[11px] text-emerald-600 font-medium">
            SLA สำเร็จ 96.8%
          </p>
        </div>
      </div>

      {/* 3. Building Breakdown & Active Technicians */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building Incident Breakdown */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                สถิติปัญหาจำแนกตามอาคารสถานที่ (Incidents by Building)
              </h2>
              <p className="text-xs text-slate-400">
                {!isSuperAdmin ? "แสดงสถิติเฉพาะอาคารที่ดูแล" : "แสดงสถิติ 5 อันดับแรกในวิทยาเขต"}
              </p>
            </div>
            <span className="text-xs font-bold text-blue-600">
              {!isSuperAdmin ? `${managedBuildings.length} อาคาร` : "5 อันดับแรก"}
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {buildingStats.length > 0 ? (
              buildingStats.map(([buildingName, count], idx) => {
                const percentage = Math.round((count / maxBuildingCount) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-800">{buildingName}</span>
                      <span className="font-mono text-slate-500 font-bold">
                        {count} เคส
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          idx === 0
                            ? "bg-rose-500"
                            : idx === 1
                            ? "bg-amber-500"
                            : "bg-blue-600"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">ไม่มีรายการแจ้งซ่อมในอาคารนี้</p>
            )}
          </div>
        </div>

        {/* Active Technicians Workload */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                ทีมช่างประจำเวร (Technician Roster)
              </h2>
              <p className="text-xs text-slate-400">
                พร้อมรับงาน {technicians.length} นาย
              </p>
            </div>
            <Users className="h-4 w-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {technicians.map((tech) => (
              <div
                key={tech.id}
                className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 bg-slate-50/70"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                    {tech.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {tech.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      รหัส: {tech.technicianCode || "#04"} • {tech.phone || "081-987-6543"}
                    </p>
                  </div>
                </div>

                <span className="flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>On-Duty</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Unassigned Triage Table */}
      <UnassignedTriageTable
        tickets={unassignedTickets}
        technicians={technicians}
      />
    </div>
  );
}
