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

  const getBorderColor = () => {
    if (isUrgent) return "border-l-4 border-l-rose-500 border-slate-200";
    if (ticket.status === "IN_PROGRESS") return "border-l-4 border-l-amber-500 border-slate-200";
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") return "border-l-4 border-l-emerald-600 border-slate-200";
    return "border-l-4 border-l-slate-300 border-slate-200";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onSelect(ticket)}
      className={`group relative cursor-grab rounded-2xl border bg-white/95 backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] active:cursor-grabbing space-y-3 ${getBorderColor()}`}
    >
      {/* Top Row: Ticket Number, Category, and Priority Badge */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center space-x-1.5 min-w-0">
          <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold shrink-0">
            {ticket.ticketNumber}
          </span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 truncate">
            {getCategoryShort(ticket.category)}
          </span>
        </div>

        <div>
          {isUrgent ? (
            <span className="flex items-center space-x-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>เร่งด่วน</span>
            </span>
          ) : ticket.status === "RESOLVED" ? (
            <span className="flex items-center space-x-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>ซ่อมเสร็จสิ้น</span>
            </span>
          ) : ticket.status === "CLOSED" ? (
            <span className="flex items-center space-x-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
              <span>ปิดงานแล้ว</span>
            </span>
          ) : ticket.status === "IN_PROGRESS" ? (
            <span className="flex items-center space-x-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>กำลังซ่อม</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>{ticket.priority === "LOW" ? "ความสำคัญต่ำ" : "ปกติ"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Title & Location with Compact Thumbnail at Right */}
      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2">
            {ticket.title}
          </h3>
        </div>

        {/* Compact Square Thumbnail (48x48px) */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ticket.attachments[0].url}
              alt={ticket.attachments[0].fileName || "หลักฐาน"}
              className="h-full w-full object-cover"
            />
            {ticket.attachments.length > 1 && (
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[8px] font-medium text-white">
                +{ticket.attachments.length - 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Location Sub-box with Depth */}
      <div className="mt-2 rounded-md bg-slate-50 border border-slate-100 p-2">
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate font-medium text-slate-700">
            ชั้น {ticket.floor || 1} • {ticket.roomName || ticket.room}
          </span>
          {ticket.specificPoint && (
            <span className="text-[10px] text-slate-500 truncate font-mono">
              ({ticket.specificPoint})
            </span>
          )}
        </div>
      </div>

      {/* In-Progress Step / Note Box */}
      {ticket.status === "IN_PROGRESS" && (
        <div className="mt-2.5 rounded-md bg-amber-50 border border-amber-200 p-2 text-[10px] text-amber-900">
          <div className="flex items-center justify-between font-medium">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-amber-700" />
              <span>กำลังดำเนินการ</span>
            </span>
            <span className="text-amber-800 font-mono">
              ~{ticket.etaMinutes || 30} นาที
            </span>
          </div>
          {ticket.stepNote && (
            <p className="mt-1 text-[10px] text-amber-800 truncate">
              {ticket.stepNote}
            </p>
          )}
        </div>
      )}

      {/* Completed / Verification Box */}
      {ticket.status === "RESOLVED" && (
        <div className="mt-2.5 rounded-md bg-emerald-50 border border-emerald-200 p-2 text-[10px] text-emerald-900 flex items-center justify-between">
          <span className="flex items-center space-x-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
            <span>หลักฐานการเสร็จสิ้น (ภาพถ่าย)</span>
          </span>
          <span className="rounded bg-emerald-200/80 px-1.5 py-0.2 font-mono text-[9px] font-bold text-emerald-900">
            1
          </span>
        </div>
      )}

      {/* Bottom Meta Row */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        {/* Reporter or Technician */}
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-700 border border-slate-200">
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
          <span className="font-medium text-slate-400">{timeAgoThai(ticket.createdAt)}</span>
          {ticket.attachments?.length > 0 && (
            <span className="flex items-center space-x-0.5 text-slate-400">
              <Paperclip className="h-3 w-3" />
              <span className="font-mono">{ticket.attachments.length}</span>
            </span>
          )}
          <span className="flex items-center space-x-0.5 text-slate-400">
            <MessageSquare className="h-3 w-3" />
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
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 py-2 px-3 text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>เริ่มเข้าหน้างาน</span>
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
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 py-2 px-3 text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>แนบรูปและปิดงาน</span>
            </button>
          )}

          {/* ป้ายแสดงผลเมื่อปิดงานแล้ว */}
          {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
            <div className="flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 py-1.5 px-3 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
              <span>{ticket.status === "CLOSED" ? "ปิดงานสมบูรณ์" : "ซ่อมเสร็จสิ้น"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

