// components/building/RoomDetailDrawer.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  Clock,
  MapPin,
  Maximize2,
  Loader2,
  Info,
  ChevronDown,
  Phone,
} from "lucide-react";
import { BuildingRoomPlan, SubPin } from "@/lib/constants/building-plan";
import { TicketSummary } from "./BuildingFloorMap";

export interface RoomDetailDrawerProps {
  selectedRoom: BuildingRoomPlan | null;
  onClose: () => void;
  sortedRoomTickets?: TicketSummary[];
  activeTicket?: TicketSummary | null;
  selectedTicketIndex?: number;
  onSelectTicketIndex?: (index: number) => void;
  selectedSubPin?: SubPin | null;
  isUnassigned?: boolean;
  isMyTask?: boolean;
  currentUserId?: string;
  isPendingAction?: boolean;
  onClaimTicket?: (ticketId: string) => void;
  onZoomImage?: (url: string) => void;
}

export default function RoomDetailDrawer({
  selectedRoom,
  onClose,
  sortedRoomTickets = [],
  activeTicket = null,
  selectedTicketIndex = 0,
  onSelectTicketIndex,
  selectedSubPin,
  isUnassigned = false,
  isMyTask = false,
  currentUserId,
  isPendingAction = false,
  onClaimTicket,
  onZoomImage,
}: RoomDetailDrawerProps) {
  if (!selectedRoom) return null;

  const hasActiveIssue = sortedRoomTickets.length > 0 && activeTicket !== null;

  return (
    <>
      {/* 1. Backdrop โปร่งแสงแบบแตะเพื่อปิด (Mobile View) */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden transition-opacity cursor-pointer animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Mobile View: Bottom Sheet สไลด์ขึ้นมาจากขอบล่าง (ความสูงไม่เกิน 60vh มองเห็นแผนที่ด้านบน) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="รายละเอียดห้อง"
        className="fixed inset-x-0 bottom-16 z-40 max-h-[60vh] overflow-y-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-4 transition-transform duration-300 md:hidden animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ขีดจับลากมนกึ่งกลางด้านบน (Drag Indicator) */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />

        {/* ส่วนหัวห้องพร้อมปุ่มปิด [✕] ชัดเจน */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                {selectedRoom.code}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {selectedRoom.badge || selectedRoom.type || "พื้นที่ใช้งาน"}
              </span>
            </div>
            <h3 className="font-bold text-slate-800 text-base leading-tight">
              {selectedRoom.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer transition"
            title="ปิดหน้าต่าง"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* เนื้อหาการ์ดงานซ่อม หรือสถานะปกติ */}
        <div className="space-y-3">
          {hasActiveIssue && activeTicket ? (
            /* การ์ดงานซ่อม + ปุ่ม Action เข้าหน้างาน */
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-800">⚠️ มีงานซ่อมบำรุงคงค้าง</span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                    {activeTicket.ticketNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1 line-clamp-2 font-medium">
                  {activeTicket.title}
                </p>
                {activeTicket.specificPoint && (
                  <p className="text-[11px] text-amber-800 mt-1 flex items-center gap-1 font-mono">
                    <MapPin className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>{activeTicket.specificPoint}</span>
                  </p>
                )}
              </div>

              <Link
                href={`/technician/active-task/${activeTicket.id}`}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer text-center"
              >
                <span>🚀</span>
                <span>เข้าสู่หน้าจอปฏิบัติงานซ่อม</span>
              </Link>
            </div>
          ) : (
            /* สถานะห้องปกติแบบกะทัดรัด */
            <div className="py-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>● ห้องอยู่ในสถานะปกติ ไม่มีงานค้าง</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Desktop View: Drawer สไลด์จากขอบขวาตามเดิม */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="รายละเอียดห้อง"
        className="hidden md:flex md:fixed md:top-0 md:right-0 md:bottom-0 md:w-[420px] md:h-full md:rounded-none md:shadow-2xl md:z-40 md:bg-white/98 md:backdrop-blur-md md:border-l md:border-slate-200/90 flex-col overflow-hidden animate-in slide-in-from-right duration-300"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200/80 bg-white/90 backdrop-blur-xs flex items-start justify-between shrink-0">
          <div className="pr-2">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="chip-tech text-[11px] font-bold py-0.5 px-2 bg-slate-900 text-white border-slate-700">
                [{selectedRoom.floor}F] {selectedRoom.code}
              </span>
              <span className="chip-tech text-[10px] py-0.5 px-2 bg-slate-100 text-slate-700 border-slate-200 font-medium">
                {selectedRoom.badge || selectedRoom.type || "พื้นที่ใช้งาน"}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
              {selectedRoom.name}
            </h3>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              {sortedRoomTickets.length > 0 ? (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    sortedRoomTickets.some((t) => t.isUrgent)
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-amber-100 text-amber-800 border border-amber-200"
                  }`}
                >
                  {sortedRoomTickets.some((t) => t.isUrgent) ? "🚨 งานด่วน" : "⚠️ มีงานซ่อม"}{" "}
                  {sortedRoomTickets.length} เคส
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  สถานะปกติ
                </span>
              )}
              <span className="text-[11px] text-slate-400">
                ชั้น {selectedRoom.floor} • {selectedRoom.capacity || "พื้นที่แผนก"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            title="ปิดหน้าต่าง"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Ticket Selector */}
          {sortedRoomTickets.length > 1 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                เลือกใบงาน ({sortedRoomTickets.length} เคสในห้องนี้)
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {sortedRoomTickets.map((t, idx) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTicketIndex?.(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                      selectedTicketIndex === idx
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                    }`}
                  >
                    {t.isUrgent && <span>🚨</span>}
                    <span className="font-mono">{t.ticketNumber}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Ticket Card */}
          {activeTicket ? (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {activeTicket.ticketNumber}
                </span>
                <span className="chip-tech text-[10px] py-0.5 px-2 bg-slate-100 text-slate-800 font-semibold">
                  {activeTicket.status}
                </span>
              </div>

              <div className="space-y-1">
                <span className="chip-tech text-[10px] py-0.5 px-2 bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                  {activeTicket.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {activeTicket.title}
                </h4>
              </div>

              {/* Before Photo */}
              {activeTicket.beforeImageUrl && (
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 aspect-video flex items-center justify-center"
                  onClick={() => onZoomImage?.(activeTicket.beforeImageUrl || "")}
                >
                  <img
                    src={activeTicket.beforeImageUrl}
                    alt="ภาพถ่ายจุดชำรุด"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                    <Maximize2 className="h-4 w-4" />
                    <span>แตะเพื่อเปิดดูภาพขยาย</span>
                  </div>
                </div>
              )}

              {/* Location & Contact */}
              {activeTicket.specificPoint && (
                <div className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80">
                  <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">ตำแหน่งเฉพาะจุด: </span>
                    <span className="text-amber-800 font-medium">{activeTicket.specificPoint}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800 text-sm">ห้องอยู่ในสถานะปกติ</h4>
              <p className="text-xs text-slate-400 mt-1">ไม่มีรายการแจ้งซ่อมคงค้างในห้องนี้</p>
            </div>
          )}
        </div>

        {/* Sticky Bottom Area: Action Link */}
        {activeTicket && (
          <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200 shrink-0">
            {isUnassigned && onClaimTicket && (
              <button
                type="button"
                disabled={isPendingAction}
                onClick={() => onClaimTicket(activeTicket.id)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 mb-2"
              >
                {isPendingAction ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>✋</span>
                    <span>รับงานนี้</span>
                  </>
                )}
              </button>
            )}

            <Link
              href={`/technician/active-task/${activeTicket.id}`}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 text-center"
            >
              <span>🚀</span>
              <span>เข้าสู่หน้าจอปฏิบัติงานซ่อม (Active Task)</span>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
