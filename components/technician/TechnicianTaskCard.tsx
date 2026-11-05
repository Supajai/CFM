// components/technician/TechnicianTaskCard.tsx - Technician Job Item Card
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Play,
  Camera,
  ExternalLink,
  Flame,
} from "lucide-react";
import { updateTicketStatusAction } from "@/actions/ticket";
import { TicketStatus } from "@prisma/client";
import TechnicianResolveModal from "@/components/technician/TechnicianResolveModal";
import { timeAgoThai } from "@/lib/utils";

interface TechnicianTaskCardProps {
  ticket: any;
}

export default function TechnicianTaskCard({ ticket }: TechnicianTaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const cleanNumber = ticket.ticketNumber.replace("#", "");

  const handleStartRepair = async () => {
    try {
      setIsUpdating(true);
      await updateTicketStatusAction({
        ticketId: ticket.id,
        status: TicketStatus.IN_PROGRESS,
        note: "ช่างเทคนิคถึงหน้างานแล้ว และกำลังดำเนินการซ่อมแซม",
      });
      setIsUpdating(false);
    } catch (err) {
      console.error(err);
      setIsUpdating(false);
    }
  };

  const getBorderColor = () => {
    if (ticket.isUrgent) return "border-l-4 border-l-rose-500 border-slate-200";
    if (ticket.status === "IN_PROGRESS") return "border-l-4 border-l-amber-500 border-slate-200";
    if (ticket.status === "RESOLVED" || ticket.status === "CLOSED") return "border-l-4 border-l-emerald-600 border-slate-200";
    return "border-l-4 border-l-slate-300 border-slate-200";
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>รอดำเนินการซ่อม</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span>กำลังซ่อมแซม</span>
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0" />
            <span>พักงาน / ยกกลับศูนย์ซ่อม</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
            <span>ซ่อมเสร็จสิ้น</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>ปิดงานสมบูรณ์</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>{ticket.status}</span>
          </span>
        );
    }
  };

  return (
    <>
      <div
        className={`rounded-lg border bg-white p-4 shadow-sm transition-all hover:border-slate-300 ${getBorderColor()}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-semibold">
              {ticket.ticketNumber}
            </span>
            {ticket.isUrgent && (
              <span className="flex items-center space-x-1.5 rounded-md bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600 shrink-0" />
                <span className="font-mono">CRITICAL SLA 15m</span>
              </span>
            )}
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Issue Title & Description */}
        <div className="mt-3.5 space-y-1">
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
            {ticket.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
            {ticket.description}
          </p>
        </div>

        {/* Location & Time Inset Sub-box */}
        <div className="mt-4 rounded-md bg-slate-50 border border-slate-100 p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5 min-w-0">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800 truncate">
              ชั้น {ticket.floor || 1} • {ticket.roomName || ticket.room}
            </span>
            {ticket.specificPoint && (
              <span className="text-[11px] text-slate-500 font-medium truncate font-mono">
                ({ticket.specificPoint})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 sm:justify-end text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>แจ้งเมื่อ {timeAgoThai(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Photos Preview if available */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1">
            {ticket.attachments.map((att: any, idx: number) => (
              <div
                key={idx}
                className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.url}
                  alt={att.fileName}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center py-0.5 font-medium">
                  {att.type === "AFTER" ? "หลังซ่อม" : "ก่อนซ่อม"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <Link
            href={`/tracking/${cleanNumber}`}
            className="flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>ดู Timeline พิกัด</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <div className="flex items-center space-x-2">
            {(ticket.status === "ASSIGNED" ||
              ticket.status === "IN_PROGRESS" ||
              ticket.status === "ON_HOLD") && (
              <Link
                href={`/technician/active-task/${ticket.id}`}
                className="flex items-center space-x-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-colors"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{ticket.status === "ON_HOLD" ? "ดูงานพัก / นำกลับศูนย์" : "เข้าสู่หน้างาน"}</span>
              </Link>
            )}

            {ticket.status === "RESOLVED" && (
              <span className="text-xs font-medium text-emerald-800 flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-800" />
                <span>ซ่อมเสร็จสิ้น</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      <TechnicianResolveModal
        ticket={ticket}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
