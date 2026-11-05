// components/report/ReportForm.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  X,
  Upload,
  ChevronDown,
  Loader2,
  Info,
  QrCode,
  Layers,
  Building,
  Flame,
  ShieldAlert,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { Category, Priority } from "@prisma/client";
import { createTicketAction, checkDuplicateTicketsAction } from "@/actions/ticket";
import SmartPageHeader from "@/components/navigation/SmartPageHeader";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { SessionPayload } from "@/lib/auth";
import {
  DEPARTMENT_BUILDING_NAME,
  DEPARTMENT_FLOORS_DATA,
  getRoomsByFloor,
  findDepartmentRoom,
  DepartmentRoom,
} from "@/lib/constants/department-locations";
import {
  REPAIR_CATEGORIES,
  getRepairCategoryDef,
  RepairCategoryDef,
} from "@/lib/constants/campus-master-data";

interface UploadedFile {
  name: string;
  size: string;
  url: string;
  fileType: string;
}

interface ReportFormProps {
  currentUser?: SessionPayload | null;
}

export default function ReportForm({ currentUser }: ReportFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. อ่านค่า Query Parameters (URL Prefill / QR Code เช่น /report?floor=3&room=Lab301)
  const floorParam = searchParams.get("floor");
  const roomParam = searchParams.get("room");
  const specificPointParam = searchParams.get("specificPoint");

  // ตรวจหาห้องเริ่มต้นจาก Param
  const prefilledRoom = roomParam ? findDepartmentRoom(roomParam) : undefined;
  const initialFloor = prefilledRoom ? prefilledRoom.floor : floorParam ? parseInt(floorParam, 10) || 1 : 1;
  const initialRoomName = prefilledRoom ? prefilledRoom.name : getRoomsByFloor(initialFloor)[0]?.name || "";

  // ฟอร์มสเตท
  const [floor, setFloor] = useState<number>(initialFloor);
  const [room, setRoom] = useState<string>(initialRoomName);
  const [specificPoint, setSpecificPoint] = useState<string>(specificPointParam || "");
  const [category, setCategory] = useState<Category>(Category.PC_HARDWARE);
  const [description, setDescription] = useState<string>("");
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [hasQrPrefill, setHasQrPrefill] = useState<boolean>(Boolean(prefilledRoom || roomParam || specificPointParam));

  // พิกัด GPS
  const [coords, setCoords] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  }>({
    lat: 15.2284,
    lng: 104.8592,
    accuracy: 2,
  });
  const [isLocating, setIsLocating] = useState(false);

  // รายการภาพถ่ายหลักฐานก่อนซ่อม (Before Images)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      name: "ภาพคอมพิวเตอร์_เปิดไม่ติด_จอดับ.jpg",
      size: "1.4 MB",
      url: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80",
      fileType: "image/jpeg",
    },
  ]);

  // ระบบตรวจจับงานซ้ำเบื้องต้น (Duplicate Warning System)
  const [duplicateWarning, setDuplicateWarning] = useState<{
    hasDuplicate: boolean;
    count: number;
    duplicates: Array<{
      id: string;
      ticketNumber: string;
      title: string;
      status: string;
      room: string;
      specificPoint?: string | null;
      createdAt: Date | string;
    }>;
  } | null>(null);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // เมื่อเลือกชั้น ให้ปรับตัวเลือกห้องอัตโนมัติ
  const currentFloorRooms = getRoomsByFloor(floor);

  const handleFloorChange = (newFloor: number) => {
    setFloor(newFloor);
    const rooms = getRoomsByFloor(newFloor);
    if (rooms.length > 0) {
      setRoom(rooms[0].name);
    }
  };

  // ดึง Geolocation จากเบราว์เซอร์อัตโนมัติ
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: parseFloat(position.coords.latitude.toFixed(4)),
            lng: parseFloat(position.coords.longitude.toFixed(4)),
            accuracy: Math.round(position.coords.accuracy) || 2,
          });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // ฟังก์ชันตรวจจับงานซ้ำเมื่อห้องหรือหมวดหมู่เปลี่ยน
  const checkDuplicates = useCallback(async () => {
    if (!room) return;
    setIsCheckingDuplicates(true);
    try {
      const res = await checkDuplicateTicketsAction({
        floor,
        room,
        roomName: room,
        category,
      });

      if (res.hasDuplicate && res.duplicates.length > 0) {
        setDuplicateWarning({
          hasDuplicate: true,
          count: res.count,
          duplicates: res.duplicates as any,
        });
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      console.error("Duplicate check error:", e);
    } finally {
      setIsCheckingDuplicates(false);
    }
  }, [floor, room, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkDuplicates();
    }, 400);
    return () => clearTimeout(timer);
  }, [checkDuplicates]);

  // จัดการอัปโหลดไฟล์ / ถ่ายภาพ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];
    Array.from(files).forEach((file) => {
      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
      const fakeUrl = URL.createObjectURL(file);
      newFiles.push({
        name: file.name,
        size: `${sizeInMb} MB`,
        url: fakeUrl,
        fileType: file.type,
      });
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ส่งข้อมูลฟอร์ม
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!room.trim()) {
      setErrorMsg("กรุณาเลือกห้องหรือพื้นที่เกิดเหตุ");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setErrorMsg("กรุณากรอกรายละเอียดอาการและปัญหาอย่างน้อย 10 ตัวอักษร");
      return;
    }

    try {
      setIsSubmitting(true);

      const categoryDef = getRepairCategoryDef(category);
      const fullTitle = `${categoryDef.label} - ${room}${specificPoint ? ` (${specificPoint})` : ""}`;

      const res = await createTicketAction({
        category,
        building: DEPARTMENT_BUILDING_NAME,
        floor,
        room,
        roomName: room,
        specificPoint: specificPoint.trim() || undefined,
        specificLocation: specificPoint.trim() ? `${room} • ${specificPoint.trim()}` : room,
        latitude: coords.lat,
        longitude: coords.lng,
        gpsAccuracy: coords.accuracy,
        description: description.trim(),
        isUrgent,
        priority: isUrgent ? Priority.CRITICAL : Priority.NORMAL,
        title: fullTitle,
        beforeImageUrl: uploadedFiles[0]?.url,
        attachments: uploadedFiles.map((f) => ({
          fileName: f.name,
          fileSize: f.size,
          fileType: f.fileType,
          url: f.url,
        })),
      });

      if (res.success && res.ticketNumber) {
        const cleanNumber = res.ticketNumber.replace("#", "");
        router.push(`/tracking/${cleanNumber}`);
      } else {
        setErrorMsg(res.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้");
      setIsSubmitting(false);
    }
  };

  const selectedCategoryDef = getRepairCategoryDef(category);

  return (
    <div className="mx-auto max-w-lg min-h-screen bg-zinc-50 text-zinc-900 pb-28 border-x border-zinc-200 relative">
      {/* 1. Header บาร์ด้านบนพร้อม Breadcrumbs */}
      <SmartPageHeader
        title="แจ้งซ่อมประจำอาคาร"
        subtitle="แผนกเทคโนโลยีคอมพิวเตอร์"
        currentUser={currentUser}
        breadcrumbs={[{ label: "แจ้งซ่อมประจำอาคาร" }]}
      />

      {/* 2. QR Code Prefill Info Banner */}
      {hasQrPrefill && (
        <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-emerald-50/90 border border-emerald-200 p-3 text-xs text-emerald-950 shadow-2xs animate-in fade-in duration-300">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950">
                สแกน QR Code ประจำจุดสำเร็จ
              </p>
              <p className="text-[11px] text-emerald-700">
                ล็อกตำแหน่ง: ชั้น {floor} • {room}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHasQrPrefill(false)}
            className="rounded-lg p-1 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100/50 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 3. Status Banner ประจำอาคาร */}
      <div className="mx-4 mt-3 flex items-center justify-between rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-xs text-slate-600 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
          </span>
          <span className="text-xs font-medium text-slate-800">
            ศูนย์บริการช่างประจำอาคารแผนกคอมพิวเตอร์ • พร้อมรับแจ้ง
          </span>
        </div>
        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-700 border border-emerald-200">
          SLA ด่วน 15 นาที
        </span>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-3.5 space-y-4">
        {/* ข้อความแจ้งเตือน Error ถ้ามี */}
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 shadow-sm">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 4. กล่องระบุสถานที่ */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          {/* Badge แสดงอาคารหลักคงที่ */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Building className="h-4 w-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-slate-400 block">
                  สถานที่หลัก (FIXED SCOPE)
                </span>
                <span className="text-xs font-semibold text-slate-900 flex items-center space-x-1">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                  <span>{DEPARTMENT_BUILDING_NAME}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200/60">
              <Layers className="h-3 w-3" />
              <span>4 ชั้นเรียน/แล็บ</span>
            </div>
          </div>

          {/* Segmented Button Controls: 1F | 2F | 3F | 4F */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-800">
                เลือกระดับชั้น (Floor Selection) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-700">
                {DEPARTMENT_FLOORS_DATA.find((f) => f.floor === floor)?.description}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              {DEPARTMENT_FLOORS_DATA.map((f) => {
                const isSelected = floor === f.floor;
                return (
                  <button
                    key={f.floor}
                    type="button"
                    onClick={() => handleFloorChange(f.floor)}
                    className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-white text-emerald-700 shadow-sm border border-slate-200/90"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <span className="font-mono text-sm tracking-tight">{f.floor}F</span>
                    <span className="text-[9px] font-normal opacity-80 truncate max-w-[60px]">
                      {f.label.split(" ")[1] || f.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cascading Dropdown: ห้อง/พื้นที่ประจำชั้น */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-800">
              ห้อง / พื้นที่ปฏิบัติการ <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full h-10 appearance-none rounded-xl border border-slate-200 bg-white/90 px-3 py-1 pr-8 text-xs font-medium text-slate-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 truncate"
              >
                {currentFloorRooms.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} {r.description ? `— ${r.description}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* ช่องกรอก: ระบุจุดเกิดเหตุ / หมายเลขเครื่อง */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-800">
                จุดสังเกตเฉพาะ / หมายเลขเครื่อง / จุดเกิดเหตุ
              </label>
              <span className="text-[11px] text-slate-400">ตัวเลือกเพิ่มเติม</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={specificPoint}
                onChange={(e) => setSpecificPoint(e.target.value)}
                placeholder="เช่น โต๊ะคอมเครื่องที่ 12, แอร์แถวหลังห้อง, ตู้ Rack A-02"
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs text-slate-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* GPS Coordinates & Accuracy */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-[11px] text-slate-600 font-mono">
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              พิกัดอาคารแผนกคอมฯ (±{coords.accuracy} ม.)
            </span>
          </div>
        </div>

        {/* 5. หมวดหมู่งานซ่อมบำรุง 7 หมวดหมู่หลัก */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-900 block">
                หมวดหมู่งานซ่อมบำรุง <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                กายภาพอาคาร และอุปกรณ์ไอทีประจำห้องแล็บ
              </p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-mono font-semibold text-slate-700 border border-slate-200/60">
              7 หมวดหมู่
            </span>
          </div>

          {/* Chips Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {REPAIR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-start space-x-3 rounded-xl p-3 text-left transition-all ${
                    isSelected
                      ? "bg-emerald-50/90 text-emerald-950 border border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm"
                      : "bg-white/80 hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                        : "bg-slate-100 text-slate-700 border border-slate-200/80"
                    }`}
                  >
                    <Icon className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{cat.label}</p>
                    <p
                      className={`text-[10px] truncate mt-0.5 font-mono ${
                        isSelected ? "text-emerald-700" : "text-slate-400"
                      }`}
                    >
                      {cat.enLabel}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-emerald-600 mt-1 shrink-0 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* หมวดหมู่ที่เลือกและรายละเอียด */}
          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-200/80 flex items-center space-x-2">
            <Info className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="truncate">{selectedCategoryDef.description}</span>
          </div>
        </div>

        {/* 6. ระบบตรวจจับงานซ้ำเบื้องต้น */}
        {duplicateWarning && duplicateWarning.hasDuplicate && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm text-xs text-amber-900 animate-in fade-in slide-in-from-top-2 duration-300 space-y-2.5">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-amber-950">
                    แจ้งเตือน: พบรายการแจ้งซ่อมซ้ำซ้อนในจุดนี้ ({duplicateWarning.count} รายการ)
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    มีผู้แจ้งปัญหาหมวดหมู่ &quot;{selectedCategoryDef.label}&quot; ในห้องนี้แล้วและกำลังอยู่ระหว่างดำเนินการ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDuplicateModal(!showDuplicateModal)}
                className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-300 transition"
              >
                {showDuplicateModal ? "ซ่อน" : "กดดูสถานะ"}
              </button>
            </div>

            {/* กล่องแสดงรายการงานซ้ำเมื่อกดดู */}
            {showDuplicateModal && (
              <div className="pt-2 border-t border-amber-200 space-y-1.5">
                {duplicateWarning.duplicates.map((dup) => (
                  <div
                    key={dup.id}
                    className="flex items-center justify-between rounded-xl bg-white p-2.5 border border-amber-200 text-[11px]"
                  >
                    <div>
                      <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md mr-1.5 border border-slate-200">
                        {dup.ticketNumber}
                      </span>
                      <span className="font-semibold text-slate-800">{dup.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push(`/tracking/${dup.ticketNumber.replace("#", "")}`)}
                      className="flex items-center space-x-1 font-medium text-emerald-700 hover:text-emerald-900 underline ml-2 shrink-0"
                    >
                      <span>ติดตาม</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. อัปโหลดภาพถ่ายหลักฐานปัญหา */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-semibold text-slate-900 block">
                ภาพถ่ายหลักฐานก่อนซ่อม (Before Photo Proof)
              </label>
              <p className="text-[11px] text-slate-500">
                ถ่ายภาพความเสียหายของอุปกรณ์หรือหน้างานเพื่อประกอบการคัดกรอง
              </p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[10px] font-mono font-semibold text-emerald-700 border border-emerald-200">
              แนบแล้ว {uploadedFiles.length} รูป
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 py-6 text-center transition hover:border-emerald-500/60 hover:bg-slate-100/50"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 shadow-2xs">
              <Camera className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-slate-800">
              แตะเพื่อถ่ายรูปหรือลากรูปภาพมาวางที่นี่
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              JPG, PNG, HEIC (รองรับภาพถ่ายมือถือและกล้องสด)
            </p>
          </div>

          {/* พรีวิวรูปภาพที่เลือก */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="relative group">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />

                    {/* ปุ่มลบรูป */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(idx);
                      }}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-slate-900/80 text-white transition hover:bg-slate-900"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 py-1 text-[10px] text-white flex items-center justify-between">
                      <span className="truncate font-mono">{file.size}</span>
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                    </div>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-slate-500 font-medium">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. รายละเอียดอาการและปัญหา */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-900">
              รายละเอียดอาการชำรุดและปัญหา <span className="text-rose-500">*</span>
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {description.length} ตัวอักษร
            </span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="อธิบายอาการเสียให้ชัดเจน เช่น เปิดสวิตช์แล้วเครื่องดับทันที มีกลิ่นไหม้ หรือแอร์น้ำหยดลงโต๊ะ..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-900 shadow-sm transition focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
          />
        </div>

        {/* 9. ระดับความเร่งด่วน */}
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <label className="text-xs font-semibold text-slate-900 block">
            ระดับความเร่งด่วน (Urgency & Priority)
          </label>

          <div className="grid grid-cols-2 gap-3">
            {/* ปกติ */}
            <button
              type="button"
              onClick={() => setIsUrgent(false)}
              className={`flex items-center space-x-3 rounded-xl p-3 text-left transition-all border ${
                !isUrgent
                  ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 shadow-sm"
                  : "border-slate-200 bg-white/80 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  !isUrgent
                    ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                    : "bg-slate-100 text-slate-500 border border-slate-200/80"
                }`}
              >
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">ปกติ (Normal)</p>
                <p className="text-[10px] text-slate-500 font-mono">ตอบสนองใน 120 นาที</p>
              </div>
            </button>

            {/* ด่วนมาก */}
            <button
              type="button"
              onClick={() => setIsUrgent(true)}
              className={`flex items-center space-x-3 rounded-xl p-3 text-left transition-all border ${
                isUrgent
                  ? "border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20 shadow-sm"
                  : "border-slate-200 bg-white/80 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isUrgent
                    ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
                    : "bg-slate-100 text-slate-500 border border-slate-200/80"
                }`}
              >
                <Flame className="h-4 w-4 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-950">ด่วนมาก (Critical)</p>
                <p className="text-[10px] text-rose-600 font-mono font-medium">ตอบสนองด่วน 15 นาที</p>
              </div>
            </button>
          </div>
        </div>

        {/* 10. ปุ่มส่งคำขอแจ้งซ่อม */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/25 transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังส่งข้อมูลเข้าสู่ระบบช่างประจำอาคาร...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>ยืนยันส่งเรื่องแจ้งซ่อมประจำอาคาร</span>
              </>
            )}
          </button>

          <p className="mt-2 text-center text-[11px] text-slate-500 font-normal">
            ส่งข้อมูลตรงถึงหัวหน้างานอาคารและช่างเทคนิคประจำแผนกทันที
          </p>
        </div>
      </form>

      {/* 11. Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
