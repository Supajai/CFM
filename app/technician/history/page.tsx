// app/technician/history/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  CheckCircle2,
  History,
} from "lucide-react";
import { Metadata } from "next";
import ResolvedWorkArchive from "@/components/technician/ResolvedWorkArchive";

export const metadata: Metadata = {
  title: "ประวัติงานที่ซ่อมเสร็จสิ้น (Resolved History) | CampusOps",
  description: "ประวัติผลงานการซ่อมแซมและคะแนนความพึงพอใจจากผู้แจ้ง",
};

export default async function TechnicianHistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/technician/history");
  }

  // ดึงรายการงานที่ซ่อมเสร็จแล้ว (RESOLVED หรือ CLOSED)
  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ["RESOLVED", "CLOSED"] },
    },
    orderBy: { resolvedAt: "desc" },
    include: {
      reporter: true,
      attachments: true,
      technician: true,
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-28 md:pb-12 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Card */}
      <div className="card-elevated p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-emerald-50/25">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <History className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  ประวัติงานที่ซ่อมเสร็จสิ้น (Resolved Work Archive)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  บันทึกผลงานการซ่อมบำรุง หลักฐานหลังซ่อมเสร็จ และผลการประเมินจากผู้ใช้งาน
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 rounded-xl bg-emerald-50/90 px-3 py-1.5 border border-emerald-200/90 text-emerald-900 shadow-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                <span className="text-xs font-semibold">ปิดงานสมบูรณ์แล้ว</span>
                <span className="chip-tech text-[10px] text-emerald-900 bg-white border-emerald-200 py-0.5 px-2">
                  {resolvedTickets.length} งาน
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <span className="chip-tech text-xs font-bold text-slate-800 bg-slate-100/90 border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
              เกณฑ์ความสำเร็จ: <strong className="text-emerald-700 font-mono">100% Verified</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Elevated History List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
            <span>ผลงานการแก้ไขปัญหาทั้งหมด</span>
            <span className="chip-tech text-[10px] py-0.5 px-2 bg-white">
              {resolvedTickets.length} เคส
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            เรียงตามเวลาที่แก้ไขเสร็จล่าสุด
          </span>
        </div>

        <ResolvedWorkArchive tickets={resolvedTickets} />
      </div>
    </div>
  );
}

