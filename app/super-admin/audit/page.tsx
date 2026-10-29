// app/super-admin/audit/page.tsx
import prisma from "@/lib/prisma";
import { History, ShieldCheck, User, Clock, CheckCircle2, Lock, Activity, ShieldAlert } from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "บันทึกระบบและความปลอดภัย (Audit Logs) | Super Admin",
  description: "ประวัติการแก้ไขข้อมูล การเปลี่ยนสถานะตั๋ว และความปลอดภัยในระบบ",
};

export default async function SuperAdminAuditPage() {
  const auditHistories = await prisma.ticketHistory.findMany({
    take: 20,
    orderBy: { timestamp: "desc" },
    include: {
      ticket: true,
      changedBy: true,
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
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
                  บันทึกความปลอดภัยและประวัติการทำงาน (System Audit Logs)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  บันทึกตรวจสอบย้อนหลัง (Audit Trail) การเปลี่ยนสถานะตั๋ว และการดำเนินการของผู้ดูแลระบบ
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse stroke-[2]" /> Live Audit Engine Active
              </span>
              <span className="chip-tech text-xs">
                การบันทึก: ไม่สามารถแก้ไขย้อนหลังได้ (Immutable Log)
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center">
            <span className="chip-tech text-xs font-bold text-slate-800 bg-slate-100/90 border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs">
              แสดงล่าสุด <strong className="text-emerald-700 font-mono text-sm">{auditHistories.length}</strong> รายการ
            </span>
          </div>
        </div>
      </div>

      {/* 2. Elevated Audit Log Table */}
      <div className="card-elevated overflow-hidden">
        <div className="border-b border-slate-200/90 p-4 sm:p-5 flex items-center justify-between bg-slate-100/75">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center space-x-2">
            <span>กิจกรรมล่าสุดในระบบ (Recent System Events)</span>
            <span className="chip-tech text-[10px] py-0.5 px-2 bg-white font-mono">
              20 Events
            </span>
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            เรียงตามเวลาที่เกิดขึ้นล่าสุด
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditHistories.map((h) => (
            <div
              key={h.id}
              className="p-4 sm:p-5 hover:bg-emerald-50/20 even:bg-slate-50/35 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold font-mono text-xs shadow-xs">
                  {h.step}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip-tech text-xs bg-slate-100 text-slate-900 border-slate-200 font-bold">
                      {h.ticket.ticketNumber}
                    </span>
                    <span className="font-bold text-slate-900">{h.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{h.note}</p>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <span className="chip-tech text-[11px] py-0.5 px-2 text-slate-600 font-mono">
                  {timeAgoThai(h.timestamp)}
                </span>
                <span className="text-[11px] text-slate-500 font-medium block">
                  โดย: <strong className="text-slate-800">{h.changedBy?.name || "ระบบอัตโนมัติ"}</strong>
                </span>
              </div>
            </div>
          ))}

          {auditHistories.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-xs">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
              <p className="font-medium">ยังไม่มีประวัติกิจกรรมในระบบ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

