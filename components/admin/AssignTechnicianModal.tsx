// components/admin/AssignTechnicianModal.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  Loader2,
  Clock,
  Hammer,
  AlertCircle,
  Building,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { assignTechnicianAction } from "@/actions/ticket";
import { Category } from "@prisma/client";
import { getRepairCategoryDef } from "@/lib/constants/campus-master-data";

interface TechnicianOption {
  id: string;
  name: string;
  email: string;
  technicianCode?: string | null;
  department?: string | null;
  specialty?: string | null;
}

interface AssignTechnicianModalProps {
  ticket: {
    id: string;
    ticketNumber: string;
    title: string;
    room: string;
    building?: string;
    category?: Category | string;
    isUrgent: boolean;
  };
  technicians: TechnicianOption[];
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignTechnicianModal({
  ticket,
  technicians,
  isOpen,
  onClose,
}: AssignTechnicianModalProps) {
  const categoryDef = ticket.category ? getRepairCategoryDef(ticket.category) : null;

  const recommendedTech = useMemo(() => {
    if (!categoryDef || technicians.length === 0) return technicians[0] || null;

    const matched = technicians.find((t) => {
      if (!t.specialty) return false;
      return categoryDef.recommendedSpecialties.some((spec) =>
        t.specialty?.toLowerCase().includes(spec.toLowerCase()) ||
        spec.toLowerCase().includes(t.specialty?.toLowerCase() || "")
      );
    });

    return matched || technicians[0] || null;
  }, [categoryDef, technicians]);

  const [selectedTechId, setSelectedTechId] = useState(
    recommendedTech?.id || technicians[0]?.id || ""
  );
  const [etaMinutes, setEtaMinutes] = useState(ticket.isUrgent ? 15 : 30);
  const [note, setNote] = useState(
    ticket.isUrgent
      ? "งานเร่งด่วนระดับ 1 โปรดเข้าตรวจสอบและแก้ไขปัญหาทันที"
      : "มอบหมายให้เข้าตรวจสอบและแก้ไขปัญหาตามคิวงานประจำวัน"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechId) {
      setErrorMsg("กรุณาเลือกช่างผู้รับผิดชอบ");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await assignTechnicianAction({
        ticketId: ticket.id,
        technicianId: selectedTechId,
        note,
        etaMinutes: Number(etaMinutes),
      });

      if (res.success) {
        onClose();
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการมอบหมายงาน");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("ไม่สามารถเชื่อมต่อระบบได้");
      setIsSubmitting(false);
    }
  };

  const selectedTech = technicians.find((t) => t.id === selectedTechId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                จ่ายงานและมอบหมายช่างประจำอาคาร
              </h3>
              <p className="text-xs font-mono text-slate-500">
                <span className="font-semibold text-slate-700">{ticket.ticketNumber}</span> • {ticket.room}
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

        {/* Smart Recommendation Banner */}
        {recommendedTech && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50/90 border border-emerald-200/90 p-3 text-xs text-emerald-950 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs shrink-0">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="font-semibold text-emerald-900">แนะนำช่างตรงสายงาน:</span>{" "}
                <span className="font-bold text-slate-900">
                  {recommendedTech.name}
                </span>{" "}
                <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                  {recommendedTech.specialty || "ช่างเทคนิคประจำแผนก"}
                </span>
              </div>
            </div>
            {selectedTechId !== recommendedTech.id && (
              <button
                type="button"
                onClick={() => setSelectedTechId(recommendedTech.id)}
                className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 transition shadow-2xs active:scale-[0.98]"
              >
                เลือกช่างนี้
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* เลือกช่างเทคนิค: การ์ดรายชื่อช่างพร้อม Avatar และ Badge สายงาน */}
          <div>
            <label className="block font-semibold text-slate-800 mb-2">
              เลือกช่างเทคนิคผู้รับผิดชอบงาน
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {technicians.map((t) => {
                const isSelected = t.id === selectedTechId;
                const isRec = recommendedTech?.id === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTechId(t.id)}
                    className={`cursor-pointer rounded-xl border p-3 transition-all flex items-start space-x-2.5 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/70 shadow-[0_2px_8px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500"
                        : "border-slate-200/90 bg-white hover:bg-slate-50/80 hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="truncate font-semibold text-slate-900">
                          {t.name}
                        </p>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="font-mono text-[10px] text-slate-400 truncate">
                        {t.technicianCode || "TECH"}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200/70">
                          {t.specialty || "ช่างทั่วไป"}
                        </span>
                        {isRec && (
                          <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                            ตรงสายงาน
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                เป้าหมายเวลาถึงหน้างาน (SLA นาที)
              </label>
              <div className="relative">
                <Clock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(Number(e.target.value))}
                  className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-9 pr-3 py-1 font-mono text-xs font-semibold text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                ระดับความเร่งด่วน
              </label>
              <div className="h-10 flex items-center rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 text-xs font-medium text-slate-800">
                {ticket.isUrgent ? (
                  <span className="text-rose-700 font-semibold flex items-center space-x-1.5">
                    <Zap className="h-3.5 w-3.5 text-rose-600" />
                    <span>เร่งด่วนวิกฤต (15 นาที)</span>
                  </span>
                ) : (
                  <span className="text-slate-600">งานปกติทั่วไป (2 ชม.)</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              คำสั่งการ / บันทึกมอบหมายงาน
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุคำสั่งการเฉพาะ เช่น เตรียมชุดเครื่องมือซ่อมแล็บ หรืออะไหล่..."
              className="w-full rounded-xl border border-slate-300/80 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs active:scale-[0.98]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 text-xs font-medium shadow-[0_2px_8px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>กำลังจ่ายงาน...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>ยืนยันจ่ายงานให้ช่าง</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
