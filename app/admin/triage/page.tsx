// app/admin/triage/page.tsx
import prisma from "@/lib/prisma";
import UnassignedTriageTable from "@/components/admin/UnassignedTriageTable";
import DepartmentTicketFilter from "@/components/admin/DepartmentTicketFilter";
import { Inbox, MapPin, Building2, ShieldCheck } from "lucide-react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma, Category } from "@prisma/client";
import { DEPARTMENT_BUILDING_NAME } from "@/lib/constants/department-locations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "คัดกรองและจ่ายงานช่าง อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ | CampusOps",
  description: "คิวจัดสรรและจ่ายงานช่างตามความเชี่ยวชาญและระดับความเร่งด่วน ประจำอาคารแผนก",
};

interface AdminTriagePageProps {
  searchParams?: {
    floor?: string;
    room?: string;
    category?: string;
  };
}

export default async function AdminTriagePage({ searchParams }: AdminTriagePageProps) {
  const session = await getSession();
  if (!session) {
    redirect("/login?callbackUrl=/admin/triage");
  }

  // 1. เงื่อนไข Scope กรองใบงานที่ยังไม่ได้มอบหมาย
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
        specialty: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header: ศูนย์บริหารจัดการและจ่ายงานซ่อม อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
              <Inbox className="h-5 w-5 stroke-[1.75]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                ศูนย์บริหารจัดการและจ่ายงานซ่อม อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์
              </h1>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            คิวคัดกรองความเร่งด่วน ตรวจสอบพิกัดห้องแล็บ และมอบหมายงานให้ช่างที่ตรงกับสายงานความเชี่ยวชาญ
          </p>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 rounded-xl bg-emerald-50/90 px-3 py-1 border border-emerald-200/80 text-emerald-900 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
              <span className="text-xs font-semibold">{DEPARTMENT_BUILDING_NAME}</span>
            </div>

            <div className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-100/90 px-3 py-1 border border-slate-200/80 text-slate-800 text-xs font-medium shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-600 stroke-[1.75]" />
              <span>ผู้จัดสรรงาน: {session.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Filter กรองตาม ชั้น, ห้องแล็บ, และหมวดหมู่ปัญหา */}
      <DepartmentTicketFilter />

      {/* 3. ตารางคิวงานที่ยังไม่ได้มอบหมาย */}
      <UnassignedTriageTable
        tickets={unassignedTickets}
        technicians={technicians}
      />
    </div>
  );
}
