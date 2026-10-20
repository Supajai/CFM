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
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import UnassignedAdminWarning from "@/components/admin/UnassignedAdminWarning";
import BuildingFilterDropdown from "@/components/admin/BuildingFilterDropdown";
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

  const allTickets = await prisma.ticket.findMany({
    where: ticketScopeWhere,
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      technician: true,
      attachments: true,
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">รอตรวจสอบ</span>;
      case "ASSIGNED":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">มอบหมายแล้ว</span>;
      case "IN_PROGRESS":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold">กำลังซ่อม</span>;
      case "RESOLVED":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">ซ่อมเสร็จ</span>;
      case "CLOSED":
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">ปิดงาน</span>;
      default:
        return <span>{status}</span>;
    }
  };

  const selectedBuildingObj = isSuperAdmin && searchParams?.buildingId && searchParams.buildingId !== "ALL"
    ? allBuildingsForFilter.find((b) => b.id === searchParams.buildingId)
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <Layers className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              ตั๋วแจ้งซ่อมทั้งหมด (Master Ticket Archive)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            ศูนย์รวมฐานข้อมูลใบงานแจ้งซ่อมบำรุงอาคารสถานที่
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
                    {selectedBuildingObj ? `กรองเฉพาะ: [${selectedBuildingObj.code}] ${selectedBuildingObj.name}` : "ดูได้ทุกอาคาร (Super Admin View)"}
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

        <span className="rounded-2xl bg-slate-100 px-4 py-2 font-mono text-xs font-bold text-slate-700">
          พบทั้งหมด {allTickets.length} รายการ
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {allTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">รหัสตั๋ว</th>
                  <th className="px-4 py-3.5">หัวข้อปัญหา</th>
                  <th className="px-4 py-3.5">อาคาร / สถานที่</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-4 py-3.5">ช่างผู้รับผิดชอบ</th>
                  <th className="px-4 py-3.5">เวลาที่แจ้ง</th>
                  <th className="px-6 py-3.5 text-right">ติดตาม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allTickets.map((t) => {
                  const cleanNumber = t.ticketNumber.replace("#", "");
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {t.ticketNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-xs font-medium text-slate-900">
                        <p className="truncate font-bold">{t.title}</p>
                        <p className="truncate text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800">{t.room}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate">{t.building}</span>
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(t.status)}</td>
                      <td className="px-4 py-4">
                        {t.technician ? (
                          <span className="font-medium text-slate-800">{t.technician.name}</span>
                        ) : (
                          <span className="text-slate-400 italic">ยังไม่มอบหมาย</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-400">{timeAgoThai(t.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/tracking/${cleanNumber}`}
                          className="inline-flex items-center space-x-1 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 font-bold text-slate-700 transition"
                        >
                          <span>ดูงาน</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            ไม่มีประวัติตั๋วแจ้งซ่อมในอาคารที่เลือก
          </div>
        )}
      </div>
    </div>
  );
}
