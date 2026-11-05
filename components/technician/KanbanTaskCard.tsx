// components/technician/KanbanTaskCard.tsx - Technician-Specific Kanban Card with Ownership Protection
"use client";

import React, { useState } from "react";
import {
  MapPin,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Clock,
  Rocket,
  Camera,
  Hand,
  UserCheck,
  Lock,
  Loader2,
  Flame,
} from "lucide-react";
import { timeAgoThai } from "@/lib/utils";
import { claimTicketAction, updateTicketStatusAction } from "@/actions/ticket";
import { TicketStatus } from "@prisma/client";

interface KanbanTaskCardProps {
  task: any;
  currentUserId?: string;
  onSelect: (task: any) => void;
  onOpenResolveModal: (task: any) => void;
  onStatusChanged?: (ticketId: string, nextStatus: TicketStatus) => void;
}

export default function KanbanTaskCard({
  task,
  currentUserId,
  onSelect,
  onOpenResolveModal,
  onStatusChanged,
}: KanbanTaskCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // ตรวจสอบสถานะความเป็นเจ้าของงานตาม Requirement
  const isMyTask = Boolean(
    currentUserId &&
      (task.technicianId === currentUserId ||
        task.technician?.id === currentUserId)
  );
  const isUnassigned = !task.technicianId && !task.technician;

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

  const isUrgent =
    task.isUrgent || task.priority === "CRITICAL" || task.priority === "URGENT";

  const getBorderColor = () => {
    if (isUrgent) return "border-l-4 border-l-rose-500 border-slate-200";
    if (task.status === "IN_PROGRESS") return "border-l-4 border-l-amber-500 border-slate-200";
    if (task.status === "RESOLVED" || task.status === "CLOSED") return "border-l-4 border-l-emerald-600 border-slate-200";
    return "border-l-4 border-l-slate-300 border-slate-200";
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!isMyTask && !isUnassigned) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  // 1. กดรับงานกลางเข้าคิวฉัน
  const handleClaim = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsClaiming(true);
      const res = await claimTicketAction(task.id);
      if (res.success) {
        onStatusChanged?.(task.id, TicketStatus.ASSIGNED);
      } else {
        alert(res.error || "ไม่สามารถกดรับงานได้");
      }
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsClaiming(false);
    }
  };

  // 2. เริ่มเข้าหน้างาน
  const handleStartWork = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsStarting(true);
      const res = await updateTicketStatusAction({
        ticketId: task.id,
        status: TicketStatus.IN_PROGRESS,
        note: "ช่างเทคนิคลงพื้นที่ถึงหน้างานแล้ว และกำลังดำเนินการซ่อมแซม",
      });
      if (res.success) {
        onStatusChanged?.(task.id, TicketStatus.IN_PROGRESS);
      } else {
        alert(res.error || "ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (err: any) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div
      draggable={isMyTask || isUnassigned}
      onDragStart={handleDragStart}
      onClick={() => onSelect(task)}
      className={`group relative w-full min-w-0 rounded-2xl border bg-white/95 backdrop-blur-sm p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 active:scale-[0.99] ${
        isMyTask || isUnassigned
          ? "cursor-grab active:cursor-grabbing"
          : "cursor-pointer opacity-90"
      } ${getBorderColor()} ${isMyTask ? "ring-2 ring-emerald-500/20" : ""}`}
    >
      {/* Top Row: Ticket Number, Category, and Priority Badge */}
      <div className="flex items-center justify-between gap-1.5 text-xs min-w-0">
        <div className="flex items-center space-x-1.5 min-w-0 overflow-hidden">
          <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold shrink-0">
            {task.ticketNumber}
          </span>
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 truncate">
            {getCategoryShort(task.category)}
          </span>
        </div>

        <div className="shrink-0">
          {isUrgent ? (
            <span className="flex items-center space-x-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
              <span>เร่งด่วน</span>
            </span>
          ) : isMyTask ? (
            <span className="flex items-center space-x-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
              <span>งานของฉัน</span>
            </span>
          ) : isUnassigned ? (
            <span className="flex items-center space-x-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 shrink-0" />
              <span>งานกองกลาง</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>{task.priority === "LOW" ? "ความสำคัญต่ำ" : "ปกติ"}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content: Title & Location with Compact Thumbnail at Right */}
      <div className="mt-2.5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 break-words">
            {task.title}
          </h3>
        </div>

        {/* Compact Square Thumbnail (48x48px) */}
        {task.attachments && task.attachments.length > 0 && (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={task.attachments[0].url}
              alt={task.attachments[0].fileName || "ภาพหลักฐาน"}
              className="h-full w-full object-cover"
            />
            {task.attachments.length > 1 && (
              <span className="absolute bottom-0.5 right-0.5 rounded bg-black/75 px-1 text-[8px] font-medium text-white">
                +{task.attachments.length - 1}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Location Sub-box with Layering */}
      <div className="mt-2 rounded-md bg-slate-50 border border-slate-100 p-2">
        <div className="flex items-center space-x-1.5 text-[11px] text-slate-600 min-w-0">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate font-medium text-slate-700">
            ชั้น {task.floor || 1} • {task.roomName || task.room}
          </span>
          {task.specificPoint && (
            <span className="text-[10px] text-slate-500 truncate font-mono">
              ({task.specificPoint})
            </span>
          )}
        </div>
      </div>

      {/* Meta Footer */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500">
        <div className="flex items-center space-x-1.5 min-w-0">
          <Clock className="h-3 w-3 shrink-0 text-slate-400" />
          <span className="font-medium text-slate-400">{timeAgoThai(task.createdAt)}</span>
        </div>

        {task.attachments?.length > 0 && (
          <span className="flex items-center space-x-0.5 text-slate-400 font-mono">
            <Paperclip className="h-3 w-3" />
            <span>{task.attachments.length}</span>
          </span>
        )}
      </div>

      {/* --- Action Area with Strict Ownership Check --- */}
      <div className="mt-2.5 pt-2 border-t border-slate-100">
        {/* กรณีที่ 1: งานกองกลางที่ยังไม่มีช่างรับผิดชอบ (isUnassigned) */}
        {isUnassigned && (
          <button
            type="button"
            onClick={handleClaim}
            disabled={isClaiming}
            className="w-full flex items-center justify-center space-x-1.5 rounded-md bg-emerald-800 text-white hover:bg-emerald-900 py-1.5 px-3 text-xs font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {isClaiming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>กำลังรับงาน...</span>
              </>
            ) : (
              <>
                <Hand className="h-3.5 w-3.5" />
                <span>กดรับงานนี้เข้าคิวฉัน</span>
              </>
            )}
          </button>
        )}

        {/* กรณีที่ 2: งานของช่างท่านอื่น (!isUnassigned && !isMyTask) -> Read-only + Badge */}
        {!isUnassigned && !isMyTask && (
          <div className="flex items-center justify-between gap-1 rounded-md bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-[10px] text-slate-600 min-w-0">
            <span className="flex items-center space-x-1 font-medium text-slate-700 truncate min-w-0">
              <Lock className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="shrink-0">ช่างผู้ดูแล:</span>
              <span className="text-slate-900 font-semibold truncate">
                {task.technician?.name || "ช่างท่านอื่น"}
              </span>
            </span>
            <span className="rounded bg-slate-200 px-1 py-0.2 text-[9px] font-mono text-slate-600 shrink-0">
              Read-only
            </span>
          </div>
        )}

        {/* กรณีที่ 3: งานที่เป็นของตัวฉันเอง (isMyTask) */}
        {isMyTask && (
          <>
            {/* สถานะ "มอบหมายแล้ว / รอดำเนินการ" (ASSIGNED หรือ PENDING ที่ผูกแล้ว) */}
            {(task.status === "ASSIGNED" || task.status === "PENDING") && (
              <button
                type="button"
                onClick={handleStartWork}
                disabled={isStarting}
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 py-2 px-3.5 text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="h-3.5 w-3.5" />
                    <span>เริ่มเข้าหน้างาน</span>
                  </>
                )}
              </button>
            )}

            {/* สถานะ "กำลังดำเนินการซ่อม" (IN_PROGRESS) */}
            {task.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenResolveModal(task);
                }}
                className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:from-emerald-500 hover:to-teal-600 py-2 px-3.5 text-xs font-bold shadow-md shadow-emerald-700/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>แนบรูปและปิดงาน</span>
              </button>
            )}

            {/* สถานะ "เสร็จสิ้น / ซ่อมเสร็จแล้ว" (RESOLVED หรือ CLOSED) */}
            {(task.status === "RESOLVED" || task.status === "CLOSED") && (
              <div className="flex items-center justify-center space-x-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 py-1.5 px-3 text-xs font-bold shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                <span>
                  {task.status === "CLOSED"
                    ? "ปิดงานสมบูรณ์แล้ว"
                    : "ซ่อมเสร็จสิ้น"}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
