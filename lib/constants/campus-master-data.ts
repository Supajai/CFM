// lib/constants/campus-master-data.ts
// ข้อมูลมาตรฐาน Master Data สำหรับกำหนดตำแหน่ง แผนก และความเชี่ยวชาญของบุคลากร
// ปรับปรุงสำหรับ: อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (Single Department Scope)

import { Category } from "@prisma/client";
import {
  Droplets,
  Zap,
  Snowflake,
  Armchair,
  Cpu,
  Wifi,
  Video,
  LucideIcon,
  HelpCircle,
} from "lucide-react";

export const ADMIN_POSITIONS = [
  { value: "หัวหน้าแผนกวิชาช่างเทคนิคคอมพิวเตอร์", label: "หัวหน้าแผนกวิชาช่างเทคนิคคอมพิวเตอร์" },
  { value: "หัวหน้างานอาคารสถานที่และพัสดุประจำแผนก", label: "หัวหน้างานอาคารสถานที่และพัสดุประจำแผนก" },
  { value: "ครูผู้ควบคุมห้องปฏิบัติการคอมพิวเตอร์ (Lab Supervisor)", label: "ครูผู้ควบคุมห้องปฏิบัติการคอมพิวเตอร์ (Lab Supervisor)" },
  { value: "เจ้าหน้าที่ธุรการประจำแผนก", label: "เจ้าหน้าที่ธุรการประจำแผนก" },
] as const;

export const ADMIN_DEPARTMENTS = [
  {
    value: "งานบริหารและอาคารสถานที่ แผนกวิชาช่างเทคนิคคอมพิวเตอร์",
    label: "งานบริหารและอาคารสถานที่ แผนกวิชาช่างเทคนิคคอมพิวเตอร์",
  },
] as const;

export const TECHNICIAN_SERVICE_CENTERS = [
  { value: "ศูนย์ฮาร์ดแวร์และซ่อมบำรุง (Lab 101 ชั้น 1)", label: "ศูนย์ฮาร์ดแวร์และซ่อมบำรุง (Lab 101 ชั้น 1)" },
  { value: "ศูนย์ระบบเครือข่ายและเซิร์ฟเวอร์ (ชั้น 4)", label: "ศูนย์ระบบเครือข่ายและเซิร์ฟเวอร์ (ชั้น 4)" },
  { value: "หน่วยงานช่างกายภาพและอาคารสถานที่ประจำแผนก", label: "หน่วยงานช่างกายภาพและอาคารสถานที่ประจำแผนก" },
] as const;

export interface RepairCategoryDef {
  id: Category;
  label: string;
  enLabel: string;
  icon: LucideIcon;
  description: string;
  recommendedSpecialties: string[];
  slaUrgentMinutes: number;
  slaNormalMinutes: number;
  colorClass: {
    bg: string;
    text: string;
    border: string;
    badge: string;
  };
}

/**
 * 7 หมวดหมู่งานซ่อมบำรุงหลักประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (Hybrid: กายภาพอาคาร + ไอทีห้องแล็บ)
 */
export const REPAIR_CATEGORIES: RepairCategoryDef[] = [
  {
    id: Category.PLUMBING,
    label: "ระบบประปา สุขภัณฑ์ และห้องน้ำ",
    enLabel: "Plumbing & Restrooms",
    icon: Droplets,
    description: "ท่อน้ำรั่วซึม ก๊อกน้ำชำรุด ชักโครกกดไม่ลง น้ำไม่ไหล กลิ่นไม่พึงประสงค์",
    recommendedSpecialties: ["ระบบประปาและสุขาภิบาล", "งานซ่อมบำรุงอาคารและสถานที่"],
    slaUrgentMinutes: 30,
    slaNormalMinutes: 180,
    colorClass: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
      badge: "bg-cyan-100 text-cyan-800",
    },
  },
  {
    id: Category.ELECTRICAL,
    label: "ระบบไฟฟ้า แสงสว่าง และปลั๊กไฟ",
    enLabel: "Electrical & Power",
    icon: Zap,
    description: "ไฟดับ หลอดไฟกระพริบ รางปลั๊กไฟห้องแล็บช็อต เบรกเกอร์ทริป ไฟฉุกเฉิน",
    recommendedSpecialties: ["ระบบไฟฟ้าและแสงสว่าง", "ระบบไฟฟ้าและเครื่องปรับอากาศ"],
    slaUrgentMinutes: 15,
    slaNormalMinutes: 120,
    colorClass: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800",
    },
  },
  {
    id: Category.AIR_CONDITIONING,
    label: "ระบบเครื่องปรับอากาศ",
    enLabel: "Air Conditioning",
    icon: Snowflake,
    description: "แอร์ไม่เย็น มีน้ำหยดลงโต๊ะคอม/เซิร์ฟเวอร์ พัดลมแอร์เสียงดัง แอร์ตัดบ่อย",
    recommendedSpecialties: ["ระบบเครื่องปรับอากาศและการทำความเย็น", "ระบบไฟฟ้าและเครื่องปรับอากาศ"],
    slaUrgentMinutes: 15,
    slaNormalMinutes: 120,
    colorClass: {
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
      badge: "bg-sky-100 text-sky-800",
    },
  },
  {
    id: Category.FURNITURE,
    label: "งานโครงสร้าง ครุภัณฑ์ และสถานที่",
    enLabel: "Furniture & Facilities",
    icon: Armchair,
    description: "โต๊ะปฏิบัติการชำรุด เก้าอี้ล้อหัก ประตูล็อกไม่ได้ หน้าต่างปิดไม่สนิท ผนังชำรุด",
    recommendedSpecialties: ["งานโครงสร้าง ครุภัณฑ์ และอาคารสถานที่", "งานซ่อมบำรุงอาคารและสถานที่"],
    slaUrgentMinutes: 60,
    slaNormalMinutes: 1440,
    colorClass: {
      bg: "bg-stone-50",
      text: "text-stone-700",
      border: "border-stone-200",
      badge: "bg-stone-100 text-stone-800",
    },
  },
  {
    id: Category.PC_HARDWARE,
    label: "อุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์ประจำแล็บ",
    enLabel: "PC & Hardware",
    icon: Cpu,
    description: "เครื่องเปิดไม่ติด จอฟ้า จอภาพไม่แสดงผล เมาส์/คีย์บอร์ดเสีย แหล่งจ่ายไฟ (Power Supply) ไหม้",
    recommendedSpecialties: ["ระบบคอมพิวเตอร์ ฮาร์ดแวร์ และห้องปฏิบัติการ", "ช่างเทคนิคห้องปฏิบัติการไอที"],
    slaUrgentMinutes: 15,
    slaNormalMinutes: 60,
    colorClass: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      badge: "bg-indigo-100 text-indigo-800",
    },
  },
  {
    id: Category.NETWORK,
    label: "ระบบเครือข่ายและอินเทอร์เน็ต",
    enLabel: "Network & Wi-Fi",
    icon: Wifi,
    description: "เน็ตหลุด สาย LAN ชำรุด สวิตช์ฮับไม่จ่ายสัญญาณ Wi-Fi ไม่เชื่อมต่อ IP ชนกัน",
    recommendedSpecialties: ["ระบบเครือข่าย อินเทอร์เน็ต และเซิร์ฟเวอร์", "ช่างเทคนิคห้องปฏิบัติการไอที"],
    slaUrgentMinutes: 15,
    slaNormalMinutes: 60,
    colorClass: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-800",
    },
  },
  {
    id: Category.AV_EQUIPMENT,
    label: "โสตทัศนูปกรณ์และสื่อการสอน",
    enLabel: "AV & Presentation",
    icon: Video,
    description: "โปรเจกเตอร์ภาพไม่ขึ้น เครื่องขยายเสียงมีเสียงหวีด ไมโครโฟนไม่ดัง กระดาน Smart Board ดับ",
    recommendedSpecialties: ["ระบบโสตทัศนูปกรณ์และสื่อการสอน", "ระบบไฟฟ้าและแสงสว่าง"],
    slaUrgentMinutes: 15,
    slaNormalMinutes: 90,
    colorClass: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      badge: "bg-rose-100 text-rose-800",
    },
  },
];

export const TECHNICIAN_SPECIALTIES_MASTER = [
  {
    value: "ระบบคอมพิวเตอร์และฮาร์ดแวร์",
    label: "💻 ระบบคอมพิวเตอร์ / ฮาร์ดแวร์ประจำแล็บ (PC & Hardware)",
    category: "PC_HARDWARE",
  },
  {
    value: "ระบบเครือข่ายและ Wi-Fi",
    label: "🌐 ระบบเครือข่าย / Wi-Fi และเซิร์ฟเวอร์ (Network & Wi-Fi)",
    category: "NETWORK",
  },
  {
    value: "โสตทัศนูปกรณ์",
    label: "📽️ โสตทัศนูปกรณ์และสื่อการสอน (AV Equipment)",
    category: "AV_EQUIPMENT",
  },
  {
    value: "เครื่องปรับอากาศ",
    label: "❄️ ระบบเครื่องปรับอากาศและความเย็น (Air Conditioning)",
    category: "AIR_CONDITIONING",
  },
  {
    value: "ระบบไฟฟ้า",
    label: "⚡ ระบบไฟฟ้า แสงสว่าง และปลั๊กไฟ (Electrical & Power)",
    category: "ELECTRICAL",
  },
  {
    value: "ประปาและห้องน้ำ",
    label: "🚰 ระบบประปา สุขภัณฑ์ และห้องน้ำ (Plumbing & Restrooms)",
    category: "PLUMBING",
  },
  {
    value: "โครงสร้างครุภัณฑ์",
    label: "🪑 โครงสร้าง ครุภัณฑ์ และอาคารสถานที่ (Furniture & Facilities)",
    category: "FURNITURE",
  },
] as const;

/**
 * ฟังก์ชันช่วยดึงข้อมูลหมวดหมู่งานซ่อมตาม ID
 */
export function getRepairCategoryDef(category: Category | string): RepairCategoryDef {
  const found = REPAIR_CATEGORIES.find((c) => c.id === category);
  if (found) return found;

  // Fallback สำหรับ legacy/other
  return {
    id: Category.OTHER,
    label: "อื่นๆ / ไม่ระบุหมวดหมู่",
    enLabel: "General / Other",
    icon: HelpCircle,
    description: "ปัญหาหรืออาการชำรุดทั่วไป",
    recommendedSpecialties: ["งานซ่อมบำรุงอาคารและสถานที่"],
    slaUrgentMinutes: 30,
    slaNormalMinutes: 120,
    colorClass: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
      badge: "bg-slate-100 text-slate-800",
    },
  };
}
