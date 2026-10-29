// app/admin/floor-plan/page.tsx
import React from "react";
import prisma from "@/lib/prisma";
import BuildingFloorMap, { TicketSummary } from "@/components/building/BuildingFloorMap";
import {
  Layers,
  Building2,
  Activity,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "แผนผังอาคารอัจฉริยะ (Interactive 2.5D Floor Plan) | CampusOps",
  description: "แผนผังอาคาร 2.5D แบบโต้ตอบได้ อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ 4 ชั้น",
};

export default async function AdminFloorPlanPage() {
  // Query active tickets from Prisma
  let activeTicketsRaw: any[] = [];
  try {
    activeTicketsRaw = await prisma.ticket.findMany({
      where: {
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error loading tickets for floor plan:", error);
  }

  // Format tickets for map component
  const tickets: TicketSummary[] = activeTicketsRaw.map((t) => ({
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
  }));

  const totalUrgent = tickets.filter((t) => t.isUrgent).length;
  const totalPending = tickets.filter((t) => t.status === "PENDING").length;
  const totalInProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="card-elevated p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle radial emerald background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative">
          <div className="flex items-center space-x-2">
            <span className="chip-tech text-xs bg-emerald-50 text-emerald-800 border-emerald-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Mappedin 2.5D Digital Twin</span>
            </span>
            <span className="chip-tech text-xs">BLD-COMPTECH</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <span>แผนผังอาคารอัจฉริยะแบบ 2.5D (Interactive Building Plan)</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            ตรวจสอบตำแหน่งห้องปฏิบัติการ โต๊ะคอมพิวเตอร์ และสถานะงานซ่อมบำรุงประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (4 ชั้น)
          </p>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 shrink-0 relative">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-center min-w-[90px]">
            <div className="text-[10px] text-slate-500 font-medium">งานค้างรวม</div>
            <div className="text-lg font-bold font-mono text-slate-900">{tickets.length}</div>
          </div>
          <div className="rounded-xl border border-rose-200/90 bg-rose-50/50 p-3 text-center min-w-[90px]">
            <div className="text-[10px] text-rose-600 font-medium">เร่งด่วน (SLA)</div>
            <div className="text-lg font-bold font-mono text-rose-700">{totalUrgent}</div>
          </div>
          <Link
            href="/report"
            className="btn-primary-gradient py-3 px-4 text-xs font-semibold flex items-center space-x-1.5 h-full"
          >
            <Wrench className="h-4 w-4" strokeWidth={1.75} />
            <span>+ แจ้งซ่อมใหม่</span>
          </Link>
        </div>
      </div>

      {/* 2. Interactive 2.5D Floor Map Component */}
      <BuildingFloorMap tickets={tickets} initialFloor={1} standalone={true} />
    </div>
  );
}
