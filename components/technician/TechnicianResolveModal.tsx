// components/technician/TechnicianResolveModal.tsx - Modal for Technician Completion
"use client";

import React, { useState } from "react";
import {
  X,
  Camera,
  CheckCircle2,
  Loader2,
  Upload,
  AlertCircle,
  Wrench,
} from "lucide-react";
import { resolveTicketWithPhotoAction, updateTicketStatusAction } from "@/actions/ticket";
import { TicketStatus } from "@prisma/client";

interface TechnicianResolveModalProps {
  ticket: {
    id: string;
    ticketNumber: string;
    title: string;
    room: string;
    building: string;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function TechnicianResolveModal({
  ticket,
  isOpen,
  onClose,
}: TechnicianResolveModalProps) {
  const [completionNote, setCompletionNote] = useState(
    "ดำเนินการแก้ไขและทดสอบระบบเรียบร้อยแล้ว อุปกรณ์พร้อมใช้งานตามปกติ"
  );
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await resolveTicketWithPhotoAction({
        ticketId: ticket.id,
        completionNote,
        photoUrl,
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการบันทึกปิดงาน");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                บันทึกซ่อมเสร็จสิ้น & แนบหลักฐาน
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {ticket.ticketNumber} • {ticket.room}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              รายละเอียดผลการดำเนินงานซ่อมแซม
            </label>
            <textarea
              rows={3}
              required
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
              placeholder="ระบุสาเหตุที่พบ วิธีการแก้ไข อะไหล่ที่เปลี่ยน..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-800 focus:border-slate-800 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ภาพถ่ายหลักฐานหลังการซ่อมเสร็จ (Proof of Work)
            </label>
            <div className="flex items-center space-x-3">
              {photoUrl ? (
                <div className="relative h-20 w-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="After repair proof"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[9px] font-bold text-white">
                    รูปหลังซ่อม
                  </span>
                </div>
              ) : (
                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera className="h-6 w-6" />
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="URL รูปภาพหลักฐาน..."
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  ระบบจำลองการอัปโหลดภาพถ่ายหลังซ่อมเสร็จเพื่อตรวจรับงาน
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>ยืนยันซ่อมเสร็จ & ปิดงาน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
