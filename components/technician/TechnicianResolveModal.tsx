// components/technician/TechnicianResolveModal.tsx - Modal for Technician Completion
"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Camera,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { resolveTicketAction } from "@/actions/ticket";

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

const RESOLUTION_TEMPLATES = [
  "เปลี่ยนอะไหล่และทดสอบบูตเครื่องคอมพิวเตอร์เข้าใช้งานระบบปฏิบัติการได้ตามปกติ",
  "เข้าหัวสายสัญญาณ LAN (RJ-45) ใหม่ และทดสอบความเร็วสัญญาณอินเทอร์เน็ตปกติ",
  "ตรวจสอบแอร์ ล้างแผงฟิลเตอร์ระบายอากาศ แก้ไขท่อน้ำทิ้งไม่อุดตัน",
  "ขันยึดรางปลั๊กไฟและตรวจวัดแรงดันไฟฟ้า 220V เรียบร้อย ปลอดภัย",
];

export default function TechnicianResolveModal({
  ticket,
  isOpen,
  onClose,
}: TechnicianResolveModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resolutionDetail, setResolutionDetail] = useState(
    "ดำเนินการตรวจสอบหน้างาน เปลี่ยนอุปกรณ์ที่ชำรุด และทดสอบการทำงานเรียบร้อยแล้ว อุปกรณ์พร้อมใช้งานตามปกติ"
  );
  const [photoUrl, setPhotoUrl] = useState(
    "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setPhotoUrl(fakeUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resolutionDetail.trim() || resolutionDetail.trim().length < 8) {
      setErrorMsg("กรุณาระบุรายละเอียดการแก้ไขหรืออะไหล่ที่ใช้อย่างน้อย 8 ตัวอักษร");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await resolveTicketAction({
        ticketId: ticket.id,
        resolutionNotes: resolutionDetail.trim(),
        resolutionDetail: resolutionDetail.trim(),
        afterImageUrl: photoUrl.trim() || undefined,
        photoUrl: photoUrl.trim() || undefined,
      });

      if (res.success) {
        onClose();
        router.refresh();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-md space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                บันทึกเสร็จสิ้นงานซ่อม (Resolve Work Order)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {ticket.ticketNumber} • {ticket.room}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 shadow-2xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* ข้อมูลตั๋วงานย่อ */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-900">หัวข้องาน:</span> {ticket.title}
          </div>

          {/* บังคับกรอก: รายละเอียดการแก้ไข / อะไหล่ที่ใช้ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-800">
                รายละเอียดการแก้ไข / อะไหล่ที่ใช้ <span className="text-rose-500">* (บังคับ)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {resolutionDetail.length} ตัวอักษร
              </span>
            </div>
            <textarea
              rows={3}
              required
              value={resolutionDetail}
              onChange={(e) => setResolutionDetail(e.target.value)}
              placeholder="ระบุสาเหตุที่พบ วิธีการซ่อมแซม รหัสอะไหล่ที่เปลี่ยน หรือผลการทดสอบระบบ..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal text-slate-900 shadow-xs focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
            />

            {/* Quick Templates Chips */}
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-slate-500 flex items-center space-x-1">
                <Zap className="h-3 w-3 text-emerald-600" />
                <span>ข้อความด่วนสำหรับช่าง:</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {RESOLUTION_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setResolutionDetail(tmpl)}
                    className="rounded-lg bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-[10px] text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition truncate max-w-full"
                  >
                    + {tmpl.slice(0, 32)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Before & After Photo Proof Comparison Slots */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800">
                หลักฐานภาพถ่ายเปรียบเทียบ (Before & After Photo Proof)
              </label>
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-medium text-emerald-700 border border-emerald-200">
                ตรวจสอบความโปร่งใส
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Left Column: Before Photo */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">1. ภาพก่อนซ่อม (Before)</span>
                  <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                    จากผู้แจ้ง
                  </span>
                </div>

                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-200/60 shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80"
                    alt="Before repair proof"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                    ก่อนเริ่มงาน
                  </span>
                </div>
              </div>

              {/* Right Column: After Photo */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-emerald-950">2. ภาพหลังซ่อม (After)</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                    ช่างแนบ
                  </span>
                </div>

                {photoUrl ? (
                  <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-emerald-300 shadow-2xs group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt="After repair proof"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                      ซ่อมเสร็จสิ้น
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl("")}
                      className="absolute top-1 right-1 rounded-md bg-black/75 text-white p-1 hover:bg-black transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50/50 transition p-2 text-center"
                  >
                    <Camera className="h-5 w-5 mb-1" />
                    <span className="text-[10px] font-semibold">แตะเพื่อถ่ายรูปปิดงาน</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">หรือเลือกรูปหลังซ่อม</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-5 py-2 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>บันทึกปิดงานซ่อมเสร็จสิ้น (RESOLVED)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
