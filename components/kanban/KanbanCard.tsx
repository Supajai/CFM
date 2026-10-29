// components/kanban/KanbanCard.tsx
"use client";

import React from "react";
import {
  MapPin,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Clock,
  Layers,
  Rocket,
  Camera,
} from "lucide-react";
import { timeAgoThai } from "@/lib/utils";

interface KanbanCardProps {
  ticket: any;
  onSelect: (ticket: any) => void;
  onMoveStatus?: (ticketId: string, nextStatus: string) => void;
  onOpenResolveModal?: (ticket: any) => void;
  isTechnicianView?: boolean;
}

export default function KanbanCard({
  ticket,
  onSelect,
  onMoveStatus,
  onOpenResolveModal,
  isTechnicianView = true,
}: KanbanCardProps) {
  const getCategoryShort = (cat: string) => {
    switch (cat) {
      case "PC_HARDWARE":
        return "คอมพิวเตอร์/ฮาร์ดแวร์";
      case "NETWORK":
        return "ระบบเครือข่าย/Wi-Fi";
      case "AV_EQUIPMENT":
        return "โสตทัศนูปกรณ์";
      case "AIR_CONDITIONING":
        return "ระบบปรับอากาศ";
      case "ELECTRICAL":
        return "ระบบไฟฟ้า";
      case "PLUMBING":
        return "ระบบประปา";
      case "FURNITURE":
        return "ครุภัณฑ์/สถานที่";
      case "IT_EQUIPMENT":
        return "ไอทีและโสตทัศน์";
      default:
        return "งานทั่วไป";
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", ticket.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const isUrgent = ticket.isUrgent || ticket.priority === "CRITICAL" || ticket.priority === "URGENT";

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(ticket)}
      className={`group relative cursor-grab rounded-2xl border bg-white/95 backdrop-blur-md p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:border-emerald-500/50 active:cursor-grabbing ${
        isUrgent
          ? "border-l-4 border-l-rose-500 border-slate-200/90"
          : "border-slate-200/90"
      }`}
    >
      {/* Top Row: Ticket Number, Category, and Priority Badge */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="chip-tech text-[11px] py-0.5 px-2 bg-slate-100 text-slate-800 border-slate-200 font-bold">
            {ticket.ticketNumber}
          </span>
          <span className="rounded-lg bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
            {getCategoryShort(ticket.category)}
          </span>
        </div>

        <div>
          {isUrgent ? (
            <span className="flex items-center space-x-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span>เร่งด่วน</span>
            </span>
          ) : ticket.status === "RESOLVED" ? (
            <span className="flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>ซ่อมเสร็จแล้ว</span>
            </span>
          ) : ticket.status === "CLOSED" ? (
            <span className="flex items-center space-x-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 stroke-[1.75]" />
              <span>ปิดงานแล้ว</span>
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
              {ticket.priority === "LOW" ? "ความสำคัญต่ำ" : "ปกติ"}
            </span>
          )}
        </div>
      </div>

      {/* Main Title */}
      <h3 className="mt-2.5 text-xs font-bold leading-snug text-slate-900 group-hover:text-emerald-700 transition">
        {ticket.title}
      </h3>

      {/* Location */}
      <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-slate-600">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600 stroke-[1.75]" />
        <span className="truncate font-semibold text-slate-800">
          ชั้น {ticket.floor || 1} • {ticket.roomName || ticket.room}
        </span>
        {ticket.specificPoint && (
          <span className="text-[10px] text-emerald-700 font-semibold truncate">
            ({ticket.specificPoint})
          </span>
        )}
      </div>

      {/* Optional Thumbnail Image */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="mt-2.5 relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.attachments[0].url}
            alt={ticket.attachments[0].fileName || "หลักฐาน"}
            className="h-full w-full object-cover"
          />
          {ticket.attachments.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 rounded-lg bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-xs">
              +{ticket.attachments.length - 1} รูป
            </span>
          )}
        </div>
      )}

      {/* In-Progress Step / Note Box */}
      {ticket.status === "IN_PROGRESS" && (
        <div className="mt-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 p-2 text-[10px] text-blue-900">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3 text-blue-600 stroke-[1.75]" />
              <span>เบิกอะไหล่เรียบร้อย</span>
            </span>
            <span className="text-blue-700 font-mono">
              ~{ticket.etaMinutes || 30} นาที
            </span>
          </div>
          {ticket.stepNote && (
            <p className="mt-1 text-[10px] text-blue-700 truncate">
              {ticket.stepNote}
            </p>
          )}
        </div>
      )}

      {/* Completed / Verification Box */}
      {ticket.status === "RESOLVED" && (
        <div className="mt-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-2 text-[10px] text-emerald-900 flex items-center justify-between">
          <span className="flex items-center space-x-1.5 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
            <span>หลักฐานการเสร็จสิ้น (ภาพถ่าย)</span>
          </span>
          <span className="rounded-md bg-emerald-200/70 px-1.5 py-0.2 font-mono text-[9px] font-bold">
            +1
          </span>
        </div>
      )}

      {/* Bottom Meta Row */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-500">
        {/* Reporter or Technician */}
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
            {ticket.technician?.name
              ? ticket.technician.name.charAt(0)
              : ticket.reporter?.name
              ? ticket.reporter.name.charAt(0)
              : "C"}
          </div>
          <span className="truncate max-w-[120px] font-medium text-slate-700">
            {ticket.technician?.name
              ? `ช่าง: ${ticket.technician.name.split(" ")[0]}`
              : ticket.reporter?.name || "ผู้แจ้ง"}
          </span>
        </div>

        {/* Time and Icon Counts */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="font-medium">{timeAgoThai(ticket.createdAt)}</span>
          {ticket.attachments?.length > 0 && (
            <span className="flex items-center space-x-0.5 text-slate-400">
              <Paperclip className="h-3 w-3 stroke-[1.75]" />
              <span className="font-mono">{ticket.attachments.length}</span>
            </span>
          )}
          <span className="flex items-center space-x-0.5 text-slate-400">
            <MessageSquare className="h-3 w-3 stroke-[1.75]" />
            <span className="font-mono">2</span>
          </span>
        </div>
      </div>

      {/* 3. Operational Action Flow for Technician */}
      {isTechnicianView && (
        <div className="mt-2.5 pt-2 border-t border-slate-100">
          {/* Action สำหรับการ์ดที่อยู่ในคอลัมน์ "มอบหมายแล้ว / รอดำเนินการ" */}
          {(ticket.status === "ASSIGNED" || ticket.status === "PENDING") && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMoveStatus?.(ticket.id, "IN_PROGRESS");
              }}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-1.5 px-3 text-xs font-semibold shadow-xs transition active:scale-[0.98]"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>🚀 เริ่มเข้าหน้างาน</span>
            </button>
          )}

          {/* Action สำหรับการ์ดที่อยู่ในคอลัมน์ "กำลังดำเนินการซ่อม" */}
          {ticket.status === "IN_PROGRESS" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenResolveModal?.(ticket);
              }}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-1.5 px-3 text-xs font-semibold shadow-[0_2px_8px_rgba(16,185,129,0.25)] transition active:scale-[0.98]"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>📷 แนบรูป & ปิดงาน</span>
            </button>
          )}

          {/* ป้ายแสดงผลเมื่อปิดงานแล้ว */}
          {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
            <div className="flex items-center justify-center space-x-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 py-1 px-2.5 text-[10px] font-semibold">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>{ticket.status === "CLOSED" ? "ปิดงานสมบูรณ์" : "ซ่อมเสร็จสิ้น (RESOLVED)"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

