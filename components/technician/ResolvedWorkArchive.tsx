// components/technician/ResolvedWorkArchive.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  MapPin,
  Calendar,
  ExternalLink,
  History,
  ShieldCheck,
  Star,
  FileText,
  User,
  Wrench,
  Sparkles,
  Camera,
} from "lucide-react";
import { formatDateThai } from "@/lib/utils";

export interface ResolvedTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string;
  category?: string;
  building?: string;
  floor?: number;
  room?: string;
  roomName?: string;
  location?: string;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  resolutionDetail?: string | null;
  status: string;
  stepNote?: string | null;
  rating?: number | null;
  feedback?: string | null;
  resolvedAt?: Date | string | null;
  updatedAt: Date | string;
  reporter?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  technician?: {
    id: string;
    name: string;
    technicianCode?: string | null;
  } | null;
  attachments?: {
    id: string;
    url: string;
    type?: string;
  }[];
}

interface ResolvedWorkArchiveProps {
  tickets: ResolvedTicket[];
}

const DEFAULT_FALLBACK_IMG =
  "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80";

export default function ResolvedWorkArchive({ tickets }: ResolvedWorkArchiveProps) {
  const [selectedHistoryTicket, setSelectedHistoryTicket] = useState<ResolvedTicket | null>(null);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200/80 shadow-sm">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-3 stroke-[1.5]" />
        <p className="font-medium text-slate-600">ยังไม่มีรายการงานที่บันทึกซ่อมเสร็จสิ้น</p>
        <p className="text-[11px] text-slate-400 mt-1">
          เมื่อปิดงานซ่อมในระบบ ข้อมูลจะถูกจัดเก็บเข้าคลังประวัติผลงานโดยอัตโนมัติ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {tickets.map((ticket) => {
        const cleanNumber = ticket.ticketNumber?.replace("#", "") || ticket.id.slice(-6);

        // หาภาพหลักฐานหลังซ่อม หรือภาพก่อนซ่อม
        const afterAtt = ticket.attachments?.find((a) => a.type === "AFTER");
        const beforeAtt = ticket.attachments?.find((a) => a.type === "BEFORE");
        const displayImage =
          ticket.afterImageUrl ||
          afterAtt?.url ||
          ticket.beforeImageUrl ||
          beforeAtt?.url ||
          DEFAULT_FALLBACK_IMG;

        const locationText =
          ticket.location ||
          (ticket.room
            ? `${ticket.room}${ticket.roomName ? ` (${ticket.roomName})` : ""}`
            : "อาคารแผนกเทคโนโลยีคอมพิวเตอร์");

        return (
          <div
            key={ticket.id}
            className="card-elevated p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group"
          >
            {/* ฝั่งซ้าย: รูปภาพและข้อมูลตั๋ว */}
            <div className="flex gap-4 items-start w-full sm:w-auto min-w-0">
              {/* กล่องบรรจุรูปภาพ Thumbnail ล็อกขนาด w-20 h-20 ขอบมน rounded-xl */}
              <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200 shadow-2xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayImage}
                  alt={ticket.title}
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_FALLBACK_IMG;
                  }}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute bottom-1 right-1 text-[9px] py-0 px-1.5 rounded-md bg-slate-900/80 text-white font-medium">
                  หลักฐาน
                </span>
              </div>

              {/* ข้อมูลรายละเอียดตั๋ว */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                    #{cleanNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 inline-block" />
                    <span>ปิดงานสมบูรณ์</span>
                  </span>
                  {ticket.technician && (
                    <span className="hidden sm:inline-flex text-[10px] text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg font-medium">
                      ช่าง: {ticket.technician.name}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 text-sm truncate">
                  {ticket.title}
                </h4>

                <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{locationText}</span>
                </p>

                <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                  {ticket.stepNote || ticket.resolutionDetail || "ดำเนินการซ่อมบำรุงและทดสอบระบบเรียบร้อยตามมาตรฐาน"}
                </p>

                {/* แสดงคะแนนดาวบนมือถือ */}
                {ticket.rating ? (
                  <div className="flex items-center gap-1 text-xs text-amber-700 font-medium sm:hidden pt-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{ticket.rating}/5 ดาว</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 italic sm:hidden pt-0.5">
                    รอผู้แจ้งให้คะแนน
                  </div>
                )}
              </div>
            </div>

            {/* ฝั่งขวา: คะแนนดาว (บนจอใหญ่) และปุ่มกดเปิด Modal */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              {ticket.rating ? (
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{ticket.rating}/5 ดาว</span>
                </div>
              ) : (
                <span className="hidden sm:inline-block text-xs text-slate-400 italic font-medium px-2">
                  รอผู้แจ้งให้คะแนน
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedHistoryTicket(ticket)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer shrink-0"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>ดูสรุปงานซ่อม</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* In-Place Summary Modal */}
      {selectedHistoryTicket && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity cursor-pointer"
            onClick={() => setSelectedHistoryTicket(null)}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div
            className="relative z-50 w-full max-w-lg rounded-lg bg-white p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-white">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    สรุปผลงานซ่อมบำรุง
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    #{selectedHistoryTicket.ticketNumber?.replace("#", "") || selectedHistoryTicket.id.slice(-6)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHistoryTicket(null)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title & Badge */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>ปิดงานสมบูรณ์ (RESOLVED)</span>
                </span>
                {selectedHistoryTicket.rating && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>⭐ {selectedHistoryTicket.rating}/5 ดาว</span>
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {selectedHistoryTicket.title}
              </h4>
            </div>

            {/* Location & Time Info */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  <span>สถานที่</span>
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {selectedHistoryTicket.room || selectedHistoryTicket.roomName || "ห้องปฏิบัติการ"}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  ชั้น {selectedHistoryTicket.floor || 1} • {selectedHistoryTicket.building || "อาคารช่าง"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-500" />
                  <span>เวลาปิดงาน</span>
                </span>
                <p className="font-semibold text-slate-800">
                  {formatDateThai(selectedHistoryTicket.resolvedAt || selectedHistoryTicket.updatedAt)}
                </p>
                {selectedHistoryTicket.technician && (
                  <p className="text-[11px] text-slate-500 truncate">
                    ช่าง: {selectedHistoryTicket.technician.name}
                  </p>
                )}
              </div>
            </div>

            {/* Photos Proof Preview */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-700">
                หลักฐานภาพถ่ายการซ่อมบำรุง
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {/* Before Photo */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden space-y-1">
                  <div className="p-1.5 bg-slate-100 text-[10px] font-semibold text-slate-600 text-center">
                    ภาพก่อนซ่อม (Before)
                  </div>
                  <div className="relative aspect-[4/3] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {selectedHistoryTicket.beforeImageUrl ||
                    selectedHistoryTicket.attachments?.find((a) => a.type === "BEFORE")?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          selectedHistoryTicket.beforeImageUrl ||
                          selectedHistoryTicket.attachments?.find((a) => a.type === "BEFORE")?.url
                        }
                        alt="Before repair"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector(".fallback-before")) {
                            const fallback = document.createElement("div");
                            fallback.className = "fallback-before flex flex-col items-center justify-center text-slate-400 p-2 text-center h-full w-full";
                            fallback.innerHTML = `<span class="text-[10px] text-slate-400 mt-0.5">ไม่มีภาพก่อนซ่อม</span>`;
                            parent.appendChild(fallback);
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <Camera className="h-5 w-5 mb-1 text-slate-300 stroke-[1.5]" />
                        <span className="text-[10px] text-slate-400">ไม่มีภาพก่อนซ่อม</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* After Photo */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 overflow-hidden space-y-1">
                  <div className="p-1.5 bg-emerald-100 text-[10px] font-medium text-emerald-800 text-center">
                    ภาพหลังซ่อมเสร็จ (After)
                  </div>
                  <div className="relative aspect-[4/3] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {selectedHistoryTicket.afterImageUrl ||
                    selectedHistoryTicket.attachments?.find((a) => a.type === "AFTER")?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          selectedHistoryTicket.afterImageUrl ||
                          selectedHistoryTicket.attachments?.find((a) => a.type === "AFTER")?.url
                        }
                        alt="After repair"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector(".fallback-after")) {
                            const fallback = document.createElement("div");
                            fallback.className = "fallback-after flex flex-col items-center justify-center text-emerald-700 p-2 text-center h-full w-full";
                            fallback.innerHTML = `<span class="text-[10px] text-emerald-800 mt-0.5 font-medium">ยืนยันเสร็จสมบูรณ์</span>`;
                            parent.appendChild(fallback);
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-emerald-600/70 p-2 text-center">
                        <CheckCircle2 className="h-6 w-6 mb-1 text-emerald-500 stroke-[1.5]" />
                        <span className="text-[10px] font-medium text-emerald-700">ยืนยันเสร็จสมบูรณ์</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Detail */}
            <div className="space-y-1.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/80 text-xs">
              <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                <span>บันทึกการปฏิบัติงานและอะไหล่ที่ใช้</span>
              </h5>
              <p className="text-slate-700 leading-relaxed font-normal">
                {selectedHistoryTicket.resolutionDetail ||
                  selectedHistoryTicket.stepNote ||
                  "ดำเนินการตรวจสอบหน้างาน ซ่อมแซมแก้ไขอุปกรณ์ และทดสอบการทำงานเรียบร้อยตามมาตรฐาน"}
              </p>
            </div>

            {/* User Feedback & Rating Note if any */}
            {selectedHistoryTicket.feedback && (
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80 text-xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>ความเห็นจากผู้แจ้งซ่อม:</span>
                </span>
                <p className="text-slate-700 italic">
                  &ldquo;{selectedHistoryTicket.feedback}&rdquo;
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
              <Link
                href={`/tracking/${selectedHistoryTicket.ticketNumber?.replace("#", "") || selectedHistoryTicket.id.slice(-6)}`}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-2 px-3 rounded-xl hover:bg-emerald-50 transition"
              >
                <span>ดูในระบบติดตาม (Tracking)</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>

              <button
                type="button"
                onClick={() => setSelectedHistoryTicket(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
