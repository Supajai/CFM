// components/technician/TechnicianTaskCard.tsx - Technician Job Item Card
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  Flame,
  Camera,
  ExternalLink,
  ChevronRight,
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

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>รอดำเนินการซ่อม</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>กำลังซ่อมแซม</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>ซ่อมเสร็จ / รอตรวจรับ</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
            <span>ปิดงานสมบูรณ์</span>
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {ticket.status}
          </span>
        );
    }
  };

  return (
    <>
      <div
        className={`rounded-3xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
          ticket.isUrgent
            ? "border-rose-300 ring-1 ring-rose-200"
            : "border-slate-200"
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {ticket.ticketNumber}
            </span>
            {ticket.isUrgent && (
              <span className="flex items-center space-x-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 border border-rose-200">
                <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
                <span>เร่งด่วน SLA 15 นาที</span>
              </span>
            )}
          </div>

          <div>{getStatusBadge()}</div>
        </div>

        {/* Issue Title & Description */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-bold text-slate-900 leading-snug">
            {ticket.title}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Location & Time */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium">{ticket.room}</span>
            <span className="text-slate-400 text-[11px] truncate">
              ({ticket.building?.split("-")[0]})
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:justify-end text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>แจ้งเมื่อ {timeAgoThai(ticket.createdAt)}</span>
          </div>
        </div>

        {/* Photos Preview if available */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mt-3 flex items-center space-x-2 overflow-x-auto pb-1">
            {ticket.attachments.map((att: any, idx: number) => (
              <div
                key={idx}
                className="relative h-14 w-16 shrink-0 rounded-xl overflow-hidden border border-slate-200"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.url}
                  alt={att.fileName}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-bold">
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
            className="flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <span>ดู Timeline พิกัด</span>
            <ExternalLink className="h-3 w-3" />
          </Link>

          <div className="flex items-center space-x-2">
            {ticket.status === "ASSIGNED" && (
              <button
                type="button"
                onClick={handleStartRepair}
                disabled={isUpdating}
                className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition active:scale-95 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>เริ่มงานซ่อม</span>
              </button>
            )}

            {ticket.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-700 transition active:scale-95"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>แนบรูป & ปิดงาน</span>
              </button>
            )}

            {ticket.status === "RESOLVED" && (
              <span className="text-xs font-medium text-emerald-600 flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>รอผู้แจ้งตรวจรับ</span>
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
