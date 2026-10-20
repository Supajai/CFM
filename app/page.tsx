// app/page.tsx
import Link from "next/link";
import {
  Wrench,
  Smartphone,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  Snowflake,
  Zap,
  Droplets,
  Laptop,
  Armchair,
  FileText,
  UserCheck,
  MapPin,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import MainNavbar from "@/components/navigation/MainNavbar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import QuickTrackSearch from "@/components/portal/QuickTrackSearch";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ศูนย์บริการแจ้งซ่อมและรายงานปัญหาในสถานศึกษา | CampusOps",
  description:
    "ระบบบริการแจ้งซ่อมและจัดการอาคารสถานที่สำหรับนักศึกษาและบุคลากร ติดตามสถานะงานซ่อมแบบเรียลไทม์",
};

export default async function HomePage() {
  const sessionUser = await getSession();

  // ดึงสถิติจริงจากฐานข้อมูล
  const [totalResolved, totalInProgress, activeTechnicians] = await Promise.all([
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
    prisma.user.count({ where: { role: "TECHNICIAN" } }),
  ]);

  const serviceCategories = [
    {
      title: "ระบบปรับอากาศและการระบายอากาศ",
      desc: "แอร์รั่ว แอร์ไม่เย็น เสียงดัง ผิดปกติในห้องเรียนและห้องแล็บ",
      icon: Snowflake,
      color: "text-sky-600 bg-sky-50 border-sky-100",
      count: "พร้อมให้บริการ",
    },
    {
      title: "ระบบไฟฟ้าและแสงสว่าง",
      desc: "หลอดไฟกระพริบ ปลั๊กไฟชำรุด ไฟฉุกเฉิน และไฟทางเดิน",
      icon: Zap,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      count: "พร้อมให้บริการ",
    },
    {
      title: "ระบบประปาและสุขาภิบาล",
      desc: "ท่อรั่วซึม สุขภัณฑ์อุดตัน แรงดันน้ำตก และน้ำไม่ไหล",
      icon: Droplets,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      count: "พร้อมให้บริการ",
    },
    {
      title: "โสตทัศนูปกรณ์และไอที",
      desc: "โปรเจกเตอร์ สาย HDMI ระบบเสียงไมโครโฟนห้องบรรยาย",
      icon: Laptop,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      count: "พร้อมให้บริการ",
    },
    {
      title: "ครุภัณฑ์และโครงสร้างกายภาพ",
      desc: "เก้าอี้เรียน โต๊ะปฏิบัติการ ประตูหน้าต่าง กระดานไวท์บอร์ด",
      icon: Armchair,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      count: "พร้อมให้บริการ",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans">
      {/* 1. Header / Navbar */}
      <MainNavbar currentUser={sessionUser} />

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white py-16 sm:py-20">
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ศูนย์รับแจ้งเหตุอาคารและสถานที่ วิทยาเขตหลัก เปิดให้บริการ 24 ชั่วโมง</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              ระบบแจ้งซ่อมและรายงานปัญหา <br />
              <span className="text-blue-600">
                ภายในมหาวิทยาลัยแบบเรียลไทม์
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 leading-relaxed">
              สำหรับนักศึกษา คณาจารย์ และบุคลากร แจ้งปัญหาอาคารสถานที่อย่างรวดเร็ว
              ระบุพิกัด GPS อัตโนมัติ พร้อมติดตามขั้นตอนการซ่อมของทีมช่างได้ทันที
            </p>

            {/* 3 Main Entrance Points */}
            <div className="pt-4 flex flex-col items-center space-y-5">
              {/* Entrance 1: Primary Action Button */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/report"
                  className="flex items-center space-x-2.5 rounded-2xl bg-slate-950 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800 hover:shadow-2xl hover:scale-[1.02] active:scale-95"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>แจ้งซ่อม / รายงานปัญหา</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/student/dashboard"
                  className="flex items-center space-x-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  <span>ประวัติการแจ้งซ่อมของฉัน</span>
                </Link>
              </div>

              {/* Entrance 2: Quick Tracking Search Box */}
              <div className="w-full flex flex-col items-center pt-2">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  หรือค้นหาติดตามสถานะใบงานโดยตรง:
                </p>
                <QuickTrackSearch />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Operational Performance Stats */}
        <section className="border-b border-slate-200 bg-slate-50/60 py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-slate-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>{totalResolved}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  เคสที่แก้ไขเสร็จสิ้น
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-blue-600">
                  <Clock className="h-5 w-5" />
                  <span>~15 นาที</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  เป้าหมาย SLA การตอบสนอง
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-amber-600">
                  <Wrench className="h-5 w-5" />
                  <span>{totalInProgress} งาน</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  กำลังดำเนินการซ่อมแซม
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-center space-x-1 text-2xl font-bold text-purple-600">
                  <ShieldCheck className="h-5 w-5" />
                  <span>{activeTechnicians} นาย</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  ทีมช่างเทคนิคพร้อมเวรปฏิบัติการ
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Service Categories */}
        <section className="py-16 bg-white border-b border-slate-200">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-2 mb-10">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Service Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                หมวดหมู่งานบริการซ่อมบำรุงในสถานศึกษา
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                ครอบคลุมทุกระบบสาธารณูปโภคและสิ่งอำนวยความสะดวกในวิทยาเขต
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviceCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={i}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${cat.color} mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-1.5">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span>{cat.count}</span>
                      </span>
                      <Link
                        href="/report"
                        className="font-bold text-slate-900 hover:text-blue-600 flex items-center space-x-1"
                      >
                        <span>แจ้งปัญหานี้</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Quick Contact Card */}
              <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 text-white flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-rose-400 mb-4">
                    <Flame className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    พบเหตุฉุกเฉินที่มีความเสี่ยงทันที?
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    เช่น เพลิงไหม้ ไฟฟ้ารั่วรุนแรง หรือน้ำท่วมห้องเซิร์ฟเวอร์
                    โปรดเปิดสวิตช์ความเร่งด่วนในฟอร์ม หรือโทรแจ้งศูนย์เวรปฏิบัติการทันที
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs text-rose-400 font-bold">
                    02-555-1200 ต่อ 248
                  </span>
                  <Link
                    href="/report"
                    className="rounded-xl bg-white text-slate-950 px-3.5 py-1.5 text-xs font-bold hover:bg-slate-100 transition"
                  >
                    แจ้งด่วนพิเศษ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 3-Step Simple Process */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-10">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                How It Works
              </span>
              <h2 className="text-2xl font-bold text-slate-900">
                ขั้นตอนการแจ้งและติดตามงานซ่อม
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                  1
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  ถ่ายรูป & ล็อกพิกัด GPS
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  เลือกหมวดหมู่อาการ แนบภาพถ่าย และระบบจะดึงพิกัดอาคารสถานที่อัตโนมัติ
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 font-bold text-sm">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  คัดกรอง & มอบหมายช่างทันที
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ระบบจัดคิวงานตามความเร่งด่วน มอบหมายช่างผู้เชี่ยวชาญพร้อมระบุเวลาถึงหน้างาน
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold text-sm">
                  3
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  ตรวจรับงาน & ประเมินบริการ
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  ตรวจสอบภาพถ่ายหลักฐานหลังการซ่อมเสร็จ และเซ็นตรวจรับงานผ่านระบบดิจิทัล
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 pb-24 md:pb-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold">
              C
            </div>
            <span className="font-bold text-slate-800">CampusOps</span>
            <span>• ระบบบริหารจัดการและรายงานปัญหาอาคารสถานที่ในสถานศึกษา</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/report" className="hover:text-slate-900 transition">
              แจ้งซ่อม
            </Link>
            <Link href="/login" className="hover:text-slate-900 transition">
              เข้าสู่ระบบ
            </Link>
            <Link href="/tracking/REP-089" className="hover:text-slate-900 transition">
              ติดตามงาน #REP-089
            </Link>
          </div>
        </div>
      </footer>

      {/* 7. Mobile Bottom Navigation */}
      <MobileBottomNav currentUser={sessionUser} />
    </div>
  );
}
