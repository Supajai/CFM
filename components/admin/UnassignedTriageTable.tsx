// components/admin/UnassignedTriageTable.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserCheck,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
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
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              คิวคัดกรองงานที่ยังไม่มอบหมาย (Unassigned Triage Queue)
            </h2>
            <p className="text-xs text-slate-500">
              เคสใหม่จากนักศึกษาและบุคลากรที่รอหัวหน้างานคัดกรองและมอบหมายช่าง
            </p>
          </div>

          <span className="rounded-xl bg-amber-50 px-3 py-1 font-mono text-xs font-bold text-amber-700 border border-amber-200">
            รอมอบหมาย {tickets.length} รายการ
          </span>
        </div>

        {tickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">รหัสตั๋ว</th>
                  <th className="px-4 py-3.5">หัวข้อ / ปัญหา</th>
                  <th className="px-4 py-3.5">สถานที่</th>
                  <th className="px-4 py-3.5">ระดับความสำคัญ</th>
                  <th className="px-4 py-3.5">เวลาที่แจ้ง</th>
                  <th className="px-6 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => {
                  const cleanNumber = t.ticketNumber.replace("#", "");

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {t.ticketNumber}
                        </span>
                      </td>

                      <td className="px-4 py-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">
                          {t.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {t.description}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800">
                            {t.room}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 truncate block">
                          {t.building}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {t.isUrgent ? (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 border border-rose-200">
                            <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
                            <span>ด่วนวิกฤต (15m)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                            <span>ปกติ</span>
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-500 text-[11px]">
                        {timeAgoThai(t.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/tracking/${cleanNumber}`}
                            target="_blank"
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                            title="ดูไทม์ไลน์"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setSelectedTicket(t)}
                            className="flex items-center space-x-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition active:scale-95"
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              ไม่มีใบงานค้างมอบหมาย
            </h3>
            <p className="text-xs text-slate-400">
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
