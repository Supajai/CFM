// components/technician/ActiveTaskScreen.tsx
"use client";

import React, { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Building2,
  User,
  Wrench,
  Maximize2,
  X,
  Loader2,
  Upload,
  Check,
  Flame,
  ShieldCheck,
  FileText,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Layers,
  Info,
  Pause,
  Play,
  Calendar,
} from "lucide-react";
import {
  updateTicketStatusAction,
  resolveTicketAction,
  putTicketOnHoldAction,
  startWorkAction,
} from "@/actions/ticket";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import TicketMilestoneStepper from "@/components/ticket/TicketMilestoneStepper";

export interface ActiveTaskTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  floor: number;
  room: string;
  roomName: string | null;
  specificPoint?: string | null;
  specificLocation?: string | null;
  building: string;
  isUrgent: boolean;
  slaTargetMinutes?: number | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  resolutionDetail?: string | null;
  resolvedAt?: Date | string | null;
  estimatedCompletionAt?: Date | string | null;
  holdReason?: string | null;
  createdAt: Date | string;
  reporter?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    role?: string | null;
    studentId?: string | null;
    position?: string | null;
  } | null;
  technician?: {
    id: string;
    name: string;
    phone?: string | null;
    technicianCode?: string | null;
  } | null;
  histories?: Array<{
    id: string;
    status: string;
    title?: string | null;
    note?: string | null;
    timestamp?: Date | string;
    createdAt?: Date | string;
  }>;
}

interface ActiveTaskScreenProps {
  ticket: ActiveTaskTicket;
  currentUserId: string;
  currentUserName: string;
}

const RESOLUTION_TEMPLATES = [
  "เปลี่ยนอะไหล่และทดสอบบูตเครื่องคอมพิวเตอร์เข้าใช้งานระบบปฏิบัติการได้ตามปกติ",
  "เข้าหัวสายสัญญาณ LAN (RJ-45) ใหม่ และทดสอบความเร็วสัญญาณอินเทอร์เน็ตปกติ",
  "ล้างแผงฟิลเตอร์ระบายอากาศ แก้ไขท่อน้ำทิ้งไม่อุดตัน และตรวจวัดความเย็นปกติ",
  "ขันยึดรางปลั๊กไฟและตรวจวัดแรงดันไฟฟ้า 220V เรียบร้อย ปลอดภัย",
];

const PRESET_AFTER_PHOTOS = [
  {
    label: "อะไหล่/คอมพิวเตอร์",
    url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "ระบบเซิร์ฟเวอร์",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "ระบบสายเคเบิล",
    url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80",
  },
  {
    label: "แอร์/ฟิลเตอร์",
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80",
  },
];

export const PRESET_HOLD_REASONS = [
  "ยกเครื่องเคสไปลง Windows ใหม่และทดสอบระบบที่ศูนย์ซ่อม Lab 101",
  "รอเบิกพาวเวอร์ซัพพลาย (Power Supply) ตัวใหม่จากคลังพัสดุ",
  "รออะไหล่สายสัญญาณ HDMI/LAN และคอนเน็กเตอร์ใหม่จากตัวแทนจำหน่าย",
  "รอสั่งแผงวงจรและจอภาพใหม่เพื่อทดแทนชิ้นส่วนที่ชำรุด",
  "นำเมนบอร์ดและอุปกรณ์กลับไปตรวจเช็กด้วยเครื่องมือวิเคราะห์เชิงลึก",
];

export function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    HARDWARE: "อุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์",
    PC_HARDWARE: "อุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์",
    NETWORK: "ระบบเครือข่ายและเซิร์ฟเวอร์",
    AIR_CONDITIONER: "ระบบเครื่องปรับอากาศและความเย็น",
    AIR_CONDITIONING: "ระบบเครื่องปรับอากาศและความเย็น",
    ELECTRICAL: "ระบบไฟฟ้าและแสงสว่าง",
    AV_EQUIPMENT: "ระบบโสตทัศนูปกรณ์และสื่อการสอน",
    STRUCTURAL: "งานโครงสร้างและครุภัณฑ์",
    FURNITURE: "งานโครงสร้างและครุภัณฑ์",
    SANITARY: "ระบบสุขาภิบาลและห้องน้ำ",
    PLUMBING: "ระบบประปาและสุขาภิบาล",
    IT_EQUIPMENT: "อุปกรณ์ไอทีและเทคโนโลยี",
    OTHER: "งานซ่อมบำรุงทั่วไป",
  };
  return categoryMap[category] || category || "งานซ่อมบำรุงทั่วไป";
}

/**
 * ฟังก์ชันช่วยแยกและจัดรูปแบบชื่อห้องเพื่อป้องกันข้อความซ้ำซ้อนและล้นจอ
 */
export function parseRoomDetails(room: string, roomName?: string | null) {
  const rawRoom = (room || "").trim();
  const rawName = (roomName || "").trim();

  // กรณีที่มีรหัสในวงเล็บ เช่น "ห้องปฏิบัติการ... (Lab 101)"
  const parenMatch = rawRoom.match(/\(([^)]+)\)/) || (rawName && rawName.match(/\(([^)]+)\)/));
  const roomCode = parenMatch
    ? parenMatch[1].trim()
    : rawRoom.length <= 16 && !rawRoom.includes("ห้อง")
    ? rawRoom
    : null;

  let cleanName = rawName || rawRoom;
  if (parenMatch) {
    cleanName = cleanName.replace(/\([^)]+\)/, "").trim();
  }

  // หากไม่มี code หรือ code ซ้ำกับ name
  if (roomCode && cleanName.toLowerCase() === roomCode.toLowerCase()) {
    cleanName = rawName || rawRoom;
  }

  return {
    code: roomCode,
    name: cleanName || rawRoom,
  };
}

export default function ActiveTaskScreen({
  ticket,
  currentUserId,
  currentUserName,
}: ActiveTaskScreenProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // คำนวณรหัสห้องและชื่อห้องแบบตัดข้อความซ้ำซ้อน
  const roomDetails = parseRoomDetails(ticket.room, ticket.roomName);

  // States
  const [currentStatus, setCurrentStatus] = useState<string>(ticket.status);
  const [resolutionNotes, setResolutionNotes] = useState<string>(
    ticket.resolutionDetail || ""
  );
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string>(
    ticket.afterImageUrl || ""
  );
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // On-Hold & ETA States
  const [isOnHoldModalOpen, setIsOnHoldModalOpen] = useState<boolean>(false);
  const [holdReasonInput, setHoldReasonInput] = useState<string>("");
  const [etaDateInput, setEtaDateInput] = useState<string>("");
  const [estimatedCompletionAtState, setEstimatedCompletionAtState] = useState<
    Date | string | null
  >(ticket.estimatedCompletionAt || null);
  const [holdReasonState, setHoldReasonState] = useState<string | null>(
    ticket.holdReason || null
  );

  const setQuickEtaHours = (hours: number) => {
    const d = new Date(Date.now() + hours * 60 * 60 * 1000);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    setEtaDateInput(`${y}-${m}-${day}T${h}:${min}`);
  };

  // Compress and read image to base64 Data URL
  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setAfterPhotoUrl(compressedDataUrl);
        setValidationError(null);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // 1. Action: เช็กอินเข้าพื้นที่ / เริ่มลงมือซ่อม (เปลี่ยนเป็น IN_PROGRESS)
  const handleStartRepair = () => {
    setIsSubmitting(true);
    setValidationError(null);

    startTransition(async () => {
      try {
        const res = await startWorkAction({
          ticketId: ticket.id,
          note: `ช่าง ${currentUserName || "เทคนิค"} เข้าถึงหน้างานและเริ่มลงมือซ่อมแซม`,
        });

        if (res.success) {
          setCurrentStatus("IN_PROGRESS");
          router.refresh();
        } else {
          setValidationError(res.error || "ไม่สามารถเปลี่ยนสถานะเป็นกำลังดำเนินการได้");
        }
      } catch (err: any) {
        console.error(err);
        setValidationError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // 1.5 Action: พักงาน / ยกกลับศูนย์ซ่อม (เปลี่ยนเป็น ON_HOLD พร้อม ETA)
  const handlePutOnHold = () => {
    if (!etaDateInput) {
      setValidationError("กรุณาระบุวันและเวลาที่คาดว่าจะดำเนินการแล้วเสร็จ (ETA)");
      return;
    }
    if (!holdReasonInput.trim()) {
      setValidationError("กรุณากรอกเหตุผลในการพักงานหรือยกเครื่องกลับศูนย์ซ่อม");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    startTransition(async () => {
      try {
        const res = await putTicketOnHoldAction({
          ticketId: ticket.id,
          holdReason: holdReasonInput.trim(),
          estimatedCompletionAt: new Date(etaDateInput),
        });

        if (res.success) {
          setCurrentStatus("ON_HOLD");
          setEstimatedCompletionAtState(etaDateInput);
          setHoldReasonState(holdReasonInput.trim());
          setIsOnHoldModalOpen(false);
          router.refresh();
        } else {
          setValidationError(res.error || "ไม่สามารถพักงานได้");
        }
      } catch (err: any) {
        console.error(err);
        setValidationError("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  // 2. Action: ยืนยันหลักฐาน & ปิดงานซ่อม (เปลี่ยนเป็น RESOLVED)
  const handleCompleteRepair = () => {
    setValidationError(null);

    if (!afterPhotoUrl) {
      setValidationError("กรุณาถ่ายภาพหรือแนบรูปหลักฐานหลังการซ่อมแซม (After Photo)");
      // Scroll to upload section
      document.getElementById("after-photo-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!resolutionNotes.trim() || resolutionNotes.trim().length < 8) {
      setValidationError("กรุณาระบุรายละเอียดการแก้ไขหรืออะไหล่ที่ใช้อย่างน้อย 8 ตัวอักษร");
      document.getElementById("resolution-notes-section")?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    startTransition(async () => {
      try {
        const res = await resolveTicketAction({
          ticketId: ticket.id,
          resolutionNotes: resolutionNotes.trim(),
          resolutionDetail: resolutionNotes.trim(),
          afterImageUrl: afterPhotoUrl.trim(),
        });

        if (res.success) {
          setCurrentStatus("RESOLVED");
          setSuccessModalOpen(true);
          router.refresh();

          // อัตโนมัตินำทางกลับหลัง 2 วินาที
          setTimeout(() => {
            router.push("/technician/dashboard");
          }, 2200);
        } else {
          setValidationError(res.error || "เกิดข้อผิดพลาดในการบันทึกปิดงาน");
          setIsSubmitting(false);
        }
      } catch (err: any) {
        console.error(err);
        setValidationError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
        setIsSubmitting(false);
      }
    });
  };

  // Status Badge Helper
  const renderStatusBadge = () => {
    switch (currentStatus) {
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>รอดำเนินการซ่อม (Assigned)</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span>กำลังดำเนินการ (In-Progress)</span>
          </span>
        );
      case "ON_HOLD":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
            <Pause className="h-3 w-3 stroke-[2.5] text-amber-700" />
            <span>อยู่ระหว่างดำเนินการ (ยกกลับศูนย์ซ่อม)</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>ซ่อมเสร็จสิ้น (Resolved)</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-600" />
            <span>ปิดงานสมบูรณ์ (Closed)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {currentStatus}
          </span>
        );
    }
  };

  const isResolvedOrClosed = currentStatus === "RESOLVED" || currentStatus === "CLOSED";
  const isInProgress = currentStatus === "IN_PROGRESS";
  const isOnHold = currentStatus === "ON_HOLD";
  const isAssigned = currentStatus === "ASSIGNED" || currentStatus === "PENDING";

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans pb-12 md:pb-16">
      {/* 1. Sticky Top Header (Mobile Optimized Field Bar) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <Link
            href="/technician/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>แผนผังอาคาร</span>
          </Link>

          <div className="text-center min-w-0 flex-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                {ticket.ticketNumber}
              </span>
              {ticket.isUrgent && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-rose-600 animate-pulse" />
                  ด่วน SLA {ticket.slaTargetMinutes || 15}m
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            {renderStatusBadge()}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Interactive Milestone Stepper with Radar Ping Pulse */}
        <TicketMilestoneStepper
          status={currentStatus}
          isOnHold={isOnHold}
        />

        {/* Banner แจ้งเตือนเมื่อตั๋วถูกปรับเป็น ON_HOLD */}
        {isOnHold && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/95 p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200/80 text-amber-900 border border-amber-300">
                      <Pause className="h-3 w-3 stroke-[2.5] text-amber-800" />
                      <span>อยู่ระหว่างดำเนินการ (ยกกลับศูนย์ซ่อม)</span>
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      ปลดล็อกแถบงานด้านล่างแล้ว
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950 mt-1">
                    กำหนดส่งมอบงานแล้วเสร็จ (ETA):{" "}
                    <span className="underline decoration-amber-500 font-mono text-amber-900">
                      {estimatedCompletionAtState
                        ? new Date(estimatedCompletionAtState).toLocaleString("th-TH", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }) + " น."
                        : "แจ้งภายหลัง"}
                    </span>
                  </h3>
                </div>
              </div>
            </div>

            {holdReasonState && (
              <div className="p-3 rounded-xl bg-white/90 border border-amber-200 text-xs text-slate-800 space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1.5 text-[11px]">
                  <Info className="h-3.5 w-3.5 text-amber-700" />
                  เหตุผลในการพักงาน / นำกลับศูนย์ซ่อม:
                </span>
                <p className="text-slate-700 pl-5">{holdReasonState}</p>
              </div>
            )}
          </div>
        )}

        {/* 2. ข้อมูลสถานที่และพิกัดหน้างาน (Location & Coordinates) */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">พิกัดและสถานที่เกิดเหตุ</h2>
                <p className="text-[11px] text-slate-500">
                  {ticket.building || "อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์"}
                </p>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white">
              {ticket.floor}F
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 min-w-0 flex flex-col justify-center overflow-hidden">
              <span className="text-[11px] font-medium text-slate-500 block mb-1">
                ห้องที่เกิดเหตุ
              </span>
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {roomDetails.code && (
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100/90 px-2.5 py-0.5 rounded border border-blue-200/80 shrink-0 shadow-2xs">
                    {roomDetails.code}
                  </span>
                )}
                <span className="text-xs sm:text-sm font-semibold text-slate-800 break-words min-w-0 flex-1 leading-snug">
                  {roomDetails.name}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50/70 p-3.5 border border-amber-200/80 min-w-0 flex flex-col justify-center overflow-hidden">
              <span className="text-[11px] font-medium text-amber-800 block mb-1">
                ตำแหน่งเฉพาะจุด
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-950 break-words min-w-0 leading-snug">
                {ticket.specificPoint || ticket.specificLocation || "จุดชำรุดภายในห้อง"}
              </p>
            </div>
          </div>
        </section>

        {/* 3. การ์ดผู้แจ้งซ่อม พร้อมปุ่มโทรออกทันที (Reporter & Contact) */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">ข้อมูลผู้แจ้งซ่อม</h2>
                <p className="text-[11px] text-slate-500">สำหรับประสานงานเข้าเปิดห้องหรือสอบถามอาการ</p>
              </div>
            </div>
            {ticket.reporter?.role && (
              <span className="chip-tech text-[10px] py-0.5 px-2 bg-slate-100 text-slate-700 font-semibold">
                {ticket.reporter.role === "STUDENT"
                  ? "นักศึกษา"
                  : ticket.reporter.role === "STAFF" || ticket.reporter.role === "TEACHER"
                  ? "อาจารย์ / บุคลากร"
                  : ticket.reporter.role}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900">
                {ticket.reporter?.name || "ผู้ใช้งานในระบบ"}
              </p>
              {ticket.reporter?.email && (
                <p className="text-xs text-slate-500 font-mono">{ticket.reporter.email}</p>
              )}
              {ticket.reporter?.studentId && (
                <p className="text-[11px] text-slate-400 font-mono">
                  รหัสนักศึกษา: {ticket.reporter.studentId}
                </p>
              )}
            </div>

            {ticket.reporter?.phone ? (
              <a
                href={`tel:${ticket.reporter.phone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95 shrink-0"
              >
                <Phone className="h-4 w-4" />
                <span>โทรประสานงาน ({ticket.reporter.phone})</span>
              </a>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 text-center">
                ไม่ได้ระบุเบอร์โทรศัพท์ (ติดต่อผ่านข้อความ)
              </div>
            )}
          </div>
        </section>

        {/* 4. ข้อมูลปัญหาและรูปภาพความเสียหาย (Before Photo) */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-2">
              <span className="chip-tech text-[11px] py-1 px-3 bg-blue-50 text-blue-800 border-blue-200 font-semibold shadow-2xs">
                หมวดหมู่: {formatCategoryName(ticket.category)}
              </span>
              <span className="text-[11px] text-slate-400">
                แจ้งเมื่อ: {timeAgoThai(ticket.createdAt)} ({formatDateThai(ticket.createdAt)})
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
              {ticket.title}
            </h3>
          </div>

          {/* รายละเอียด */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide block">
              รายละเอียดอาการเสียจากผู้แจ้ง:
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {ticket.description || "ไม่มีรายละเอียดเพิ่มเติม"}
            </p>
          </div>

          {/* รูปภาพอาการเสีย (Before Photo) */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Camera className="h-4 w-4 text-slate-500" />
              <span>ภาพถ่ายก่อนซ่อม (Before Photo)</span>
            </span>

            {ticket.beforeImageUrl ? (
              <div
                className="relative group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center shadow-inner"
                onClick={() => setZoomedImage(ticket.beforeImageUrl || null)}
              >
                <img
                  src={ticket.beforeImageUrl}
                  alt="ภาพถ่ายจุดชำรุด (Before Photo)"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-2">
                  <Maximize2 className="h-5 w-5" />
                  <span>แตะเพื่อเปิดดูภาพขยาย</span>
                </div>
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[10px] font-medium flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5" />
                  <span>รูปถ่ายสภาพก่อนซ่อม</span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-400">
                <Camera className="h-6 w-6 mx-auto mb-1 text-slate-300" />
                <span>ไม่มีภาพถ่ายอาการเสียจากผู้แจ้ง</span>
              </div>
            )}
          </div>
        </section>

        {/* 5. ส่วนบันทึกผลงานปิดจ็อบ (Resolution & After Photo Upload) */}
        <section
          id="resolution-section"
          className={`rounded-2xl border p-5 shadow-sm space-y-4 transition-all ${
            isResolvedOrClosed
              ? "bg-emerald-50/40 border-emerald-200"
              : isInProgress
              ? "bg-white border-blue-300 ring-2 ring-blue-500/10"
              : "bg-white border-slate-200 opacity-90"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                  isResolvedOrClosed
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                    : "bg-blue-50 text-blue-600 border-blue-200"
                }`}
              >
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {isResolvedOrClosed
                    ? "บันทึกผลการปฏิบัติงานซ่อม (ปิดงานแล้ว)"
                    : "บันทึกผลงาน & ถ่ายภาพปิดจ็อบ (Resolution)"}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {isResolvedOrClosed
                    ? `ซ่อมเสร็จเมื่อ ${formatDateThai(ticket.resolvedAt || ticket.createdAt)}`
                    : "บังคับถ่ายภาพหลังซ่อมและระบุวิธีแก้ไขเพื่อยืนยันปิดงาน"}
                </p>
              </div>
            </div>
            {isResolvedOrClosed && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Check className="h-3 w-3" />
                <span>บันทึกสำเร็จ</span>
              </span>
            )}
          </div>

          {/* ช่องกรอกบันทึกการแก้ไข (Resolution Notes) */}
          <div id="resolution-notes-section" className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>บันทึกขั้นตอนการแก้ไข / อะไหล่ที่ใช้ (Resolution Notes)</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {resolutionNotes.length} ตัวอักษร (ขั้นต่ำ 8)
              </span>
            </label>

            {isResolvedOrClosed ? (
              <div className="rounded-xl bg-white p-3.5 border border-emerald-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {ticket.resolutionDetail || resolutionNotes || "ซ่อมบำรุงเรียบร้อยแล้ว"}
              </div>
            ) : (
              <>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => {
                    setResolutionNotes(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  rows={3}
                  disabled={!isInProgress || isSubmitting}
                  placeholder="ระบุสิ่งที่แก้ไข เช่น เปลี่ยนสายไฟ ขันยึดน็อต ล้างฟิลเตอร์แอร์ หรือเปลี่ยนแผงวงจร..."
                  className="w-full text-xs sm:text-sm rounded-xl border border-slate-300 p-3 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                />

                {/* Quick Templates */}
                {isInProgress && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>ข้อความสำเร็จรูป (คลิกเพื่อนำไปใช้):</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {RESOLUTION_TEMPLATES.map((tmpl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setResolutionNotes(tmpl)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 transition text-left cursor-pointer active:scale-95"
                        >
                          {tmpl}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ช่องอัปโหลด / ถ่ายภาพหลักฐานหลังซ่อม (After Photo) */}
          <div id="after-photo-section" className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="h-4 w-4 text-slate-600" />
                <span>ภาพถ่ายหลักฐานหลังการซ่อมเสร็จ (After Photo) *</span>
              </span>
              {!isResolvedOrClosed && (
                <span className="text-[11px] text-rose-500 font-bold">* บังคับแนบรูป</span>
              )}
            </label>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Preview or Upload Controls */}
            {afterPhotoUrl ? (
              <div className="space-y-2">
                <div
                  className="relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-slate-950 aspect-video flex items-center justify-center shadow-md"
                  onClick={() => setZoomedImage(afterPhotoUrl)}
                >
                  <img
                    src={afterPhotoUrl}
                    alt="ภาพถ่ายหลังซ่อมเสร็จ (After Photo)"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-2">
                    <Maximize2 className="h-5 w-5" />
                    <span>แตะเพื่อเปิดดูภาพขยาย</span>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>ภาพถ่ายหลักฐานหลังซ่อม (After Photo)</span>
                  </div>
                </div>

                {!isResolvedOrClosed && isInProgress && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Camera className="h-4 w-4" />
                      <span>ถ่ายรูปใหม่</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAfterPhotoUrl("")}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer border border-rose-200"
                    >
                      <X className="h-4 w-4" />
                      <span>ลบรูป</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Upload Buttons & Presets */
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!isInProgress || isSubmitting}
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Camera className="h-6 w-6 text-blue-600" />
                    <span className="text-xs font-bold">ถ่ายรูปด้วยกล้อง</span>
                    <span className="text-[10px] text-blue-500">เปิดกล้องมือถือ/แท็บเล็ต</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isInProgress || isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center gap-1.5 transition cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Upload className="h-6 w-6 text-slate-500" />
                    <span className="text-xs font-bold">เลือกไฟล์จากเครื่อง</span>
                    <span className="text-[10px] text-slate-400">อัลบั้มรูปภาพ / ไฟล์ภาพ</span>
                  </button>
                </div>

                {/* Quick Presets for Demo / Testing */}
                {isInProgress && (
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">
                      หรือเลือกภาพตัวอย่างสำเร็จรูป (สำหรับทดสอบระบบ):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {PRESET_AFTER_PHOTOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setAfterPhotoUrl(p.url);
                            setValidationError(null);
                          }}
                          className="p-1.5 rounded-md border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-[11px] font-medium text-slate-700 flex items-center gap-1.5 transition text-left cursor-pointer"
                        >
                          <img
                            src={p.url}
                            alt={p.label}
                            className="h-6 w-6 rounded object-cover shrink-0"
                          />
                          <span className="truncate">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ส่วนท้ายสุดของแบบฟอร์มปฏิบัติงาน (Natural Flow Action Button) */}
          {isInProgress && (
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* ปุ่มตัวเลือก "ยกกลับศูนย์ซ่อม / ต้องรออะไหล่" */}
                <button
                  type="button"
                  onClick={() => {
                    if (!etaDateInput) {
                      setQuickEtaHours(24);
                    }
                    setIsOnHoldModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 sm:w-auto"
                >
                  <Pause className="h-4 w-4 fill-current" />
                  <span>พักงาน / นำกลับศูนย์ซ่อม</span>
                </button>

                {/* ปุ่มยืนยันหลักฐาน & ปิดงานซ่อม */}
                <button
                  type="button"
                  onClick={handleCompleteRepair}
                  disabled={isSubmitting || !afterPhotoUrl}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer ${
                    afterPhotoUrl
                      ? "bg-emerald-800 hover:bg-emerald-900 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังบันทึกปิดงาน...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>ยืนยันหลักฐานและปิดงานซ่อม</span>
                    </>
                  )}
                </button>
              </div>
              {!afterPhotoUrl && (
                <p className="text-center text-xs text-rose-500 mt-2 font-medium">
                  * ถ่ายภาพหลักฐานหลังซ่อมเพื่อปลดล็อกปุ่มปิดงาน หรือกด [พักงาน/นำกลับศูนย์ซ่อม] หากต้องนำเครื่องไปซ่อมที่ศูนย์
                </p>
              )}
            </div>
          )}

          {/* กรณี 2: ON_HOLD -> แสดงสถานะพักงาน พร้อมปุ่มกลับมาดำเนินการต่อ */}
          {isOnHold && (
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isSubmitting || isPending}
                  onClick={handleStartRepair}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>กำลังตรวจสอบสถานะ...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>กลับมาดำเนินงานต่อ</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCompleteRepair}
                  disabled={isSubmitting || !afterPhotoUrl}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer ${
                    afterPhotoUrl
                      ? "bg-emerald-800 hover:bg-emerald-900 text-white"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  <span>ปิดงานซ่อมเมื่อเสร็จสิ้น</span>
                </button>
              </div>
              {!afterPhotoUrl && (
                <p className="text-center text-xs text-slate-500 font-medium">
                  * หากนำเครื่องกลับมาซ่อมจนเสร็จแล้ว สามารถถ่ายภาพหลักฐานและกดปิดงานได้ทันที
                </p>
              )}
            </div>
          )}

          {/* กรณี 1: ASSIGNED หรือ PENDING -> ปุ่มเริ่มงานซ่อม */}
          {isAssigned && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                disabled={isSubmitting || isPending}
                onClick={handleStartRepair}
                className="w-full py-3 px-4 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>กำลังบันทึกเช็กอินเข้าพื้นที่...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>เช็กอินเข้าพื้นที่ / เริ่มลงมือซ่อม</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* กรณี 3: RESOLVED หรือ CLOSED -> แสดงสถานะพร้อมปุ่มกลับ */}
          {isResolvedOrClosed && (
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>งานนี้ได้รับการซ่อมแซมเสร็จสิ้นแล้ว</span>
              </div>
              <Link
                href="/technician/dashboard"
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>กลับสู่แผนผังหลัก</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </main>

      {/* Lightbox Zoom Modal for Photos */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 animate-in fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={zoomedImage}
              alt="ภาพขยายความละเอียดสูง"
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                บันทึกปิดงานซ่อมสำเร็จ
              </h3>
              <p className="text-xs text-slate-500">
                ระบบได้บันทึกหลักฐานและเปลี่ยนสถานะเป็น RESOLVED เรียบร้อยแล้ว
              </p>
            </div>

            <div className="rounded-md bg-slate-50 p-2.5 border border-slate-200 text-xs font-mono text-slate-700">
              {ticket.ticketNumber} • {ticket.room}
            </div>

            <p className="text-[11px] text-slate-400">
              กำลังนำทางกลับสู่แดชบอร์ดอัตโนมัติ...
            </p>

            <Link
              href="/technician/dashboard"
              className="w-full py-2.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
            >
              <span>กลับสู่แดชบอร์ดทันที</span>
            </Link>
          </div>
        </div>
      )}

      {/* On-Hold Modal (ยกกลับศูนย์ซ่อม / ต้องรออะไหล่) */}
      {isOnHoldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  <Pause className="h-4 w-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    พักงาน / นำอุปกรณ์กลับศูนย์ซ่อม
                  </h3>
                  <p className="text-xs text-slate-500">
                    ปลดล็อกแถบงาน Active ด้านล่าง เพื่อให้เริ่มงานอื่นได้
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOnHoldModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Input: datetime-local */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                วันที่และเวลาคาดว่าจะดำเนินการแล้วเสร็จ (ETA) <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={etaDateInput}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setEtaDateInput(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs font-mono text-slate-900 transition outline-none"
              />

              {/* Quick ETA Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-400">ลัดเวลา:</span>
                <button
                  type="button"
                  onClick={() => setQuickEtaHours(3)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[11px] font-medium border border-slate-200 transition"
                >
                  +3 ชั่วโมง
                </button>
                <button
                  type="button"
                  onClick={() => setQuickEtaHours(24)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[11px] font-medium border border-slate-200 transition"
                >
                  พรุ่งนี้ (+24 ชม.)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickEtaHours(72)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[11px] font-medium border border-slate-200 transition"
                >
                  อีก 3 วัน
                </button>
                <button
                  type="button"
                  onClick={() => setQuickEtaHours(168)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 text-[11px] font-medium border border-slate-200 transition"
                >
                  อีก 7 วัน (รออะไหล่)
                </button>
              </div>
            </div>

            {/* Input: เหตุผลที่พักงาน */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                เหตุผลในการพักงาน / ยกกลับศูนย์ซ่อม <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={holdReasonInput}
                onChange={(e) => setHoldReasonInput(e.target.value)}
                placeholder="เช่น ยกเครื่องเคสไปลง Windows ใหม่ที่ศูนย์ซ่อม Lab 101 หรือ รอเบิกพาวเวอร์ซัพพลายตัวใหม่"
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-slate-50 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-xs text-slate-900 transition outline-none resize-none"
              />

              {/* Preset reason recommendation buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] text-slate-400">เลือกเหตุผลด่วน:</span>
                <div className="flex flex-col gap-1.5">
                  {PRESET_HOLD_REASONS.map((r, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setHoldReasonInput(r)}
                      className="p-2 rounded-md border border-slate-200 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-300 text-left text-[11px] text-slate-700 transition"
                    >
                      • {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOnHoldModalOpen(false)}
                className="px-3.5 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmitting || isPending || !etaDateInput || !holdReasonInput.trim()}
                onClick={handlePutOnHold}
                className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>บันทึกและพักงานนี้</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
