// components/technician/TechnicianActiveJobBanner.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wrench, ArrowRight, Flame, ShieldAlert } from "lucide-react";

export interface ActiveJobData {
  id: string;
  ticketNumber: string;
  title: string;
  room: string;
  roomName?: string | null;
  floor?: number | null;
  isUrgent?: boolean;
}

interface TechnicianActiveJobBannerProps {
  activeJob: ActiveJobData | null;
}

export default function TechnicianActiveJobBanner({
  activeJob,
}: TechnicianActiveJobBannerProps) {
  const pathname = usePathname();

  // ไม่แสดงถ้าไม่มีงานที่กำลังดำเนินการอยู่ หรือช่างกำลังเปิดหน้าปฏิบัติงาน Active Task อยู่แล้ว (Focus Mode)
  if (!activeJob) return null;
  if (pathname.includes("/technician/active-task")) {
    return null;
  }

  const roomDisplayName = activeJob.roomName || activeJob.room;

  return (
    <div className="fixed bottom-16 sm:bottom-20 md:bottom-4 left-3 right-3 md:left-64 md:right-6 z-40 animate-in slide-in-from-bottom duration-200 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-lg shadow-md border border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-800 text-slate-300 border border-slate-700">
            {activeJob.isUrgent ? (
              <Flame className="h-5 w-5 text-rose-400" />
            ) : (
              <Wrench className="h-5 w-5 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                กำลังดำเนินการ
              </span>
              <span className="font-mono text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                {activeJob.ticketNumber}
              </span>
              {activeJob.floor && (
                <span className="text-[11px] text-slate-300">
                  ชั้น {activeJob.floor}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200 truncate mt-1">
              งานที่กำลังดำเนินการ:{" "}
              <span className="text-emerald-400 font-semibold">[{roomDisplayName}]</span>{" "}
              {activeJob.title}
            </p>
          </div>
        </div>

        <Link
          href={`/technician/active-task/${activeJob.id}`}
          className="shrink-0 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 group"
        >
          <span>กลับไปที่หน้างาน</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
