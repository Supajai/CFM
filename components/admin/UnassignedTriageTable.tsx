// components/admin/UnassignedTriageTable.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  MapPin,
  Clock,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import AssignTechnicianModal from "@/components/admin/AssignTechnicianModal";
import { timeAgoThai } from "@/lib/utils";

interface UnassignedTriageTableProps {
  tickets: any[];
  technicians: any[];
}

export default function UnassignedTriageTable({
  tickets,
  technicians,
}: UnassignedTriageTableProps) {
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  return (
    <>
      <div className="card-elevated overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex flex-wrap items-center justify-between gap-3 bg-white/50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              คิวคัดกรองงานที่ยังไม่มอบหมาย (Unassigned Triage Queue)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เคสแจ้งซ่อมจากนักศึกษาและบุคลากรที่รอหัวหน้างานคัดกรองและจ่ายงานช่าง
            </p>
          </div>

          <span className="rounded-full bg-amber-50 px-3 py-1 font-mono text-xs font-semibold text-amber-800 border border-amber-200 shadow-2xs">
            รอมอบหมาย {tickets.length} รายการ
          </span>
        </div>

        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">รหัสตั๋ว</th>
                  <th className="px-4 py-3.5">หัวข้อ / ปัญหา</th>
                  <th className="px-4 py-3.5">สถานที่</th>
                  <th className="px-4 py-3.5">ระดับความสำคัญ</th>
                  <th className="px-4 py-3.5">เวลาที่แจ้ง</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t, idx) => {
                  const cleanNumber = t.ticketNumber.replace("#", "");

                  return (
                    <tr
                      key={t.id}
                      className={`transition-colors hover:bg-emerald-50/30 ${
                        idx % 2 === 1 ? "bg-slate-50/30" : "bg-white/40"
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono">
                        <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200/80 text-slate-800 px-2.5 py-1 rounded-lg shadow-2xs">
                          {t.ticketNumber}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {t.description}
                        </p>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono text-xs font-semibold text-slate-800">
                            {t.room}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                          {t.building}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {t.isUrgent ? (
                          <span className="inline-flex items-center space-x-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/80 shadow-2xs">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 stroke-[1.75]" />
                            <span>ด่วนวิกฤต (15m)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/80">
                            <span>ปกติ</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-500 text-[11px] font-mono">
                        {timeAgoThai(t.createdAt)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/tracking/${cleanNumber}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition shadow-2xs"
                            title="ดูไทม์ไลน์"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setSelectedTicket(t)}
                            className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white px-4 py-2 text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>มอบหมายช่าง</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              ไม่มีใบงานค้างมอบหมาย
            </h3>
            <p className="text-xs text-slate-500">
              ใบงานแจ้งซ่อมทั้งหมดได้รับการจ่ายงานให้ทีมช่างเรียบร้อยแล้ว
            </p>
          </div>
        )}
      </div>

      {selectedTicket && (
        <AssignTechnicianModal
          ticket={selectedTicket}
          technicians={technicians}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </>
  );
}
