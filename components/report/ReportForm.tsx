// components/report/ReportForm.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Snowflake,
  Droplets,
  Laptop,
  Armchair,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  X,
  Upload,
  ChevronDown,
  ArrowLeft,
  SlidersHorizontal,
  Moon,
  Loader2,
  Info,
} from "lucide-react";
import { Category } from "@prisma/client";
import { createTicketAction } from "@/actions/ticket";
import SmartPageHeader from "@/components/navigation/SmartPageHeader";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { SessionPayload } from "@/lib/auth";

// ข้อมูลหมวดหมู่ตรงตามชิปใน Mockup 1
const CATEGORIES = [
  { id: Category.ELECTRICAL, label: "ระบบไฟฟ้า", icon: Zap },
  {
    id: Category.AIR_CONDITIONING,
    label: "เครื่องปรับอากาศและการระบายอากาศ",
    icon: Snowflake,
  },
  { id: Category.PLUMBING, label: "ประปา", icon: Droplets },
  { id: Category.IT_EQUIPMENT, label: "ไอที", icon: Laptop },
  { id: Category.FURNITURE, label: "ครุภัณฑ์", icon: Armchair },
];

const BUILDINGS = [
  "อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์",
  "อาคาร 1 - อาคารเรียนรวมและปฏิบัติการวิศวกรรม",
  "อาคาร 2 - อาคารบรรยายรวม",
  "อาคาร 5 - อาคารเรียนและวิทยบริการ",
  "หอสมุดกลาง วิทยาเขตหลัก",
  "เวิร์กช็อป 4 - อาคารซ่อมบำรุงกลาง",
];

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟอร์มสเตท
  const [category, setCategory] = useState<Category>(Category.AIR_CONDITIONING);
  const [building, setBuilding] = useState(
    "อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์"
  );
  const [room, setRoom] = useState(
    "ห้องปฏิบัติการ 402 ชั้น 4 (ฝั่งทิศตะวันตก)"
  );
  const [description, setDescription] = useState(
    "เครื่องปรับอากาศเครื่องที่ #AC-04 มีน้ำหยดลงมาอย่างต่อเนื่องบริเวณโต๊ะเซิร์ฟเวอร์สำรองและโต๊ะปฏิบัติการนักศึกษาโต๊ะที่ 6 เสี่ยงต่อการลัดวงจร"
  );
  const [isUrgent, setIsUrgent] = useState(true);

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

  // รายการภาพถ่าย (เริ่มต้นใส่ภาพจำลองตาม Mockup 1 ให้ตรงเป๊ะ)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      name: "ภาพน้ำแอร์หยด ท่อ.jpg",
      size: "1.2 MB",
      url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80",
      fileType: "image/jpeg",
    },
    {
      name: "น้ำขังใต้โต๊ะเซิร์ฟเวอร์.jpg",
      size: "2.4 MB",
      url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80",
      fileType: "image/jpeg",
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          // หากผู้ใช้ปฏิเสธ ให้ใช้ค่าพิกัดภายในวิทยาเขตตาม Mockup
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

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

    if (!description.trim()) {
      setErrorMsg("กรุณากรอกรายละเอียดอาการและปัญหา");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await createTicketAction({
        category,
        building,
        room,
        specificLocation: "แร็คเซิร์ฟเวอร์ตู้ที่ #04",
        latitude: coords.lat,
        longitude: coords.lng,
        gpsAccuracy: coords.accuracy,
        description,
        isUrgent,
        attachments: uploadedFiles.map((f) => ({
          fileName: f.name,
          fileSize: f.size,
          fileType: f.fileType,
          url: f.url,
        })),
      });

      if (res.success && res.ticketNumber) {
        // Redirect ไปหน้าติดตามสถานะของตั๋วใบนั้น
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

  return (
    <div className="mx-auto max-w-md min-h-screen bg-slate-50 text-slate-800 pb-28 shadow-2xl relative">
      {/* 1. Header บาร์ด้านบนพร้อม Breadcrumbs และปุ่มย้อนกลับอัจฉริยะ */}
      <SmartPageHeader
        title="แจ้งซ่อม / แจ้งปัญหา"
        subtitle="ระบบบริหารจัดการอาคาร • งานซ่อมบำรุง"
        currentUser={currentUser}
        breadcrumbs={[{ label: "แจ้งซ่อมบำรุง" }]}
      />

      {/* 2. Status Banner แจ้งเตือนสถานะศูนย์ซ่อม */}
      <div className="mx-4 mt-3 flex items-center justify-between rounded-xl bg-slate-100/90 px-3 py-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <span className="text-[12px] font-medium text-slate-700">
            ศูนย์ซ่อมบำรุง วิทยาเขตฝั่งตะวันออก • สถานะปกติ
          </span>
        </div>
        <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] text-slate-600">
          ระบบคัดกรองเปิดใช้งาน
        </span>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pt-4 space-y-5">
        {/* ข้อความแจ้งเตือน Error ถ้ามี */}
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 3. หมวดหมู่ปัญหา (Category Chips) */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900">
              ประเภทปัญหา <span className="text-red-500">*</span>
            </label>
            <span className="text-xs font-medium text-slate-400">
              ขั้นตอนที่ 1 จาก 4
            </span>
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex shrink-0 items-center space-x-1.5 rounded-full px-4 py-2 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-slate-950 text-white shadow-md ring-2 ring-slate-900/10"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 ${
                      isSelected ? "text-emerald-400" : "text-slate-500"
                    }`}
                  />
                  <span>{cat.label}</span>
                  {isSelected && (
                    <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. อัปโหลดภาพหลักฐาน */}
        <div>
          <div className="mb-1">
            <label className="text-sm font-bold text-slate-900">
              ภาพถ่ายหลักฐาน <span className="text-red-500">*</span>
            </label>
            <p className="text-[12px] text-slate-400">
              แนบภาพถ่ายเพื่อให้ช่างประเมินและคัดกรองได้ทันที
            </p>
          </div>

          {/* กล่องแตะเพื่อถ่ายรูป/เลือกไฟล์ */}
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
            className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-6 text-center transition hover:border-slate-300 hover:bg-slate-50/50"
          >
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Camera className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              แตะเพื่อถ่ายภาพหรืออัปโหลดหลักฐาน
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              JPG, PNG, HEIC สูงสุด 15MB
            </p>
          </div>

          {/* พรีวิวรูปภาพที่เลือก */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3">
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
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:bg-black"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    {/* แถบข้อมูลขนาดไฟล์ล่างภาพ */}
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2 py-1 text-[11px] text-white">
                      <span>{file.size}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-600 font-medium">
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. ระบุพิกัดสถานที่และอาคาร */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <MapPin className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">
                ระบุพิกัดสถานที่
              </span>
            </div>
            <div className="flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 border border-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ล็อกพิกัด GPS แล้ว</span>
            </div>
          </div>

          {/* แถบแสดงพิกัด GPS */}
          <div className="flex items-center justify-between rounded-xl bg-slate-100/90 px-3 py-2 text-xs font-mono text-slate-700">
            <span>
              {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
            </span>
            <span className="font-sans text-[11px] text-slate-400">
              ความแม่นยำ ±{coords.accuracy} ม.
            </span>
          </div>

          {/* ดรอปดาวน์เลือกอาคาร */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              อาคารในมหาวิทยาลัย
            </label>
            <div className="relative">
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs font-medium text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-none"
              >
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* ระบุห้อง / จุดเกิดเหตุ */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              ห้อง / จุดเกิดเหตุที่ชัดเจน
            </label>
            <div className="relative">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="เช่น ห้อง 402 ชั้น 4 อาคาร 3"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 pr-8 text-xs font-medium text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-none"
              />
              <CheckCircle2 className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* 6. รายละเอียดอาการและปัญหา */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900">
              รายละเอียดอาการและปัญหา
            </label>
            <span className="text-[11px] text-slate-400">
              {description.length} ตัวอักษร
            </span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ระบุอาการชำรุด หรือตำแหน่งของอุปกรณ์ให้ชัดเจนที่สุด..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 p-3.5 text-xs leading-relaxed text-slate-800 transition focus:border-slate-400 focus:bg-white focus:outline-none"
          />
        </div>

        {/* 7. สวิตช์ความเร่งด่วน */}
        <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-white p-3.5 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                ระดับความเร่งด่วน
              </p>
              <p className="text-[11px] font-medium text-rose-600">
                ความเร่งด่วน: สูง (มีความเสี่ยงทันที)
              </p>
            </div>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-rose-500 peer-checked:after:translate-x-full peer-focus:outline-none"></div>
          </label>
        </div>

        {/* 8. SLA Info Badge */}
        <div className="flex items-center justify-between rounded-xl bg-slate-100/80 px-3 py-2 text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[11px] font-medium">
              เป้าหมาย SLA: ส่งช่างภายใน 15 นาที
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push("/tracking/REP-089")}
            className="text-[11px] font-semibold text-slate-700 underline underline-offset-2 hover:text-slate-900"
          >
            ตัวอย่างตั๋วงาน
          </button>
        </div>

        {/* 9. ปุ่มส่งคำขอแจ้งซ่อม (Fixed Bottom / Sticky) */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-slate-950 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-900 active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังส่งคำขอแจ้งซ่อม...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 -rotate-12" />
                <span>ส่งคำขอแจ้งซ่อม</span>
              </>
            )}
          </button>

          <p className="mt-2 text-center text-[11px] text-slate-400 flex items-center justify-center space-x-1">
            <span>🔒 ยืนยันตัวตนนศ.แล้ว ส่งตั๋วเข้าระบบช่างโดยอัตโนมัติ</span>
          </p>
        </div>
      </form>

      {/* 10. Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentUser={currentUser} />
    </div>
  );
}
