// app/admin/tickets/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Layers,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ExternalLink,
  Search,
  ShieldCheck,
  Tag,
  Wrench,
  CheckCircle,
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UnassignedAdminWarning from "@/components/admin/UnassignedAdminWarning";
import BuildingFilterDropdown from "@/components/admin/BuildingFilterDropdown";
import MasterTicketArchiveTable from "@/components/admin/MasterTicketArchiveTable";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ตั๋วแจ้งซ่อมทั้งหมดในระบบ | CampusOps",
  description: "ศูนย์รวมฐานข้อมูลใบงานแจ้งซ่อมบำรุงอาคารสถานที่ทั้งหมด",
};

interface AdminTicketsPageProps {
  searchParams?: {
    buildingId?: string;
  };
}

export default async function AdminTicketsPage({ searchParams }: AdminTicketsPageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin/tickets");
  }

  const isSuperAdmin = session.role === "SUPER_ADMIN";

  let managedBuildings: Array<{ id: string; code: string; name: string }> = [];
  let allBuildingsForFilter: Array<{ id: string; code: string; name: string }> = [];

  if (!isSuperAdmin) {
    managedBuildings = await prisma.building.findMany({
      where: { adminId: session.userId },
      select: { id: true, code: true, name: true },
      orderBy: { code: "asc" },
    });

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

  const [allTickets, technicians] = await Promise.all([
    prisma.ticket.findMany({
      where: ticketScopeWhere,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: true,
        technician: true,
        attachments: true,
      },
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
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedTickets = allTickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    title: t.title,
    description: t.description,
    category: t.category,
    building: t.building,
    floor: t.floor,
    room: t.room,
    roomName: t.roomName,
    specificPoint: t.specificPoint,
    priority: t.priority,
    isUrgent: t.isUrgent,
    slaTargetMinutes: t.slaTargetMinutes,
    status: t.status,
    rating: t.rating,
    feedback: t.feedback,
    cancelReason: t.cancelReason,
    stepNote: t.stepNote,
    createdAt: t.createdAt.toISOString(),
    resolvedAt: t.resolvedAt ? t.resolvedAt.toISOString() : null,
    closedAt: t.closedAt ? t.closedAt.toISOString() : null,
    beforeImageUrl: t.beforeImageUrl,
    afterImageUrl: t.afterImageUrl,
    resolutionDetail: t.resolutionDetail,
    reporter: t.reporter
      ? {
          id: t.reporter.id,
          name: t.reporter.name,
          email: t.reporter.email,
          phone: t.reporter.phone,
          role: t.reporter.role,
          position: t.reporter.position,
        }
      : null,
    technician: t.technician
      ? {
          id: t.technician.id,
          name: t.technician.name,
          technicianCode: t.technician.technicianCode,
          phone: t.technician.phone,
        }
      : null,
    technicianId: t.technicianId,
    attachments: t.attachments.map((a) => ({
      id: a.id,
      url: a.url,
      type: a.type,
      fileName: a.fileName,
    })),
  }));

  const selectedBuildingObj =
    isSuperAdmin && searchParams?.buildingId && searchParams.buildingId !== "ALL"
      ? allBuildingsForFilter.find((b) => b.id === searchParams.buildingId)
      : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Card */}
      <div className="card-elevated p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-emerald-50/25">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <Layers className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  ตั๋วแจ้งซ่อมทั้งหมด (Master Ticket Archive)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  ศูนย์รวมฐานข้อมูลใบงานแจ้งซ่อมบำรุงประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์
                </p>
              </div>
            </div>

            {/* Scoped Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {!isSuperAdmin ? (
                <div className="inline-flex items-center space-x-2 rounded-xl bg-emerald-50/90 px-3 py-1.5 border border-emerald-200/90 text-emerald-900 shadow-xs">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                  <span className="text-xs font-medium text-emerald-800">อาคารที่รับผิดชอบ:</span>
                  <span className="text-xs font-bold text-emerald-950">
                    {managedBuildings.map((b) => b.name).join(", ")}
                  </span>
                  <span className="chip-tech text-[10px] text-emerald-900 bg-white border-emerald-200 py-0.5 px-1.5">
                    {managedBuildings.map((b) => b.code).join(", ")}
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center space-x-2 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200 text-slate-800 shadow-xs">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 stroke-[1.75]" />
                    <span className="text-xs font-semibold text-slate-800">
                      {selectedBuildingObj
                        ? `กรองเฉพาะ: [${selectedBuildingObj.code}] ${selectedBuildingObj.name}`
                        : "ดูได้ทุกพื้นที่ (Super Admin View)"}
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

          <div className="shrink-0 flex items-center">
            <span className="chip-tech text-xs font-bold text-slate-800 bg-slate-100/90 border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
              พบทั้งหมด <strong className="text-emerald-700 font-mono text-sm">{allTickets.length}</strong> รายการ
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Data Table with Admin Dispatch & Triage Modal */}
      <MasterTicketArchiveTable
        initialTickets={serializedTickets}
        technicians={technicians}
      />
    </div>
  );
}

