// components/tracking/TrackingView.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  SlidersHorizontal,
  Moon,
  CheckCircle2,
  MapPin,
  Clock,
  User,
  Activity,
  Footprints,
  Wrench,
  ShieldCheck,
  MessageSquare,
  Phone,
  Image as ImageIcon,
  Bell,
  Plus,
  Star,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { rateTicketAction } from "@/actions/ticket";
import { formatDateThai } from "@/lib/utils";
import SmartPageHeader from "@/components/navigation/SmartPageHeader";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { SessionPayload } from "@/lib/auth";

interface TrackingViewProps {
  ticket: any; // Full Ticket with reporter, technician, attachments, and histories
  currentUser?: SessionPayload | null;
}

export default function TrackingView({ ticket, currentUser }: TrackingViewProps) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isRated, setIsRated] = useState(ticket.rating ? true : false);
  const [submittedRating, setSubmittedRating] = useState<number | null>(ticket.rating || null);
  const [submittedFeedback, setSubmittedFeedback] = useState<string>(ticket.feedback || "");

  // 1. ตรวจสอบสิทธิ์ผู้ใช้: เปรียบเทียบผู้ใช้ปัจจุบันกับเจ้าของตั๋ว
  const currentUserId = (currentUser as any)?.userId || (currentUser as any)?.id;
  const currentUserEmail = currentUser?.email;

  const isTicketOwner = Boolean(
    currentUser &&
      (currentUserId === ticket.userId ||
        currentUserId === ticket.reporterId ||
        currentUserId === ticket.reporter?.id ||
        (currentUserEmail &&
          (currentUserEmail === ticket.reporterEmail ||
            currentUserEmail === ticket.reporter?.email)) ||
        currentUser.role === "USER")
  );

  const isTechnicianOrAdmin =
    currentUser?.role === "TECHNICIAN" ||
    currentUser?.role === "ADMIN" ||
    currentUser?.role === "SUPER_ADMIN" ||
    Boolean(currentUserId && currentUserId === ticket.technicianId);

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTechnicianOrAdmin) {
      alert("ช่างเทคนิคและผู้ดูแลระบบไม่มีสิทธิ์ประเมินหรือให้คะแนนผลงานตนเอง");
      return;
    }
    if (!isTicketOwner) {
      alert("เฉพาะผู้แจ้งซ่อมตัวจริงเท่านั้นที่สามารถประเมินความพึงพอใจได้");
      return;
    }

    try {
      setIsSubmittingRating(true);
      const res = await rateTicketAction({
        ticketId: ticket.id,
        rating,
        feedback,
      });
      if (res.success) {
        setIsRated(true);
        setSubmittedRating(rating);
        setSubmittedFeedback(feedback);
        router.refresh();
      } else {
        alert(res.error || "เกิดข้อผิดพลาดในการบันทึกความคิดเห็น");
      }
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // หมวดหมู่ภาษาไทย (7 หมวดหมู่หลัก)
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "PLUMBING":
        return "ระบบประปา สุขภัณฑ์ และห้องน้ำ";
      case "ELECTRICAL":
        return "ระบบไฟฟ้า แสงสว่าง และปลั๊กไฟ";
      case "AIR_CONDITIONING":
        return "ระบบเครื่องปรับอากาศ";
      case "FURNITURE":
        return "งานโครงสร้าง ครุภัณฑ์ และสถานที่";
      case "PC_HARDWARE":
        return "อุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์ประจำแล็บ";
      case "NETWORK":
        return "ระบบเครือข่ายและอินเทอร์เน็ต";
      case "AV_EQUIPMENT":
        return "โสตทัศนูปกรณ์และสื่อการสอน";
      case "IT_EQUIPMENT":
        return "ไอทีและโสตทัศนูปกรณ์";
      default:
        return "งานซ่อมบำรุงทั่วไป";
    }
  };

  // แปลงเวลาไทยแบบสั้น (เช่น 10:42 น.)
  const formatTimeThai = (date?: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return (
      d.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }) + " น."
    );
  };

  // คำนวณขั้นตอนปัจจุบันตาม ticket.status จริง (1: PENDING, 2: ASSIGNED, 3: IN_PROGRESS/ON_HOLD, 4: RESOLVED/CLOSED)
  const currentStep =
    ticket.status === "PENDING"
      ? 1
      : ticket.status === "ASSIGNED"
      ? 2
      : ticket.status === "IN_PROGRESS" || ticket.status === "ON_HOLD"
      ? 3
      : ticket.status === "RESOLVED" || ticket.status === "CLOSED"
      ? 4
      : (ticket.currentStep ?? 1);

  const hasTechnician = Boolean(ticket.technician);

  // ดึงประวัติแต่ละขั้นตอนจาก ticket.histories เพื่อแสดงเวลาจริง
  const step1History = ticket.histories?.find(
    (h: any) => h.step === 1 || h.status === "PENDING"
  );
  const step2History = ticket.histories?.find(
    (h: any) => h.step === 2 || h.status === "ASSIGNED"
  );
  const step3History = ticket.histories?.find(
    (h: any) => h.step === 3 || h.status === "IN_PROGRESS" || h.status === "ON_HOLD"
  );
  const step4History = ticket.histories?.find(
    (h: any) => h.step === 4 || h.status === "RESOLVED" || h.status === "CLOSED"
  );

  // รวบรวมรูปภาพแนบจริง (Attachments + beforeImageUrl)
  const attachmentsList = [
    ...(ticket.attachments || []),
    ...(ticket.beforeImageUrl && !ticket.attachments?.some((a: any) => a.url === ticket.beforeImageUrl)
      ? [{ url: ticket.beforeImageUrl, fileName: "ภาพถ่ายอาการชำรุด", fileSize: "" }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-lg min-h-screen bg-slate-50/75 text-slate-800 pb-28 shadow-2xl relative border-x border-slate-200/60">
      {/* 1. Header บาร์ด้านบนพร้อม Breadcrumbs และปุ่มย้อนกลับอัจฉริยะ */}
      <SmartPageHeader
        title="ติดตามการแจ้งซ่อม"
        subtitle="อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์"
        ticketNumber={ticket.ticketNumber}
        currentUser={currentUser}
        breadcrumbs={[
          { label: "ติดตามสถานะ", href: currentUser?.role === "USER" ? "/student/dashboard#history" : undefined },
          { label: ticket.ticketNumber },
        ]}
      />

      {/* 2. Banner แสดงสถานะคำร้อง */}
      <div className={`mx-4 mt-3 flex items-start justify-between rounded-2xl border p-4 shadow-2xs backdrop-blur-sm ${
        ticket.status === "RESOLVED" || ticket.status === "CLOSED"
          ? "bg-emerald-50/90 border-emerald-200/90"
          : ticket.status === "ON_HOLD"
          ? "bg-amber-50/90 border-amber-300"
          : ticket.status === "IN_PROGRESS"
          ? "bg-blue-50/90 border-blue-200/90"
          : ticket.status === "ASSIGNED"
          ? "bg-indigo-50/90 border-indigo-200/90"
          : "bg-emerald-50/90 border-emerald-200/90"
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm mt-0.5 ${
            ticket.status === "RESOLVED" || ticket.status === "CLOSED"
              ? "bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
              : ticket.status === "ON_HOLD"
              ? "bg-gradient-to-b from-amber-500 to-amber-600 shadow-[0_2px_8px_rgba(245,158,11,0.35)]"
              : ticket.status === "IN_PROGRESS"
              ? "bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.35)]"
              : ticket.status === "ASSIGNED"
              ? "bg-gradient-to-b from-indigo-500 to-indigo-600 shadow-[0_2px_8px_rgba(99,102,241,0.35)]"
              : "bg-gradient-to-b from-emerald-500 to-emerald-600 shadow-[0_2px_8px_rgba(16,185,129,0.35)]"
          }`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 leading-snug">
              {ticket.status === "RESOLVED"
                ? "ซ่อมแซมเสร็จสิ้นแล้ว (Resolved)"
                : ticket.status === "CLOSED"
                ? "ปิดคำร้องและตรวจรับงานสมบูรณ์ (Closed)"
                : ticket.status === "ON_HOLD"
                ? "พักงานชั่วคราว • นำอุปกรณ์กลับศูนย์ซ่อม"
                : ticket.status === "IN_PROGRESS"
                ? "ช่างกำลังดำเนินการซ่อมแซม"
                : ticket.status === "ASSIGNED"
                ? "มอบหมายช่างผู้รับผิดชอบแล้ว"
                : "ส่งคำร้องแจ้งซ่อมเรียบร้อยแล้ว"}
            </h2>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-tight">
              {ticket.status === "RESOLVED"
                ? "ช่างเทคนิคได้ดำเนินการแก้ไขและแนบหลักฐานการปฏิบัติงานเรียบร้อยแล้ว"
                : ticket.status === "CLOSED"
                ? "บันทึกประวัติการซ่อมบำรุงและปิดตั๋วงานในระบบเรียบร้อยแล้ว"
                : ticket.status === "ON_HOLD"
                ? "ช่างนำอุปกรณ์กลับไปตรวจสอบเชิงลึกที่ศูนย์ซ่อมบำรุงหรือรออะไหล่"
                : ticket.status === "IN_PROGRESS"
                ? "ช่างเทคนิคลงพื้นที่ปฏิบัติงาน ณ ห้องเกิดเหตุแล้ว"
                : ticket.status === "ASSIGNED"
                ? `ช่าง ${ticket.technician?.name || "ประจำแผนก"} กำลังเตรียมตัวลงพื้นที่`
                : "ข้อมูลถูกส่งตรงถึงระบบคัดกรองงานช่างประจำอาคารแผนกคอมพิวเตอร์"}
            </p>
          </div>
        </div>

        <span className={`shrink-0 rounded-xl bg-white/90 border px-2.5 py-1 font-mono text-[10px] font-bold shadow-2xs ${
          ticket.status === "PENDING"
            ? "border-amber-200/80 text-amber-800"
            : ticket.status === "ON_HOLD"
            ? "border-amber-300 text-amber-900 bg-amber-50"
            : ticket.status === "ASSIGNED"
            ? "border-blue-200/80 text-blue-800"
            : ticket.status === "IN_PROGRESS"
            ? "border-blue-200/80 text-blue-800"
            : ticket.status === "RESOLVED"
            ? "border-emerald-200/80 text-emerald-800"
            : "border-emerald-200/80 text-emerald-800"
        }`}>
          {ticket.status === "PENDING"
            ? "รอตรวจสอบ"
            : ticket.status === "ON_HOLD"
            ? "ยกกลับศูนย์ซ่อม"
            : ticket.status === "ASSIGNED"
            ? "มอบหมายแล้ว"
            : ticket.status === "IN_PROGRESS"
            ? "กำลังซ่อมแซม"
            : ticket.status === "RESOLVED"
            ? "ซ่อมเสร็จสิ้น"
            : "ปิดงานสมบูรณ์"}
        </span>
      </div>

      {/* แถบสีส้มแจ้งเตือนผู้แจ้งซ่อมเมื่อตั๋วถูกปรับเป็น ON_HOLD */}
      {ticket.status === "ON_HOLD" && (
        <div className="mx-4 mt-3 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/60 to-amber-100/70 p-4 shadow-sm backdrop-blur-sm animate-in fade-in">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-[0_2px_8px_rgba(245,158,11,0.35)] mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/80 text-amber-950 border border-amber-300 font-mono">
                  ⏸️ นำอุปกรณ์กลับศูนย์ซ่อมบำรุง
                </span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-950 mt-1.5 leading-snug">
                ช่างนำอุปกรณ์กลับไปตรวจสอบเชิงลึกที่ศูนย์ซ่อมบำรุง — คาดว่าจะดำเนินการแล้วเสร็จภายใน:{" "}
                <span className="font-semibold text-amber-900 underline decoration-amber-500 font-mono">
                  {ticket.estimatedCompletionAt
                    ? `${formatDateThai(new Date(ticket.estimatedCompletionAt))} (${formatTimeThai(ticket.estimatedCompletionAt)})`
                    : "แจ้งให้ทราบในลำดับถัดไป"}
                </span>
              </h3>
              {ticket.holdReason && (
                <div className="mt-2.5 p-3 rounded-xl bg-white/90 border border-amber-200/90 text-xs text-amber-950 shadow-2xs space-y-1">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                    หมายเหตุจากช่างผู้รับผิดชอบ:
                  </span>
                  <p className="text-slate-700 pl-5 leading-relaxed">{ticket.holdReason}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-3 space-y-4">
        {/* 3. Ticket Summary Card ข้อมูลสรุปเคส */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] space-y-3.5">
          {/* Badge Chips Row */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200/80 text-slate-800 px-2.5 py-0.5 rounded-md shadow-2xs">
              {ticket.ticketNumber}
            </span>
            {ticket.incidentCode && (
              <span className="font-mono text-xs font-medium bg-slate-100 border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md">
                {ticket.incidentCode}
              </span>
            )}
            <span className="rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] text-emerald-800 font-semibold">
              {getCategoryLabel(ticket.category)}
            </span>
            {ticket.isUrgent && (
              <span className="flex items-center space-x-1.5 rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>ด่วนวิกฤต (15m)</span>
              </span>
            )}
          </div>

          {/* หัวข้อปัญหา */}
          <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
            {ticket.title}
          </h2>

          {/* สถานที่ */}
          <div className="flex items-start space-x-2.5 text-xs text-slate-600">
            <MapPin className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">
                {ticket.building || "อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์"} • ชั้น {ticket.floor || 1}
              </p>
              <p className="font-mono text-xs font-bold text-slate-900 mt-0.5">
                {ticket.roomName || ticket.room}
              </p>
              {ticket.specificPoint && (
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                  จุดเกิดเหตุ: {ticket.specificPoint}
                </p>
              )}
            </div>
          </div>

          {/* พิกัด GPS Bar */}
          {(ticket.latitude || ticket.longitude || ticket.specificPoint) && (
            <div className="rounded-xl bg-slate-50/90 px-3 py-1.5 text-[11px] text-slate-600 font-mono flex items-center justify-between border border-slate-200/70 shadow-2xs">
              <span>
                GPS: {ticket.latitude ?? "15.2284"}° N, {ticket.longitude ?? "104.8592"}° E
              </span>
              {ticket.specificPoint ? (
                <span className="font-sans text-[10px] text-slate-500 truncate max-w-[200px]">
                  • {ticket.specificPoint}
                </span>
              ) : null}
            </div>
          )}

          {/* ผู้แจ้งและเวลา */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 font-mono">
            <div className="flex items-center space-x-1.5 font-sans">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium text-slate-700">
                {ticket.reporter?.name || "ผู้ใช้งานทั่วไป"}
              </span>
            </div>
            <span>
              {formatDateThai(ticket.createdAt)}
            </span>
          </div>
        </div>

        {/* 4. Timeline Stepper Card (ติดตามสถานะแบบเรียลไทม์ 4 ขั้นตอน) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-slate-700" />
              <h3 className="text-xs font-bold text-slate-900">
                ติดตามสถานะการซ่อมแบบเรียลไทม์
              </h3>
            </div>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-100">
              ขั้นตอนที่ {currentStep} จาก 4
            </span>
          </div>

          <div className="mt-4 relative pl-7 space-y-6">
            {/* เส้นแนวตั้งเชื่อมต่อขั้นตอน */}
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-200 -z-0"></div>

            {/* ขั้นตอนที่ 1: รับเรื่องและบันทึกข้อมูล */}
            <div className="relative">
              <div
                className="absolute -left-[27px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white bg-emerald-500"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  รับเรื่องและบันทึกข้อมูลแล้ว
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {formatTimeThai(ticket.createdAt)}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                {ticket.isUrgent
                  ? "ระบบคัดกรองอัตโนมัติตรวจพบเป็นงานเร่งด่วนระดับ 1 (ด่วนวิกฤต) ส่งต่อเข้าระบบช่างทันที"
                  : step1History?.note || "รับเรื่องและลงบันทึกในระบบเรียบร้อยแล้ว"}
              </p>
            </div>

            {/* ขั้นตอนที่ 2: การมอบหมายงาน */}
            <div className="relative">
              <div
                className={`absolute -left-[27px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white ${
                  hasTechnician
                    ? currentStep === 2
                      ? "bg-blue-600 animate-pulse ring-blue-100"
                      : "bg-emerald-500"
                    : "bg-slate-300 text-slate-500"
                }`}
              >
                {hasTechnician ? (
                  currentStep > 2 ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Footprints className="h-3.5 w-3.5" />
                  )
                ) : (
                  <Clock className="h-3.5 w-3.5 text-slate-600" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    hasTechnician ? (currentStep === 2 ? "text-blue-700" : "text-slate-900") : "text-slate-700"
                  }`}
                >
                  {hasTechnician
                    ? "มอบหมายช่างเรียบร้อยแล้ว"
                    : "รอเจ้าหน้าที่จัดสรรช่างผู้รับผิดชอบ"}
                </h4>
                {hasTechnician ? (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formatTimeThai(step2History?.timestamp || ticket.updatedAt)}
                  </span>
                ) : (
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                    รอคัดกรอง
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                {hasTechnician ? (
                  <>
                    ช่างผู้รับผิดชอบ: <strong className="text-slate-800">{ticket.technician?.name}</strong>
                    {ticket.technician?.technicianCode && ` (${ticket.technician.technicianCode})`}
                    {ticket.stepNote ? ` • ${ticket.stepNote}` : " รับเรื่องและกำลังเตรียมเข้าดำเนินการ"}
                  </>
                ) : (
                  "ระบบกำลังรอเจ้าหน้าที่อาคารคัดกรองหมวดหมู่งานและมอบหมายช่างประจำแผนก"
                )}
              </p>
            </div>

            {/* ขั้นตอนที่ 3: ดำเนินการซ่อมแซม */}
            <div className="relative">
              <div
                className={`absolute -left-[27px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white ${
                  currentStep >= 3
                    ? ticket.status === "ON_HOLD"
                      ? "bg-amber-500 animate-pulse ring-amber-100"
                      : currentStep === 3
                      ? "bg-blue-600 animate-pulse ring-blue-100"
                      : "bg-emerald-500"
                    : "bg-slate-300 text-slate-500"
                }`}
              >
                {currentStep > 3 ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : ticket.status === "ON_HOLD" ? (
                  <Clock className="h-3.5 w-3.5" />
                ) : (
                  <Wrench className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    ticket.status === "ON_HOLD"
                      ? "text-amber-900"
                      : currentStep >= 3
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                >
                  {ticket.status === "ON_HOLD"
                    ? "นำอุปกรณ์กลับศูนย์ซ่อมบำรุง / รออะไหล่ (On-Hold)"
                    : "ตรวจสอบหน้างานและดำเนินการซ่อมแซม"}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {ticket.status === "ON_HOLD"
                    ? "พักงานชั่วคราว"
                    : currentStep >= 3
                    ? step3History?.timestamp
                      ? formatTimeThai(step3History.timestamp)
                      : "กำลังดำเนินการ"
                    : "รอดำเนินการ"}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                {ticket.status === "ON_HOLD"
                  ? ticket.holdReason
                    ? `เหตุผล: ${ticket.holdReason}`
                    : "ช่างเทคนิคนำอุปกรณ์กลับไปตรวจสอบเชิงลึก ณ ศูนย์ซ่อมบำรุง"
                  : currentStep >= 3
                  ? ticket.stepNote && currentStep === 3
                    ? ticket.stepNote
                    : "ช่างเทคนิคลงพื้นที่ตรวจสอบและอยู่ระหว่างดำเนินการซ่อมแซมแก้ไข"
                  : "ช่างเทคนิคจะเข้าตรวจสอบหน้างานและดำเนินการซ่อมบำรุงตามลำดับคิว"}
              </p>
            </div>

            {/* ขั้นตอนที่ 4: เสร็จสิ้นและตรวจรับงาน */}
            <div className="relative">
              <div
                className={`absolute -left-[27px] top-0 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-sm ring-4 ring-white ${
                  currentStep >= 4 ? "bg-emerald-500" : "bg-slate-300 text-slate-500"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    currentStep >= 4 ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {ticket.status === "CLOSED"
                    ? "ปิดคำร้องและตรวจรับงานสมบูรณ์ (Closed)"
                    : "ซ่อมแซมเสร็จสิ้นแล้ว (Resolved)"}
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {currentStep >= 4
                    ? ticket.resolvedAt || ticket.closedAt
                      ? formatTimeThai(ticket.resolvedAt || ticket.closedAt)
                      : "เสร็จสิ้น"
                    : "รอดำเนินการ"}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
                {currentStep >= 4
                  ? ticket.status === "CLOSED"
                    ? "บันทึกประวัติการซ่อมบำรุงและปิดตั๋วงานในระบบเรียบร้อยแล้ว"
                    : ticket.resolutionDetail ||
                      "ช่างเทคนิคได้ดำเนินการแก้ไขและแนบหลักฐานการปฏิบัติงานเรียบร้อยแล้ว"
                  : "ช่างเทคนิคจะดำเนินการซ่อมแซมและแนบหลักฐานเพื่อเสร็จสิ้นงาน"}
              </p>
            </div>
          </div>
        </div>

        {/* 5. การ์ดช่างผู้รับผิดชอบ (รองรับ Empty State ตามเงื่อนไข ticket.technician) */}
        {ticket.technician ? (
          <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ช่างผู้รับผิดชอบ
              </h4>
              {ticket.etaMinutes ? (
                <span className="rounded-xl bg-blue-50/90 px-3 py-1 text-[11px] font-semibold text-blue-700 border border-blue-200/80 shadow-2xs font-mono">
                  คาดว่าจะถึงใน ~{ticket.etaMinutes} นาที
                </span>
              ) : (
                <span className="rounded-xl bg-emerald-50/90 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200/80 shadow-2xs">
                  ช่างประจำแผนก
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="relative shrink-0">
                {ticket.technician.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ticket.technician.avatar}
                    alt={ticket.technician.name}
                    className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-100 shadow-2xs"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 font-bold text-white shadow-2xs text-base">
                    {ticket.technician.name.slice(0, 1)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {ticket.technician.name}
                  </h3>
                  {ticket.technician.technicianCode && (
                    <span className="font-mono text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 px-1.5 py-0.5 rounded-md">
                      {ticket.technician.technicianCode}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {ticket.technician.position ||
                    ticket.technician.specialty ||
                    ticket.technician.department ||
                    "ช่างเทคนิคประจำแผนก"}
                </p>
                {ticket.stepNote && (
                  <p className="text-[11px] font-medium text-blue-600 truncate mt-0.5">
                    {ticket.stepNote}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons: ส่งข้อความ & โทรศัพท์ */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  alert(`เปิดระบบแชทติดต่อช่าง ${ticket.technician.name}`)
                }
                className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200/80 bg-white/90 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-[0.98] transition-all"
              >
                <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                <span>ส่งข้อความ</span>
              </button>
              <a
                href={
                  ticket.technician.phone
                    ? `tel:${ticket.technician.phone}`
                    : "tel:025551044"
                }
                className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200/80 bg-white/90 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-[0.98] transition-all"
              >
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {ticket.technician.phone
                    ? `โทร ${ticket.technician.phone}`
                    : "โทรติดต่อแผนก"}
                </span>
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Clock className="h-5 w-5 stroke-[1.75]" />
            </div>
            <h4 className="text-sm font-semibold text-slate-700">
              อยู่ระหว่างจัดสรรช่างผู้รับผิดชอบ
            </h4>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              เจ้าหน้าที่กำลังตรวจสอบรายการแจ้งซ่อมและจัดคิวช่าง ระบบจะอัปเดตข้อมูลผู้รับผิดชอบทันทีที่มีการจ่ายงาน
            </p>
          </div>
        )}

        {/* 6. กล่องแสดงผลการซ่อมเสร็จ & ภาพหลักฐานหลังซ่อม (Resolution Proof) */}
        {(ticket.resolutionDetail || ticket.afterImageUrl || ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/70 backdrop-blur-md p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-200/70 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950">
                    บันทึกผลการแก้ไข & ภาพถ่ายหลังซ่อม (Proof of Work)
                  </h3>
                  <p className="text-[10px] text-emerald-800">
                    ช่างเทคนิคผู้ปฏิบัติงาน: {ticket.technician?.name || "ช่างประจำแผนก"}
                  </p>
                </div>
              </div>
              <span className="rounded-xl bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 shadow-2xs">
                {ticket.status === "CLOSED" ? "ปิดงานสมบูรณ์" : "ซ่อมเสร็จสิ้น"}
              </span>
            </div>

            {ticket.resolutionDetail && (
              <div className="rounded-xl bg-white/90 p-3.5 border border-emerald-100 text-xs text-slate-800 space-y-1 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  รายละเอียดการแก้ไข / อะไหล่ที่ใช้
                </span>
                <p className="leading-relaxed font-medium">{ticket.resolutionDetail}</p>
              </div>
            )}

            {ticket.afterImageUrl && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 block">
                  รูปถ่ายหลักฐานหลังการซ่อมเสร็จ:
                </span>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-2xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ticket.afterImageUrl}
                    alt="Proof of work after repair"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 rounded-xl bg-black/80 px-2.5 py-1 text-[10px] font-bold text-white flex items-center space-x-1.5 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>รูปถ่ายหลังการซ่อมเสร็จ (After Photo)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. การ์ดรีวิวบริการและความพึงพอใจ (Review / Feedback Section) */}
        {(ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
          <div className="rounded-2xl border border-amber-200/90 bg-white/95 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(245,158,11,0.08)] space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-amber-200/60 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)] shrink-0">
                  <Star className="h-5 w-5 fill-white text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                    ⭐ ความคิดเห็นและความพึงพอใจการให้บริการ (ทางเลือก)
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    คุณสามารถร่วมให้คะแนนการทำงานของช่างเพื่อนำไปพัฒนาคุณภาพการบริการของแผนกวิชา
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-800 border border-amber-200">
                {(ticket.rating || isRated) ? "ประเมินแล้ว" : "ทางเลือก"}
              </span>
            </div>

            {/* กรณีที่ 1: ตั๋วได้รับการประเมินแล้ว -> แสดงผลคะแนนแบบ Read-only */}
            {(ticket.rating || isRated) ? (
              <div className="rounded-xl bg-amber-50/70 p-4 border border-amber-200/80 text-center space-y-2 shadow-2xs">
                <p className="text-xs font-semibold text-amber-900">
                  คะแนนความพึงพอใจจากผู้แจ้งซ่อม
                </p>
                <div className="flex items-center justify-center gap-1.5 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < (submittedRating || ticket.rating || rating)
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-bold text-slate-800 text-sm font-mono">
                    ({submittedRating || ticket.rating || rating}/5)
                  </span>
                </div>
                {(submittedFeedback || ticket.feedback) ? (
                  <p className="text-xs text-slate-700 italic pt-1">
                    &ldquo;{submittedFeedback || ticket.feedback}&rdquo;
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 italic pt-1">
                    ผู้แจ้งไม่ได้ระบุข้อคิดเห็นเพิ่มเติม
                  </p>
                )}
                <div className="pt-1 flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>บันทึกรีวิวความพึงพอใจเรียบร้อยแล้ว</span>
                </div>
              </div>
            ) : isTicketOwner && !isTechnicianOrAdmin ? (
              /* กรณีที่ 2: เป็นผู้แจ้งซ่อมตัวจริง และยังไม่ได้ประเมิน -> แสดงกล่องให้คะแนนและช่องความคิดเห็น */
              <form onSubmit={handleRateSubmit} className="space-y-3.5">
                <div className="flex flex-col items-center justify-center py-2.5 bg-amber-50/50 rounded-xl border border-amber-200/70 p-3 space-y-1.5 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-hidden"
                        title={`${star} ดาว`}
                      >
                        <Star
                          className={`h-7 w-7 transition-colors ${
                            star <= rating
                              ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                              : "text-slate-300 hover:text-amber-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-900 font-mono">
                    {rating === 5
                      ? "⭐⭐⭐⭐⭐ ดีเยี่ยม (5/5)"
                      : rating === 4
                      ? "⭐⭐⭐⭐ ดีมาก (4/5)"
                      : rating === 3
                      ? "⭐⭐⭐ ปานกลาง (3/5)"
                      : rating === 2
                      ? "⭐⭐ พอใช้ (2/5)"
                      : "⭐ ควรปรับปรุง (1/5)"}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    ความคิดเห็นเพิ่มเติมสั้นๆ (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="เช่น ช่างมาตรงเวลา สุภาพ แก้ปัญหาได้เรียบร้อย..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:border-amber-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 leading-tight max-w-[200px]">
                    * แม้ผู้แจ้งจะไม่กดส่งคะแนน ตั๋วก็ยังคงสถานะเสร็จสิ้นตามปกติ
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingRating}
                    className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Star className="h-3.5 w-3.5 fill-white" />
                    <span>{isSubmittingRating ? "กำลังบันทึก..." : "ส่งความคิดเห็น"}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* กรณีที่ 3: ช่าง/แอดมินเปิดดู หรือผู้ใช้ทั่วไป และยังไม่มีการประเมิน */
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-600">
                  ⏳ อยู่ระหว่างรอผู้แจ้งซ่อมร่วมส่งรีวิวความพึงพอใจ
                </p>
                <p className="text-[11px] text-slate-400">
                  (การให้คะแนนเป็นทางเลือกเสริม ไม่กระทบต่อสถานะการซ่อมเสร็จสิ้นของตั๋ว)
                </p>
              </div>
            )}
          </div>
        )}

        {/* 7. หลักฐานรูปถ่ายแนบ */}
        <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <ImageIcon className="h-4 w-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-900">
                หลักฐานรูปถ่ายแนบ ({attachmentsList.length} รูป)
              </h3>
            </div>
            {attachmentsList.length > 0 && (
              <span className="text-[11px] text-slate-400">
                ภาพหลักฐานก่อนซ่อม
              </span>
            )}
          </div>

          {attachmentsList.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {attachmentsList.map((att: any, idx: number) => (
                <div
                  key={idx}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.url}
                    alt={att.fileName || `รูปภาพ ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-2.5 py-1.5 text-[10px] text-white flex justify-between items-center">
                    <span className="truncate pr-1">{att.fileName || `ภาพถ่าย ${idx + 1}`}</span>
                    {att.fileSize && <span className="shrink-0">{att.fileSize}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
              <p className="text-xs text-slate-400">ไม่มีรูปภาพแนบในคำร้องนี้</p>
            </div>
          )}
        </div>

        {/* 8. Notification Banner */}
        <div className="flex items-center justify-between rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 p-4 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shadow-2xs">
              <Bell className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                การแจ้งเตือนสถานะ
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {ticket.reporter?.phone
                  ? `เชื่อมโยงกับเบอร์ ${ticket.reporter.phone}`
                  : "แจ้งเตือนผ่านแดชบอร์ดระบบและแอปพลิเคชัน"}
              </p>
            </div>
          </div>

          <span className="flex items-center space-x-1.5 rounded-xl bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>เปิดใช้งานแล้ว</span>
          </span>
        </div>

        {/* 8. Bottom Action Buttons */}
        <div className="pt-2 space-y-2.5">
          <Link
            href="/report"
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-3 text-xs font-semibold text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>แจ้งซ่อมรายการอื่นเพิ่มเติม</span>
          </Link>

          <p className="text-center text-[11px] text-slate-500">
            ต้องการแก้ไขข้อมูลหรือเพิ่มเติมรายละเอียด?{" "}
            <button
              type="button"
              onClick={() => alert("ระบบส่งข้อความอัปเดตแจ้งช่างเพิ่มเติม")}
              className="font-bold text-slate-800 underline underline-offset-2 hover:text-slate-900"
            >
              เพิ่มข้อมูล
            </button>
          </p>
        </div>
      </div>



      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
