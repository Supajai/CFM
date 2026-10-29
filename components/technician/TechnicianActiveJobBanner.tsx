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
    <div className="fixed bottom-16 sm:bottom-20 md:bottom-4 left-3 right-3 md:left-64 md:right-6 z-40 animate-in slide-in-from-bottom duration-300 pointer-events-none">
      <div className="pointer-events-auto bg-gradient-to-r from-slate-900/95 via-blue-950/95 to-slate-900/95 backdrop-blur-md text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.35)] border border-blue-500/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {activeJob.isUrgent ? (
              <Flame className="h-5 w-5 text-rose-400 animate-pulse" />
            ) : (
              <Wrench className="h-5 w-5 animate-pulse text-blue-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                กำลังดำเนินการ
              </span>
              <span className="font-mono text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                {activeJob.ticketNumber}
              </span>
              {activeJob.floor && (
                <span className="text-[11px] text-slate-300">
                  ชั้น {activeJob.floor}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-200 truncate mt-1">
              🔧 คุณมีงานที่กำลังดำเนินการอยู่:{" "}
              <span className="text-blue-300 font-bold">[{roomDisplayName}]</span>{" "}
              {activeJob.title}
            </p>
          </div>
        </div>

        <Link
          href={`/technician/active-task/${activeJob.id}`}
          className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95 group border border-blue-400/30"
        >
          <span>🚀</span>
          <span>กลับไปที่หน้างาน</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
