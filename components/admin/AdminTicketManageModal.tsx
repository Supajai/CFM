// components/admin/AdminTicketManageModal.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
  Camera,
  Maximize2,
  Wrench,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Save,
  Ban,
  FileText,
  Layers,
  ChevronDown,
  Info,
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import { updateTicketByAdminAction, cancelTicketAction } from "@/actions/ticket";
import { DEPARTMENT_FLOORS_DATA } from "@/lib/constants/department-locations";

export interface AdminTicketManageModalTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  building: string;
  floor: number;
  room: string;
  roomName?: string | null;
  specificPoint?: string | null;
  priority: string;
  isUrgent?: boolean;
  slaTargetMinutes?: number | null;
  status: string;
  rating?: number | null;
  feedback?: string | null;
  feedbackComment?: string | null;
  cancelReason?: string | null;
  stepNote?: string | null;
  resolutionDetail?: string | null;
  createdAt: string | Date;
  resolvedAt?: string | Date | null;
  closedAt?: string | Date | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  reporter?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
    position?: string | null;
  } | null;
  technician?: {
    id?: string;
    name?: string | null;
    technicianCode?: string | null;
    phone?: string | null;
  } | null;
  technicianId?: string | null;
  attachments?: Array<{
    id: string;
    url: string;
    type?: string;
    fileName?: string;
  }>;
}

export interface TechnicianOption {
  id: string;
  name: string;
  technicianCode?: string | null;
  department?: string | null;
  phone?: string | null;
}

interface AdminTicketManageModalProps {
  ticket: AdminTicketManageModalTicket | null;
  isOpen: boolean;
  onClose: () => void;
  technicians: TechnicianOption[];
  onSuccess?: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "PC_HARDWARE", label: "อุปกรณ์คอมพิวเตอร์ / ฮาร์ดแวร์" },
  { value: "NETWORK", label: "ระบบเครือข่ายและอินเทอร์เน็ต" },
  { value: "AIR_CONDITIONING", label: "เครื่องปรับอากาศ" },
  { value: "ELECTRICAL", label: "ระบบไฟฟ้าและแสงสว่าง" },
  { value: "AV_EQUIPMENT", label: "โสตทัศนูปกรณ์ / สื่อการสอน" },
  { value: "PLUMBING", label: "ระบบประปาและสุขภัณฑ์" },
  { value: "FURNITURE", label: "งานโครงสร้าง / ครุภัณฑ์ / สถานที่" },
  { value: "OTHER", label: "อื่นๆ" },
];

const PRIORITY_OPTIONS = [
  {
    value: "CRITICAL",
    label: "CRITICAL (ด่วนวิกฤต - SLA 15-30 นาที)",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    value: "HIGH",
    label: "HIGH / URGENT (ร้ายแรงสูง - SLA 1-2 ชม.)",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    value: "NORMAL",
    label: "NORMAL (ปกติ/ปานกลาง - SLA 24 ชม.)",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "LOW",
    label: "LOW (ไม่ร้ายแรง/ทั่วไป - SLA 48-72 ชม.)",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

const CANCEL_REASON_OPTIONS = [
  {
    value: "DUPLICATE",
    label: "แจ้งซ้ำซ้อน (Duplicate Ticket)",
    desc: "มีคำร้องปัญหาเดียวกันในห้องนี้แจ้งเข้ามาแล้ว",
  },
  {
    value: "INVALID_INFO",
    label: "ข้อมูลไม่ชัดเจน / ติดต่อผู้แจ้งไม่ได้ (Invalid Info)",
    desc: "ระบุพิกัดไม่ชัดเจน และไม่สามารถติดต่อผู้แจ้งได้",
  },
  {
    value: "OUT_OF_SCOPE",
    label: "นอกเหนือขอบเขตงานซ่อมบำรุง (Out of Scope)",
    desc: "เป็นงานที่อยู่นอกเหนือภารกิจงานช่างของแผนก",
  },
  {
    value: "RESOLVED_BY_USER",
    label: "ผู้แจ้งแก้ปัญหาเองได้แล้ว (Resolved by User)",
    desc: "ผู้แจ้งแจ้งว่าปัญหาคลี่คลายแล้วโดยไม่ต้องใช้ช่าง",
  },
  {
    value: "SPAM_OR_FALSE",
    label: "สแปม / ข้อมูลเท็จ (Spam or False Report)",
    desc: "ข้อมูลเท็จ หรือการส่งคำร้องก่อกวน",
  },
];

export default function AdminTicketManageModal({
  ticket,
  isOpen,
  onClose,
  technicians,
  onSuccess,
}: AdminTicketManageModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Zone 2: Triage Form States
  const [technicianId, setTechnicianId] = useState<string>("");
  const [priority, setPriority] = useState<string>("NORMAL");
  const [category, setCategory] = useState<string>("PC_HARDWARE");
  const [roomId, setRoomId] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Zone 3: Cancellation Danger Box States
  const [isCancelBoxOpen, setIsCancelBoxOpen] = useState<boolean>(false);
  const [cancelCategory, setCancelCategory] = useState<
    "DUPLICATE" | "INVALID_INFO" | "OUT_OF_SCOPE" | "RESOLVED_BY_USER" | "SPAM_OR_FALSE"
  >("DUPLICATE");
  const [cancelNotes, setCancelNotes] = useState<string>("");

  // Lightbox Zoom
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Initialize form when ticket changes
  useEffect(() => {
    if (ticket) {
      setTechnicianId(ticket.technicianId || ticket.technician?.id || "");
      // Map ticket priority
      const p = ticket.priority?.toUpperCase();
      if (p === "CRITICAL") setPriority("CRITICAL");
      else if (p === "URGENT" || p === "HIGH") setPriority("HIGH");
      else if (p === "LOW") setPriority("LOW");
      else setPriority("NORMAL");

      setCategory(ticket.category || "PC_HARDWARE");
      setRoomId(ticket.room || "");
      setAdminNotes("");
      setIsCancelBoxOpen(false);
      setCancelNotes("");
      setFeedback(null);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const isCancelled = ticket.status === "CANCELLED";

  // Photo resolution: Before & After
  const beforeAttachment = ticket.attachments?.find((a) => a.type === "BEFORE");
  const afterAttachment = ticket.attachments?.find((a) => a.type === "AFTER");

  const beforePhoto =
    ticket.beforeImageUrl ||
    beforeAttachment?.url ||
    ticket.attachments?.find((a) => a.type !== "AFTER")?.url ||
    null;

  const afterPhoto =
    ticket.afterImageUrl ||
    afterAttachment?.url ||
    null;

  const isResolvedOrHasAfter =
    ticket.status === "RESOLVED" ||
    ticket.status === "CLOSED" ||
    Boolean(afterPhoto);

  // Handle Save Triage
  const handleSaveTriage = () => {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateTicketByAdminAction({
        ticketId: ticket.id,
        technicianId: technicianId || null,
        priority: priority as any,
        category,
        roomId,
        adminNotes: adminNotes.trim() || undefined,
      });

      if (res.success) {
        setFeedback({ type: "success", text: "บันทึกการปรับปรุงข้อมูลตั๋วเรียบร้อยแล้ว" });
        router.refresh();
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการบันทึก" });
      }
    });
  };

  // Handle Cancel Ticket
  const handleConfirmCancel = () => {
    if (!cancelNotes.trim()) {
      setFeedback({ type: "error", text: "กรุณาระบุรายละเอียดเหตุผลการยกเลิกคำร้อง" });
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      const res = await cancelTicketAction({
        ticketId: ticket.id,
        cancelReasonCategory: cancelCategory,
        cancelNotes: cancelNotes.trim(),
      });

      if (res.success) {
        setFeedback({ type: "success", text: "ยกเลิกคำร้องและบันทึกเหตุผลในระบบเรียบร้อยแล้ว" });
        router.refresh();
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1400);
      } else {
        setFeedback({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการยกเลิกคำร้อง" });
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex items-start justify-between shrink-0">
          <div className="pr-4 space-y-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="chip-tech font-mono font-bold text-xs bg-slate-900 text-white border-slate-800 py-0.5 px-2.5">
                {ticket.ticketNumber}
              </span>
              <span
                className={`chip-tech text-[10px] font-bold py-0.5 px-2 ${
                  isCancelled
                    ? "bg-rose-100 text-rose-800 border-rose-300"
                    : ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : ticket.status === "IN_PROGRESS"
                    ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                    : ticket.status === "ASSIGNED"
                    ? "bg-blue-100 text-blue-800 border-blue-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                สถานะ: {ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? "RESOLVED (ซ่อมเสร็จสิ้น)" : ticket.status}
              </span>
              {ticket.isUrgent && (
                <span className="chip-tech text-[10px] bg-rose-50 text-rose-700 border-rose-200 font-bold py-0.5 px-2">
                  ด่วน SLA {ticket.slaTargetMinutes || 15}m
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              ศูนย์ตรวจสอบและบริหารจัดการตั๋ว
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              แจ้งเมื่อ: {formatDateThai(ticket.createdAt)} ({timeAgoThai(ticket.createdAt)})
            </p>
          </div>

          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0 disabled:opacity-50"
            title="ปิดหน้าต่าง"
          >
            <X className="h-4.5 w-4.5" strokeWidth={2} />
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* ========================================================
              โซนที่ 1: สรุปข้อมูลตั๋ว (Ticket Overview - Read-only)
             ======================================================== */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                <span>1. สรุปข้อมูลตั๋วแจ้งซ่อม (Ticket Overview)</span>
              </span>
              <a
                href={`/tracking/${ticket.ticketNumber.replace("#", "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <span>เปิดหน้าติดตาม (Tracking)</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            {/* Reporter & Location Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Reporter Box */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-xs shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ผู้แจ้งประสานงาน
                </span>
                <div className="flex items-center space-x-2 font-semibold text-slate-900">
                  <User className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{ticket.reporter?.name || "ผู้ใช้งานในระบบ"}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span>สถานะ: {ticket.reporter?.role || "ผู้ใช้งาน"}</span>
                  {ticket.reporter?.phone ? (
                    <a
                      href={`tel:${ticket.reporter.phone}`}
                      className="font-mono text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Phone className="h-3 w-3" />
                      {ticket.reporter.phone}
                    </a>
                  ) : (
                    <span className="text-slate-400">ไม่มีเบอร์โทร</span>
                  )}
                </div>
              </div>

              {/* Location Box */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-xs shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  สถานที่เกิดเหตุ
                </span>
                <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                  <MapPin className="h-3.5 w-3.5 text-rose-600" />
                  <span>
                    ชั้น {ticket.floor} • {ticket.roomName || ticket.room}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {ticket.building}
                  {ticket.specificPoint ? ` • ${ticket.specificPoint}` : ""}
                </p>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200/90 text-xs">
              <span className="font-bold text-slate-900 block text-sm">{ticket.title}</span>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xs">
                {ticket.description}
              </p>
            </div>

            {/* Rating & Feedback Preview if exists */}
            {ticket.rating && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>คะแนนความพึงพอใจจากผู้แจ้ง: {ticket.rating}/5 ดาว</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold border border-amber-200">
                    รีวิวการบริการ
                  </span>
                </div>
                {ticket.feedback && (
                  <p className="text-slate-700 italic text-[11px] bg-white/80 p-2.5 rounded-lg border border-amber-100">
                    &ldquo;{ticket.feedback}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Technician Resolution Detail / Proof of Work Note */}
            {(ticket.resolutionDetail || ticket.stepNote || ticket.resolvedAt) && isResolvedOrHasAfter && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2 text-xs shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>บันทึกผลการซ่อมแซมของช่างเทคนิค (Resolution Detail)</span>
                  </span>
                  {ticket.resolvedAt && (
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                      ซ่อมเสร็จ: {formatDateThai(ticket.resolvedAt)}
                    </span>
                  )}
                </div>
                <div className="bg-white/90 p-3 rounded-lg border border-emerald-100 text-slate-800 leading-relaxed font-medium">
                  {ticket.resolutionDetail || ticket.stepNote || "ช่างดำเนินการซ่อมแซมแก้ไขเรียบร้อยแล้ว อุปกรณ์พร้อมใช้งานตามปกติ"}
                </div>
                {ticket.technician && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 pt-0.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Wrench className="h-3.5 w-3.5 text-emerald-600" />
                      <span>
                        ช่างผู้ปฏิบัติงาน: <strong>{ticket.technician.name || "ช่างเทคนิค"}</strong>{" "}
                        {ticket.technician.technicianCode ? `(${ticket.technician.technicianCode})` : ""}
                      </span>
                    </span>
                    {ticket.technician.phone && (
                      <a
                        href={`tel:${ticket.technician.phone}`}
                        className="hover:underline flex items-center gap-1 font-semibold text-emerald-700 bg-white/70 px-2 py-0.5 rounded border border-emerald-200/60"
                      >
                        <Phone className="h-3 w-3" />
                        <span>{ticket.technician.phone}</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Photo Evidence: Before vs After */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    {isResolvedOrHasAfter
                      ? "หลักฐานเปรียบเทียบภาพถ่ายก่อนและหลังซ่อม (Before vs After Evidence)"
                      : "รูปภาพหลักฐานความเสียหาย (Before Photo)"}
                  </span>
                </span>
                {isResolvedOrHasAfter && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 rounded-md px-2 py-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Side-by-Side Proof of Work</span>
                  </span>
                )}
              </div>

              {isResolvedOrHasAfter ? (
                /* 2-Column Side-by-Side Comparison */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Left Column: Before Photo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
                        <span>ภาพก่อนซ่อม (Before)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                        จากผู้แจ้งซ่อม
                      </span>
                    </div>

                    {beforePhoto ? (
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 aspect-4/3 flex items-center justify-center transition shadow-2xs hover:shadow-md hover:border-slate-300"
                        onClick={() =>
                          setZoomedImage({
                            url: beforePhoto,
                            title: `ภาพก่อนซ่อม (Before Photo) - ${ticket.ticketNumber}`,
                          })
                        }
                      >
                        <img
                          src={beforePhoto}
                          alt="ภาพก่อนซ่อม (Before)"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                          <Maximize2 className="h-4 w-4" />
                          <span>แตะเพื่อดูภาพขยาย</span>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono flex items-center gap-1 shadow-sm">
                          <Camera className="h-3 w-3 text-amber-300" />
                          <span>Before</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-400 aspect-4/3 flex flex-col items-center justify-center">
                        <Camera className="h-6 w-6 text-slate-300 mb-1.5" />
                        <span>ไม่มีภาพถ่ายก่อนซ่อม</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: After Photo */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
                        <span>ภาพหลังซ่อมเสร็จสิ้น (After)</span>
                      </span>
                      <span className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        หลักฐานจากช่าง
                      </span>
                    </div>

                    {afterPhoto ? (
                      <div
                        className="relative group cursor-pointer overflow-hidden rounded-xl border border-emerald-300 bg-emerald-950/5 aspect-4/3 flex items-center justify-center transition shadow-2xs hover:shadow-md hover:border-emerald-400 ring-2 ring-emerald-500/20"
                        onClick={() =>
                          setZoomedImage({
                            url: afterPhoto,
                            title: `ภาพหลังซ่อมเสร็จสิ้น (After Photo) - ${ticket.ticketNumber}`,
                          })
                        }
                      >
                        <img
                          src={afterPhoto}
                          alt="ภาพหลังซ่อมเสร็จสิ้น (After)"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                          <Maximize2 className="h-4 w-4" />
                          <span>แตะเพื่อดูภาพขยาย</span>
                        </div>
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-emerald-900/90 text-white text-[10px] font-mono flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          <span>After</span>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/30 p-6 text-center text-xs text-emerald-700/70 aspect-4/3 flex flex-col items-center justify-center">
                        <Camera className="h-6 w-6 text-emerald-300 mb-1.5" />
                        <span>รอหลักฐานภาพถ่ายหลังซ่อมจากช่าง</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Single Column: Before Photo (PENDING / ASSIGNED / IN_PROGRESS without afterPhoto) */
                <div>
                  {beforePhoto ? (
                    <div
                      className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 aspect-video sm:aspect-21/9 max-h-48 flex items-center justify-center transition shadow-2xs hover:shadow-md hover:border-slate-300"
                      onClick={() =>
                        setZoomedImage({
                          url: beforePhoto,
                          title: `ภาพถ่ายอาการเสียก่อนซ่อม (Before Photo) - ${ticket.ticketNumber}`,
                        })
                      }
                    >
                      <img
                        src={beforePhoto}
                        alt="ภาพถ่ายอาการเสีย"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1.5">
                        <Maximize2 className="h-4 w-4" />
                        <span>แตะเพื่อเปิดดูภาพขยาย</span>
                      </div>
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        <span>ภาพถ่ายอาการเสีย (Before)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-xs text-slate-400">
                      <Camera className="h-5 w-5 mx-auto mb-1 text-slate-300" />
                      <span>ไม่มีภาพถ่ายอาการเสียจากผู้แจ้ง</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================
              โซนที่ 2: ปรับปรุงการจัดการ (Triage & Reassign Controls)
             ======================================================== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">
                2. ปรับปรุงการจัดการใบงาน (Triage & Reassign Controls)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* 1. ช่างผู้รับผิดชอบ */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  ช่างผู้รับผิดชอบ (Technician Assignee):
                </label>
                <select
                  disabled={isPending || isCancelled}
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                >
                  <option value="">ยังไม่ระบุช่าง (งานกองกลาง)</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (รหัส: {t.technicianCode || "-"})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block">
                  * หากมอบหมายช่าง ตั๋วจะเปลี่ยนสถานะเป็น &quot;มอบหมายแล้ว&quot; ทันที
                </span>
              </div>

              {/* 2. ระดับความเร่งด่วน */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  ระดับความเร่งด่วน (Severity / Priority):
                </label>
                <select
                  disabled={isPending || isCancelled}
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block">
                  * ระบบจะคำนวณเป้าหมายเวลา SLA อัตโนมัติตามระดับความเร่งด่วน
                </span>
              </div>

              {/* 3. หมวดหมู่งาน */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  หมวดหมู่งานซ่อม (Category):
                </label>
                <select
                  disabled={isPending || isCancelled}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. ห้อง / พิกัดสถานที่ */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  ห้องเกิดเหตุ (Location / Room):
                </label>
                <select
                  disabled={isPending || isCancelled}
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
                >
                  <option value="">-- เลือกห้องประจำอาคาร --</option>
                  {DEPARTMENT_FLOORS_DATA.map((floor) => (
                    <optgroup key={floor.floor} label={`ชั้น ${floor.floor} (${floor.label})`}>
                      {floor.rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          [{room.id}] {room.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. บันทึกช่วยจำของแอดมิน */}
            <div className="space-y-1.5 text-xs pt-1">
              <label className="font-semibold text-slate-700 block">
                บันทึกช่วยจำของแอดมิน (Admin Internal Notes / Dispatch Instruction):
              </label>
              <textarea
                disabled={isPending || isCancelled}
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="ระบุข้อความประสานงานภายใน เช่น แจ้งช่างให้เข้าหน้างานช่วงบ่าย หรือประสานขอเปิดห้องแล็บแล้ว..."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60"
              />
            </div>

            {/* Save Button */}
            {!isCancelled && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleSaveTriage}
                  className="btn-primary-gradient px-5 py-2.5 text-xs font-bold rounded-xl shadow-md flex items-center space-x-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>บันทึกการเปลี่ยนแปลง</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ========================================================
              โซนที่ 3: โซนยกเลิกคำร้อง (Cancellation Zone - Danger Box)
             ======================================================== */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs">
                <ShieldAlert className="h-4 w-4 text-rose-600" />
                <span>3. การยกเลิกและปฏิเสธคำร้อง (Cancellation & Rejection)</span>
              </div>
              {isCancelled && (
                <span className="chip-tech text-[10px] font-bold bg-rose-100 text-rose-800 border-rose-300 py-0.5 px-2">
                  คำร้องนี้ถูกยกเลิกแล้ว
                </span>
              )}
            </div>

            {isCancelled ? (
              <div className="bg-white p-3 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                <span className="font-semibold block">สาเหตุการยกเลิก:</span>
                <p className="text-slate-700">{ticket.cancelReason || ticket.stepNote || "ยกเลิกโดยผู้ดูแลระบบ"}</p>
              </div>
            ) : !isCancelBoxOpen ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <p className="text-[11px] text-slate-600 leading-relaxed max-w-lg">
                  การยกเลิกคำร้องจะไม่ลบข้อมูลออกจากฐานข้อมูล (Audit Trail Compliance)
                  แต่จะปรับสถานะเป็น <strong className="text-rose-700">CANCELLED</strong>{" "}
                  และตัดตั๋วออกจากกระดานงานช่างและแผนผัง 2.5D ทันที
                </p>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsCancelBoxOpen(true)}
                  className="px-4 py-2 rounded-xl border border-rose-300 bg-white hover:bg-rose-100 text-rose-700 font-bold text-xs shadow-2xs transition cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>ยกเลิก/ปฏิเสธคำร้องนี้</span>
                </button>
              </div>
            ) : (
              /* Expanded Cancellation Form */
              <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-3.5 animate-in fade-in text-xs">
                <div className="rounded-lg bg-rose-50 p-2.5 border border-rose-200/80 text-[11px] text-rose-800">
                  กรุณาเลือกหมวดหมู่และระบุเหตุผลการยกเลิกคำร้องอย่างชัดเจน
                  เพื่อเป็นหลักฐานอ้างอิงและแจ้งให้ผู้ส่งคำร้องทราบ
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">
                    หมวดหมู่เหตุผลในการยกเลิก:
                  </label>
                  <select
                    disabled={isPending}
                    value={cancelCategory}
                    onChange={(e) => setCancelCategory(e.target.value as any)}
                    className="w-full text-xs rounded-xl border border-slate-300 bg-white p-2 focus:border-rose-500 focus:outline-none"
                  >
                    {CANCEL_REASON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 block">
                    รายละเอียดเหตุผลเพิ่มเติม (ระบุให้ชัดเจน):
                  </label>
                  <textarea
                    disabled={isPending}
                    rows={3}
                    value={cancelNotes}
                    onChange={(e) => setCancelNotes(e.target.value)}
                    placeholder="เช่น ตรวจสอบพบว่ามีเคส #REP-089 ซ่อมอุปกรณ์ตัวเดียวกันอยู่แล้ว หรือโทรตรวจสอบผู้แจ้งแล้วแจ้งว่าปิดเครื่องและเปิดใหม่ใช้งานได้ปกติ..."
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      setIsCancelBoxOpen(false);
                      setCancelNotes("");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition cursor-pointer"
                  >
                    ยกเลิก (ปิดแถบนี้)
                  </button>
                  <button
                    type="button"
                    disabled={isPending || !cancelNotes.trim()}
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        <span>ยืนยันยกเลิกคำร้อง (CANCELLED)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ระบบตรวจสอบและบันทึกประวัติความปลอดภัย (Audit Trail Logged)
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Lightbox Zoom Modal for Before / After Photos */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-3 border border-slate-700 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2.5 px-2 text-white border-b border-slate-800">
              <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2 truncate">
                <Camera className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate">{zoomedImage.title}</span>
              </span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer shrink-0 ml-2"
                title="ปิด"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 w-full flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={zoomedImage.url}
                alt={zoomedImage.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 px-2">
              <span>แตะพื้นหลังเพื่อปิดหน้าต่าง</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
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
