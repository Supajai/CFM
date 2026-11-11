// components/technician/TechnicianDashboardClient.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Layers, LayoutList, Hammer } from "lucide-react";
import BuildingFloorMap, { TicketSummary } from "@/components/building/BuildingFloorMap";
import { SessionPayload } from "@/lib/auth";

interface TechnicianDashboardClientProps {
  formattedTickets: TicketSummary[];
  session: SessionPayload;
  myActiveCount: number;
  allActiveCount: number;
  listView: React.ReactNode;
  defaultView?: "map" | "list";
}

export default function TechnicianDashboardClient({
  formattedTickets,
  session,
  myActiveCount,
  allActiveCount,
  listView,
  defaultView = "map",
}: TechnicianDashboardClientProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">(defaultView);
  const [technicianFilter, setTechnicianFilter] = useState<"all" | "my-tasks">("my-tasks");

  // Sync tab with URL search params (?tab=map or ?tab=list)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleParams = () => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab === "map") {
          setViewMode("map");
        } else if (tab === "list") {
          setViewMode("list");
        }
      };

      handleParams();
      window.addEventListener("popstate", handleParams);
      return () => window.removeEventListener("popstate", handleParams);
    }
  }, []);

  return (
    <div className="card-elevated overflow-hidden border border-slate-200/80 bg-white">
      {/* 3. Single Integrated Map Toolbar */}
      <div className="border-b border-slate-100 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white">
        {/* ฝั่งซ้าย (Context & Legend) */}
        <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
          <span className="text-sm font-semibold text-slate-800 tracking-tight">
            พิกัดตำแหน่งงานซ่อม
          </span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>ปกติ</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>มีงานซ่อม</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 font-medium">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span>งานเร่งด่วน</span>
            </span>
          </div>
        </div>

        {/* ฝั่งขวา (Segmented Controls) */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* กลุ่มที่ 1: ตัวกรองงาน (งานของฉัน / งานทั้งหมด) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setTechnicianFilter("my-tasks")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                technicianFilter === "my-tasks"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <Hammer className={`h-3 w-3 ${technicianFilter === "my-tasks" ? "text-amber-600" : "text-slate-400"}`} />
              <span>งานของฉัน</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  technicianFilter === "my-tasks"
                    ? "bg-amber-100 text-amber-800 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {myActiveCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTechnicianFilter("all")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                technicianFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <span>งานทั้งหมด</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  technicianFilter === "all"
                    ? "bg-slate-200 text-slate-900 font-bold"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {allActiveCount}
              </span>
            </button>
          </div>

          {/* กลุ่มที่ 2: สลับมุมมอง (ผังอาคาร / ตาราง) */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
              title="มุมมองผังอาคาร 2.5D"
            >
              <Layers className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
              <span>ผังอาคาร</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
              title="มุมมองตารางรายการ"
            >
              <LayoutList className="h-3.5 w-3.5 text-slate-600" strokeWidth={2} />
              <span>ตาราง</span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-2 sm:p-5">
        {viewMode === "map" ? (
          <BuildingFloorMap
            initialFloor={1}
            tickets={formattedTickets}
            currentUserRole="TECHNICIAN"
            currentUserId={session.userId}
            currentUserName={session.name}
            standalone={false}
            hideHeader={true}
            technicianFilter={technicianFilter}
            onTechnicianFilterChange={setTechnicianFilter}
          />
        ) : (
          listView
        )}
      </div>
    </div>
  );
}

