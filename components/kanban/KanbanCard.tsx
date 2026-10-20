// components/kanban/KanbanCard.tsx
"use client";

import React from "react";
import {
  MapPin,
  Clock,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  Flame,
  ChevronRight,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { timeAgoThai } from "@/lib/utils";

interface KanbanCardProps {
  ticket: any;
  onSelect: (ticket: any) => void;
  onMoveStatus?: (ticketId: string, nextStatus: string) => void;
}

export default function KanbanCard({
  ticket,
  onSelect,
  onMoveStatus,
}: KanbanCardProps) {
  // ฟังก์ชันแปลหมวดหมู่ย่อ
  const getCategoryShort = (cat: string) => {
    switch (cat) {
      case "AIR_CONDITIONING":
        return "ระบบปรับอากาศ";
      case "ELECTRICAL":
        return "ระบบไฟฟ้า";
      case "PLUMBING":
        return "ระบบประปา";
      case "IT_EQUIPMENT":
        return "ไอทีและโสตทัศน์";
      case "FURNITURE":
        return "งานอุปกรณ์ฮาร์ดแวร์";
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
      className={`group relative cursor-grab rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:cursor-grabbing ${
        isUrgent
          ? "border-l-4 border-l-rose-500 border-slate-200/90"
          : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Top Row: Ticket Number, Category, and Priority Badge */}
      <div className="flex items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="font-mono font-bold text-slate-900 text-[11px]">
            {ticket.ticketNumber}
          </span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            {getCategoryShort(ticket.category)}
          </span>
        </div>

        <div>
          {isUrgent ? (
            <span className="flex items-center space-x-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-100">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>เร่งด่วน</span>
            </span>
          ) : ticket.status === "RESOLVED" ? (
            <span className="flex items-center space-x-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>รอนักศึกษาตรวจรับ</span>
            </span>
          ) : ticket.status === "CLOSED" ? (
            <span className="flex items-center space-x-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              <span>ปิดงานแล้ว</span>
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
              {ticket.priority === "LOW" ? "ความสำคัญต่ำ" : "ปกติ"}
            </span>
          )}
        </div>
      </div>

      {/* Main Title */}
      <h3 className="mt-2 text-xs font-bold leading-snug text-slate-900 group-hover:text-blue-600 transition">
        {ticket.title}
      </h3>

      {/* Location */}
      <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-slate-500">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="truncate">
          {ticket.building}, {ticket.room}
        </span>
      </div>

      {/* Optional Thumbnail Image */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <div className="mt-2.5 relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ticket.attachments[0].url}
            alt={ticket.attachments[0].fileName || "หลักฐาน"}
            className="h-full w-full object-cover"
          />
          {ticket.attachments.length > 1 && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
              +{ticket.attachments.length - 1} รูป
            </span>
          )}
        </div>
      )}

      {/* In-Progress Step / Note Box (Column 2 specific) */}
      {ticket.status === "IN_PROGRESS" && (
        <div className="mt-2.5 rounded-xl bg-blue-50/80 border border-blue-100/90 p-2 text-[10px] text-blue-900">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3 text-blue-600" />
              <span>เบิกอะไหล่จากคลังเรียบร้อย</span>
            </span>
            <span className="text-blue-600">
              กำหนดเสร็จ ~{ticket.etaMinutes || 30} นาที
            </span>
          </div>
          {ticket.stepNote && (
            <p className="mt-1 text-[10px] text-blue-700 truncate">
              {ticket.stepNote}
            </p>
          )}
        </div>
      )}

      {/* Completed / Verification Box (Column 3 specific) */}
      {ticket.status === "RESOLVED" && (
        <div className="mt-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 p-2 text-[10px] text-emerald-900 flex items-center justify-between">
          <span className="flex items-center space-x-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>หลักฐานการเสร็จสิ้น (ภาพถ่าย 2 ใบ)</span>
          </span>
          <span className="rounded bg-emerald-200/60 px-1 py-0.2 font-mono text-[9px] font-bold">
            +1
          </span>
        </div>
      )}

      {/* Bottom Meta Row */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-500">
        {/* Reporter or Technician */}
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
            {ticket.technician?.name
              ? ticket.technician.name.charAt(0)
              : ticket.reporter?.name
              ? ticket.reporter.name.charAt(0)
              : "ศ"}
          </div>
          <span className="truncate max-w-[120px]">
            {ticket.technician?.name
              ? `ช่าง: ${ticket.technician.name.split(" ")[0]}`
              : ticket.reporter?.name || "ศุภวิชญ์"}
          </span>
        </div>

        {/* Time and Icon Counts */}
        <div className="flex items-center space-x-2 shrink-0">
          <span>{timeAgoThai(ticket.createdAt)}</span>
          {ticket.attachments?.length > 0 && (
            <span className="flex items-center space-x-0.5 text-slate-400">
              <Paperclip className="h-3 w-3" />
              <span>{ticket.attachments.length}</span>
            </span>
          )}
          <span className="flex items-center space-x-0.5 text-slate-400">
            <MessageSquare className="h-3 w-3" />
            <span>2</span>
          </span>
        </div>
      </div>
    </div>
  );
}
