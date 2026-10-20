// app/super-admin/audit/page.tsx
import prisma from "@/lib/prisma";
import { History, ShieldCheck, User, Clock, CheckCircle2, Lock } from "lucide-react";
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
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
            <History className="h-4 w-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            บันทึกความปลอดภัยและประวัติการทำงาน (System Audit & Event Logs)
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          บันทึกตรวจสอบย้อนหลัง (Audit Trail) การเปลี่ยนสถานะตั๋ว และการดำเนินการของผู้ใช้ในระบบ
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            กิจกรรมล่าสุดในระบบ (Recent System Events)
          </h2>
          <span className="rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-700">
            {auditHistories.length} รายการล่าสุด
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {auditHistories.map((h) => (
            <div key={h.id} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 font-bold">
                  {h.step}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {h.ticket.ticketNumber}
                    </span>
                    <span className="font-bold text-slate-800">{h.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{h.note}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block font-mono">
                  {timeAgoThai(h.timestamp)}
                </span>
                <span className="text-[10px] text-slate-500">
                  โดย: {h.changedBy?.name || "ระบบอัตโนมัติ"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
