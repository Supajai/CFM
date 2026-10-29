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
      title: "อุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์ประจำแล็บ",
      desc: "เครื่องเปิดไม่ติด จอฟ้า จอภาพดับ พาวเวอร์ซัพพลายเสีย อุปกรณ์ต่อพ่วงในห้องแล็บ",
      icon: Laptop,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      count: "SLA 15 นาที",
    },
    {
      title: "ระบบเครือข่ายและอินเทอร์เน็ต",
      desc: "เน็ตหลุด สาย LAN ชำรุด Managed Switch ไม่จ่าย IP สัญญาณ Wi-Fi ห้องปฏิบัติการ",
      icon: Sparkles,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      count: "SLA 15 นาที",
    },
    {
      title: "ระบบเครื่องปรับอากาศ",
      desc: "แอร์รั่ว มีน้ำหยดลงตู้เซิร์ฟเวอร์/โต๊ะคอม แอร์ไม่เย็น พัดลมระบายอากาศเสียงดัง",
      icon: Snowflake,
      color: "text-sky-600 bg-sky-50 border-sky-100",
      count: "SLA 15 นาที",
    },
    {
      title: "ระบบไฟฟ้า แสงสว่าง และปลั๊กไฟ",
      desc: "รางปลั๊กไฟห้องแล็บช็อต หลอดไฟกระพริบ เบรกเกอร์ตัด ไฟฉุกเฉิน",
      icon: Zap,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      count: "SLA 15 นาที",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 flex flex-col justify-between font-sans relative">
      {/* 1. Header / Navbar */}
      <MainNavbar currentUser={sessionUser} />

      {/* 2. Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white/70 backdrop-blur-md py-16 sm:py-20">
          {/* Subtle Radial Glow Light behind Hero */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.18),rgba(255,255,255,0))] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-sm px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>ศูนย์รับแจ้งเหตุและจ่ายงานช่าง อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (4 ชั้น)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              ระบบบริหารจัดการและแจ้งซ่อม <br />
              <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                ประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              สำหรับนักศึกษา คณาจารย์ และบุคลากร แจ้งซ่อมแซมอุปกรณ์ห้องแล็บและกายภาพอาคาร
              รองรับการสแกน QR Code หน้าห้องแล็บ พร้อมติดตามผลแบบเรียลไทม์
            </p>

            {/* 3 Main Entrance Points */}
            <div className="pt-2 flex flex-col items-center space-y-5">
              {/* Entrance 1: Primary Action Button */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/report"
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98]"
                >
                  <Smartphone className="h-4.5 w-4.5 stroke-[1.75]" />
                  <span>แจ้งซ่อม / รายงานปัญหา</span>
                  <ArrowRight className="h-4 w-4 stroke-[1.75]" />
                </Link>

                <Link
                  href="/student/dashboard"
                  className="flex items-center space-x-2 rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-xs px-5 py-3 text-sm font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 hover:border-emerald-500/30"
                >
                  <UserCheck className="h-4.5 w-4.5 text-emerald-600 stroke-[1.75]" />
                  <span>ประวัติการแจ้งซ่อมของฉัน</span>
                </Link>
              </div>

              {/* Entrance 2: Quick Tracking Search Box */}
              <div className="w-full flex flex-col items-center pt-2">
                <p className="text-xs font-medium text-slate-500 mb-2">
                  หรือค้นหาติดตามสถานะใบงานโดยตรง:
                </p>
                <QuickTrackSearch />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Operational Performance Stats */}
        <section className="border-b border-slate-200/80 bg-slate-50/60 backdrop-blur-xs py-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight text-slate-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <CheckCircle2 className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <span>{totalResolved}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  เคสที่แก้ไขเสร็จสิ้น
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight text-slate-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
                    <Clock className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <span>~15 นาที</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  เป้าหมาย SLA การตอบสนอง
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight text-amber-600">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
                    <Wrench className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <span>{totalInProgress} งาน</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  กำลังดำเนินการซ่อมแซม
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-center space-x-2 text-2xl font-bold tracking-tight text-slate-900">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                    <ShieldCheck className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <span>{activeTechnicians} นาย</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">
                  ทีมช่างเทคนิคพร้อมเวรปฏิบัติการ
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Service Categories */}
        <section className="py-14 bg-white/60 backdrop-blur-xs border-b border-slate-200/80">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-1.5 mb-10">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider font-mono">
                Service Catalog
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                หมวดหมู่งานบริการซ่อมบำรุงในสถานศึกษา
              </h2>
              <p className="text-xs text-slate-500">
                ครอบคลุมทุกระบบสาธารณูปโภคและห้องปฏิบัติการคอมพิวเตอร์
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {serviceCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.1)] hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${cat.color} mb-4 shadow-2xs`}>
                        <Icon className="h-5 w-5 stroke-[1.75]" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed font-normal">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-medium text-emerald-700 flex items-center space-x-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        <span className="font-mono text-[11px]">{cat.count}</span>
                      </span>
                      <Link
                        href="/report"
                        className="font-medium text-slate-800 hover:text-emerald-700 flex items-center space-x-1 transition"
                      >
                        <span>แจ้งปัญหานี้</span>
                        <ArrowRight className="h-3.5 w-3.5 stroke-[1.75]" />
                      </Link>
                    </div>
                  </div>
                );
              })}

              {/* Quick Contact Card */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900 p-6 text-white flex flex-col justify-between shadow-[0_8px_24px_-6px_rgba(0,0,0,0.2)]">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-rose-400 mb-4 border border-white/10">
                    <Flame className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1.5">
                    พบเหตุฉุกเฉินที่มีความเสี่ยงทันที?
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    เช่น เพลิงไหม้ ไฟฟ้ารั่วรุนแรง หรือน้ำท่วมห้องเซิร์ฟเวอร์
                    โปรดเปิดสวิตช์ความเร่งด่วนในฟอร์ม หรือโทรแจ้งศูนย์เวรปฏิบัติการทันที
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between">
                  <span className="font-mono text-xs text-rose-400 font-semibold tracking-wider">
                    02-555-1200 ต่อ 248
                  </span>
                  <Link
                    href="/report"
                    className="rounded-xl bg-white text-slate-950 px-3.5 py-1.5 text-xs font-medium hover:bg-slate-100 transition shadow-xs"
                  >
                    แจ้งด่วนพิเศษ
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 3-Step Simple Process */}
        <section className="py-14 bg-transparent">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
                How It Works
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                ขั้นตอนการแจ้งและติดตามงานซ่อม
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:border-emerald-500/40 transition-all space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/60 shadow-2xs font-mono">
                  01
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  ถ่ายรูป & ล็อกพิกัดห้อง
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  เลือกหมวดหมู่อาการ แนบภาพถ่าย และระบบจะดึงพิกัดอาคารสถานที่อัตโนมัติ
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:border-amber-500/40 transition-all space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200/60 shadow-2xs font-mono">
                  02
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  คัดกรอง & มอบหมายช่างทันที
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  ระบบจัดคิวงานตามความเร่งด่วน มอบหมายช่างผู้เชี่ยวชาญพร้อมระบุเวลาถึงหน้างาน
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] hover:border-emerald-500/40 transition-all space-y-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200/60 shadow-2xs font-mono">
                  03
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  ตรวจรับงาน & ประเมินบริการ
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  ตรวจสอบภาพถ่ายหลักฐานหลังการซ่อมเสร็จ และเซ็นตรวจรับงานผ่านระบบดิจิทัล
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-6 pb-24 md:pb-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-semibold">
              C
            </div>
            <span className="font-semibold text-slate-900">CampusOps</span>
            <span>• แผนกวิชาช่างเทคนิคคอมพิวเตอร์</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/report" className="hover:text-emerald-700 transition">
              แจ้งซ่อม
            </Link>
            <Link href="/login" className="hover:text-emerald-700 transition">
              เข้าสู่ระบบ
            </Link>
            <Link href="/tracking/REP-089" className="hover:text-emerald-700 transition">
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
