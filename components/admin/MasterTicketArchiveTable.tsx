// components/admin/MasterTicketArchiveTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Layers,
  Wrench,
  User,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import AdminTicketManageModal, {
  AdminTicketManageModalTicket,
  TechnicianOption,
} from "./AdminTicketManageModal";

interface MasterTicketArchiveTableProps {
  initialTickets: AdminTicketManageModalTicket[];
  technicians: TechnicianOption[];
}

export default function MasterTicketArchiveTable({
  initialTickets,
  technicians,
}: MasterTicketArchiveTableProps) {
  const [selectedTicketForManage, setSelectedTicketForManage] =
    useState<AdminTicketManageModalTicket | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return initialTickets.filter((t) => {
      // 1. Status Filter
      if (statusFilter !== "ALL") {
        if (statusFilter === "RESOLVED") {
          if (t.status !== "RESOLVED" && t.status !== "CLOSED") return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (t.ticketNumber || "").toLowerCase();
        const title = (t.title || "").toLowerCase();
        const desc = (t.description || "").toLowerCase();
        const room = (t.room || "").toLowerCase();
        const roomName = (t.roomName || "").toLowerCase();
        const reporter = (t.reporter?.name || "").toLowerCase();
        const tech = (t.technician?.name || "").toLowerCase();

        return (
          num.includes(q) ||
          title.includes(q) ||
          desc.includes(q) ||
          room.includes(q) ||
          roomName.includes(q) ||
          reporter.includes(q) ||
          tech.includes(q)
        );
      }

      return true;
    });
  }, [initialTickets, statusFilter, searchQuery]);

  const getStatusBadge = (t: AdminTicketManageModalTicket) => {
    switch (t.status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200/90 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>รอตรวจสอบ</span>
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200/90 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>มอบหมายแล้ว</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center space-x-1 bg-indigo-50 text-indigo-700 border border-indigo-200/90 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>กำลังซ่อม</span>
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>⏸️ ยกกลับศูนย์ซ่อม</span>
          </span>
        );
      case "RESOLVED":
      case "CLOSED":
        return (
          <span className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/90 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>ซ่อมเสร็จสิ้น</span>
          </span>
        );
      case "CANCELLED":
        return (
          <span
            className="inline-flex items-center space-x-1.5 bg-slate-100 text-rose-700 border border-rose-200/90 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-help group relative"
            title={t.cancelReason ? `เหตุผลที่ยกเลิก: ${t.cancelReason}` : "ยกเลิกคำร้องแล้ว"}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>ยกเลิกแล้ว</span>
            {t.cancelReason && (
              <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30 max-w-xs whitespace-normal text-left pointer-events-none">
                <span className="font-bold text-rose-300 block mb-0.5">เหตุผลการยกเลิก:</span>
                {t.cancelReason}
              </span>
            )}
          </span>
        );
      default:
        return <span className="chip-tech text-xs">{t.status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามรหัส #REP, ปัญหา, ห้อง, ผู้แจ้ง หรือช่าง..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "ALL", label: "ทั้งหมด" },
            { id: "PENDING", label: "รอตรวจ" },
            { id: "ASSIGNED", label: "มอบหมาย" },
            { id: "IN_PROGRESS", label: "กำลังซ่อม" },
            { id: "ON_HOLD", label: "ยกกลับศูนย์ซ่อม" },
            { id: "RESOLVED", label: "ซ่อมเสร็จสิ้น" },
            { id: "CANCELLED", label: "ยกเลิกแล้ว" },
          ].map((tab) => {
            const isSelected = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs whitespace-nowrap transition cursor-pointer border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-100/80 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="card-elevated overflow-hidden bg-white">
        {filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200/90 bg-slate-100/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">รหัสตั๋ว</th>
                  <th className="px-4 py-4">หัวข้อปัญหา</th>
                  <th className="px-4 py-4">ตำแหน่ง / ห้องแล็บ</th>
                  <th className="px-4 py-4">สถานะ</th>
                  <th className="px-4 py-4">ช่างผู้รับผิดชอบ</th>
                  <th className="px-4 py-4">เวลาที่แจ้ง</th>
                  <th className="px-6 py-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredTickets.map((t) => {
                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-emerald-50/25 even:bg-slate-50/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="chip-tech text-xs text-slate-900 bg-slate-100 border-slate-200 font-semibold font-mono">
                          {t.ticketNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 truncate">{t.title}</p>
                          {t.rating ? (
                            <span
                              className="shrink-0 inline-flex items-center space-x-0.5 px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold font-mono"
                              title={t.feedback ? `รีวิว: "${t.feedback}"` : `คะแนน ${t.rating}/5 ดาว`}
                            >
                              <span>⭐</span>
                              <span>{t.rating}/5</span>
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate text-[11px] text-slate-500 mt-0.5">
                          {t.description}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                          <span className="font-semibold text-slate-800">
                            {t.roomName || t.room}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                          ชั้น {t.floor} • {t.building}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          {getStatusBadge(t)}
                          {(t.status === "RESOLVED" || t.status === "CLOSED") && (
                            <div>
                              {t.rating ? (
                                <span
                                  className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[11px] font-bold shadow-2xs"
                                  title={t.feedback ? `ความคิดเห็น: "${t.feedback}"` : `คะแนนประเมิน ${t.rating}/5 ดาว`}
                                >
                                  <span className="text-amber-500">⭐</span>
                                  <span>{t.rating}/5</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] text-slate-400 font-medium">
                                  — <span className="text-[10px] text-slate-400/80 ml-0.5">(ยังไม่ประเมิน)</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {t.technician ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                              {(t.technician.name || "ช").charAt(0)}
                            </div>
                            <span className="font-semibold text-slate-800">
                              {t.technician.name || "ช่างเทคนิค"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            ยังไม่มอบหมาย
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-[11px] font-medium">
                        {timeAgoThai(t.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTicketForManage(t)}
                          className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200/90 px-3 py-1.5 font-semibold text-slate-700 shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                          <span>ตรวจสอบ</span>
                          <ExternalLink className="h-3.5 w-3.5 stroke-[1.75]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-xs text-slate-500">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
            <p className="font-medium">ไม่พบประวัติตั๋วแจ้งซ่อมตามเงื่อนไขที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Admin Dispatch & Triage Modal */}
      {selectedTicketForManage && (
        <AdminTicketManageModal
          ticket={selectedTicketForManage}
          isOpen={Boolean(selectedTicketForManage)}
          onClose={() => setSelectedTicketForManage(null)}
          technicians={technicians}
        />
      )}
    </div>
  );
}
