// components/dashboard/DashboardViewContainer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Layers, LayoutList, Building2 } from "lucide-react";

interface DashboardViewContainerProps {
  mapView: React.ReactNode;
  listView: React.ReactNode;
  defaultView?: "map" | "list";
  roleLabel?: string;
}

export default function DashboardViewContainer({
  mapView,
  listView,
  defaultView = "map",
  roleLabel,
}: DashboardViewContainerProps) {
  const [viewMode, setViewMode] = useState<"map" | "list">(defaultView);

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
    <div className="space-y-6">
      {/* View Switcher Header Bar */}
      <div className="card-elevated p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-800 border border-emerald-200 shadow-2xs">
            {viewMode === "map" ? (
              <Building2 className="h-4.5 w-4.5" strokeWidth={1.75} />
            ) : (
              <LayoutList className="h-4.5 w-4.5" strokeWidth={1.75} />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                {viewMode === "map" ? "มุมมองแผนผังอาคาร" : "มุมมองตารางรายการและสรุปผล"}
              </span>
              {roleLabel && (
                <span className="chip-tech text-[10px] py-0.5 px-2 bg-slate-100 text-slate-700">
                  {roleLabel}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {viewMode === "map"
                ? "แสดงพิกัดห้อง จุดเกิดเหตุ และปุ่มปฏิบัติการแบบโต้ตอบได้"
                : "แสดงรายการข้อมูลสรุป ตารางงาน และตัวชี้วัดประสิทธิภาพ"}
            </p>
          </div>
        </div>

        {/* Segmented Mode Control Button */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("map")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all active:scale-[0.98] cursor-pointer ${
              viewMode === "map"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
            <span>มุมมองผังอาคาร</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition-all active:scale-[0.98] cursor-pointer ${
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200 font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5 text-slate-600" strokeWidth={2} />
            <span>มุมมองตารางรายการ</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="transition-all duration-300">
        {viewMode === "map" ? mapView : listView}
      </div>
    </div>
  );
}
