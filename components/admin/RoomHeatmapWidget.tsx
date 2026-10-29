// components/admin/RoomHeatmapWidget.tsx
"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Layers, Flame } from "lucide-react";

export interface RoomIssueStat {
  id: string;
  code: string;
  name: string;
  floor: number;
  type: string;
  totalIssues: number;
  activeIssues: number;
  urgentIssues: number;
}

interface RoomHeatmapWidgetProps {
  stats: RoomIssueStat[];
  onSelectRoom?: (roomName: string) => void;
}

export default function RoomHeatmapWidget({ stats, onSelectRoom }: RoomHeatmapWidgetProps) {
  const [selectedFloor, setSelectedFloor] = useState<number | "ALL">("ALL");

  const filteredStats = useMemo(() => {
    let list = [...stats];
    if (selectedFloor !== "ALL") {
      list = list.filter((s) => s.floor === selectedFloor);
    }
    return list.sort((a, b) => b.totalIssues - a.totalIssues);
  }, [stats, selectedFloor]);

  const maxTotal = useMemo(() => {
    return Math.max(...stats.map((s) => s.totalIssues), 1);
  }, [stats]);

  const totalActiveAll = useMemo(() => {
    return stats.reduce((acc, s) => acc + s.activeIssues, 0);
  }, [stats]);

  return (
    <div className="card-elevated p-6 space-y-5">
      {/* Header & Floor Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
              <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>สถิติจำนวนปัญหาแยกตามห้อง</span>
                <span className="chip-tech text-[10px] py-0.5 px-2">Room Heatmap</span>
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10.5">
            ตรวจวัดความถี่ของปัญหาและการใช้งานหนักในแต่ละห้องแล็บและพื้นที่ประจำอาคาร
          </p>
        </div>

        {/* Floor Filter Tabs */}
        <div className="flex items-center space-x-1 rounded-xl bg-slate-100/80 p-1 text-xs font-medium border border-slate-200/80">
          <button
            type="button"
            onClick={() => setSelectedFloor("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
              selectedFloor === "ALL"
                ? "bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ทุกชั้น
          </button>
          {[1, 2, 3, 4].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFloor(f)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                selectedFloor === f
                  ? "bg-white text-slate-900 shadow-xs font-semibold border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ชั้น {f}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap List */}
      <div className="space-y-3">
        {filteredStats.slice(0, 6).map((item, index) => {
          const percentage = Math.round((item.totalIssues / maxTotal) * 100);

          let heatBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
          let barGradient = "bg-gradient-to-r from-emerald-500 to-teal-500";

          if (item.activeIssues >= 3 || item.urgentIssues > 0) {
            heatBadge = "bg-rose-50 text-rose-700 border-rose-200";
            barGradient = "bg-gradient-to-r from-rose-500 to-red-600";
          } else if (item.activeIssues >= 1) {
            heatBadge = "bg-amber-50 text-amber-700 border-amber-200";
            barGradient = "bg-gradient-to-r from-amber-400 to-amber-500";
          }

          return (
            <div
              key={item.id}
              onClick={() => onSelectRoom?.(item.name)}
              className="rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-emerald-500/40 hover:shadow-xs p-3.5 transition-all space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-200/80 text-[10px] font-mono font-bold text-slate-700">
                    #{index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-900">{item.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 font-mono">
                      (ชั้น {item.floor})
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`chip-tech text-[10px] py-0.5 px-2 ${heatBadge}`}>
                    {item.activeIssues > 0 ? `${item.activeIssues} งานค้าง` : "ปกติ"}
                  </span>
                  <span className="chip-tech text-xs">
                    {item.totalIssues} เคส
                  </span>
                </div>
              </div>

              {/* Progress Heat Bar */}
              <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barGradient}`}
                  style={{ width: `${Math.max(percentage, 6)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
          <span>งานค้างซ่อมบำรุงรวมในอาคาร:</span>
          <strong className="text-slate-900 font-semibold font-mono">{totalActiveAll} รายการ</strong>
        </span>
        <span className="chip-tech text-[10px] text-emerald-700 bg-emerald-50/60 border-emerald-200/60">
          ● อัปเดตสถิติเรียลไทม์
        </span>
      </div>
    </div>
  );
}

