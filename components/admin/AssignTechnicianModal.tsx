// components/admin/AssignTechnicianModal.tsx
"use client";

import React, { useState } from "react";
import {
  X,
  UserCheck,
  CheckCircle2,
  Loader2,
  Clock,
  Hammer,
  AlertCircle,
  Building,
} from "lucide-react";
import { assignTechnicianAction } from "@/actions/ticket";

interface TechnicianOption {
  id: string;
  name: string;
  email: string;
  technicianCode?: string | null;
  department?: string | null;
}

interface AssignTechnicianModalProps {
  ticket: {
    id: string;
    ticketNumber: string;
    title: string;
    room: string;
    building: string;
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
  const [selectedTechId, setSelectedTechId] = useState(
    technicians[0]?.id || ""
  );
  const [etaMinutes, setEtaMinutes] = useState(ticket.isUrgent ? 15 : 30);
  const [note, setNote] = useState(
    ticket.isUrgent
      ? "งานเร่งด่วนระดับ 1 โปรดเข้าตรวจสอบและตัดระบบทันที"
      : "มอบหมายให้เข้าตรวจสอบและแก้ไขตามคิวงานประจำวัน"
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                จ่ายงานและมอบหมายช่างผู้รับผิดชอบ
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
              เลือกช่างเทคนิคผู้รับผิดชอบงาน
            </label>
            <select
              required
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-slate-800"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (รหัส: {t.technicianCode || "-"}) • {t.department || "ช่างเทคนิคประจำอาคาร"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
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
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ระดับความเร่งด่วน
              </label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-700">
                {ticket.isUrgent ? (
                  <span className="text-rose-600 font-bold">เร่งด่วนวิกฤต (15 นาที)</span>
                ) : (
                  <span className="text-slate-600">งานปกติทั่วไป (2 ชม.)</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              คำสั่งการ / บันทึกมอบหมายงาน
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ระบุคำสั่งการเฉพาะ หรืออุปกรณ์ที่ต้องเตรียม..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-slate-800"
            />
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
              className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-blue-700 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>กำลังมอบหมาย...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
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
