// app/admin/triage/page.tsx
import prisma from "@/lib/prisma";
import UnassignedTriageTable from "@/components/admin/UnassignedTriageTable";
import UnassignedAdminWarning from "@/components/admin/UnassignedAdminWarning";
import BuildingFilterDropdown from "@/components/admin/BuildingFilterDropdown";
import { Inbox, MapPin } from "lucide-react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "คัดกรองและจ่ายงานช่าง (Triage Queue) | CampusOps",
  description: "คิวจัดสรรและจ่ายงานช่างตามความเชี่ยวชาญและระดับความเร่งด่วน",
};

interface AdminTriagePageProps {
  searchParams?: {
    buildingId?: string;
  };
}

export default async function AdminTriagePage({ searchParams }: AdminTriagePageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin/triage");
  }

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  // 1. ดึงข้อมูลอาคารที่ดูแล
  let managedBuildings: Array<{ id: string; code: string; name: string }> = [];
  let allBuildingsForFilter: Array<{ id: string; code: string; name: string }> = [];

  if (!isSuperAdmin) {
    managedBuildings = await prisma.building.findMany({
      where: { adminId: session.userId },
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" },
    });

    // หากไม่พบอาคารที่ผูกไว้กับ Admin คนนี้
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

  // 2. เงื่อนไข Scope กรองใบงานที่ยังไม่ได้มอบหมาย
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

  const [unassignedTickets, technicians] = await Promise.all([
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
      },
    }),
  ]);

  const selectedBuildingObj = isSuperAdmin && searchParams?.buildingId && searchParams.buildingId !== "ALL"
    ? allBuildingsForFilter.find((b) => b.id === searchParams.buildingId)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Inbox className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              คัดกรองและจ่ายงานช่าง (Triage & Work Dispatch)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            คัดกรองความเร่งด่วน ตรวจสอบพิกัด และมอบหมายงานให้ช่างที่มีเวรปฏิบัติการทันที
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
                    {selectedBuildingObj ? `กรองเฉพาะ: [${selectedBuildingObj.code}] ${selectedBuildingObj.name}` : "จ่ายงานได้ทุกอาคาร (Super Admin View)"}
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
      </div>

      <UnassignedTriageTable
        tickets={unassignedTickets}
        technicians={technicians}
      />
    </div>
  );
}
