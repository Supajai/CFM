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
  Laptop,
  UserCheck,
  Sparkles,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import MainNavbar from "@/components/navigation/MainNavbar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import QuickTrackSearch from "@/components/portal/QuickTrackSearch";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

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

      {/* 2. Ambient Canvas & Hero Zone */}
      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-slate-50/60 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] flex flex-col justify-between py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glow แสงมรกตนุ่มด้านหลัง */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />

        {/* Hero Content */}
        <div className="relative mx-auto max-w-5xl text-center space-y-6 pt-4 pb-6">
          {/* Pill Badge หัวเรื่อง */}
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-200/80 shadow-sm text-emerald-800 text-xs font-semibold px-3.5 py-1.5 rounded-full inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>ศูนย์รับแจ้งเหตุและจ่ายงานซ่อมบำรุง อาคารแผนกเทคโนโลยีคอมพิวเตอร์</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            ระบบบริหารจัดการและแจ้งซ่อม <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 bg-clip-text text-transparent block mt-1">
              ประจำอาคารแผนกเทคโนโลยีคอมพิวเตอร์
            </span>
          </h1>

          {/* Sub-description */}
          <p className="max-w-2xl mx-auto text-slate-600 text-sm sm:text-base leading-relaxed mt-4 font-normal">
            สำหรับนักศึกษา คณาจารย์ และบุคลากร แจ้งซ่อมแซมอุปกรณ์ห้องปฏิบัติการและกายภาพอาคาร
            รองรับการระบุพิกัดห้องและตำแหน่งอุปกรณ์ พร้อมติดตามผลแบบเรียลไทม์
          </p>

          {/* CTA Buttons & Search Command Bar */}
          <div className="pt-2 flex flex-col items-center space-y-6">
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/report"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Smartphone className="h-4 w-4" />
                <span>แจ้งซ่อม / รายงานปัญหา</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/student/dashboard"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="h-4 w-4 text-emerald-700" />
                <span>ประวัติการแจ้งซ่อมของฉัน</span>
              </Link>
            </div>

            {/* Quick Tracking Command Bar (Spotlight Search) */}
            <div className="w-full max-w-xl mx-auto mt-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5 block">
                หรือค้นหาติดตามสถานะใบงานโดยตรง
              </span>
              <QuickTrackSearch />
            </div>
          </div>
        </div>

        {/* 4 Telemetry Metric Cards */}
        <div className="mx-auto max-w-6xl w-full pt-8 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {/* Card 1: Resolved */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-tight leading-snug">
                  เคสที่แก้ไขเสร็จสิ้น
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-emerald-50 text-emerald-600 ring-2 ring-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {totalResolved}
                </span>
                <span className="text-xs font-semibold text-slate-500">งาน</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                ปิดงานสมบูรณ์เรียบร้อยในระบบ
              </p>
            </div>

            {/* Card 2: SLA Response Target */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-indigo-500" />
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-tight leading-snug">
                  เป้าหมาย SLA การตอบสนอง
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-100">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  ~15
                </span>
                <span className="text-xs font-semibold text-slate-500">นาที</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                เกณฑ์ตอบสนองมาตรฐาน
              </p>
            </div>

            {/* Card 3: In Progress */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-tight leading-snug">
                  กำลังดำเนินการซ่อมแซม
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-amber-50 text-amber-600 ring-2 ring-amber-100">
                  <Wrench className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {totalInProgress}
                </span>
                <span className="text-xs font-semibold text-slate-500">งาน</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                ช่างกำลังตรวจซ่อมหน้างาน
              </p>
            </div>

            {/* Card 4: Technicians On-Duty */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-teal-500" />
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-tight leading-snug">
                  ทีมช่างพร้อมปฏิบัติการ
                </span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 bg-teal-50 text-teal-600 ring-2 ring-teal-100">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {activeTechnicians}
                </span>
                <span className="text-xs font-semibold text-slate-500">นาย</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                เวรช่างประจำแผนก
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Service Categories */}
      <section className="py-16 bg-white/70 backdrop-blur-sm border-t border-slate-200/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-1.5 mb-10">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider font-mono">
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
                  className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200/60 mb-4 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-medium text-emerald-800 flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      <span className="font-mono text-[11px] font-semibold">{cat.count}</span>
                    </span>
                    <Link
                      href="/report"
                      className="font-semibold text-slate-700 hover:text-emerald-700 flex items-center space-x-1 transition-colors"
                    >
                      <span>แจ้งปัญหานี้</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Quick Contact Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-950 text-rose-300 border border-rose-800 mb-4 shadow-sm">
                  <Flame className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">
                  พบเหตุฉุกเฉินที่มีความเสี่ยงทันที
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  เช่น เพลิงไหม้ ไฟฟ้ารั่วรุนแรง หรือน้ำท่วมห้องเซิร์ฟเวอร์
                  โปรดเปิดสวิตช์ความเร่งด่วนในฟอร์ม หรือโทรแจ้งศูนย์เวรปฏิบัติการทันที
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800 flex items-center justify-between">
                <span className="font-mono text-xs text-rose-300 font-semibold tracking-wider">
                  02-555-1200 ต่อ 248
                </span>
                <Link
                  href="/report"
                  className="rounded-xl bg-white text-slate-900 px-4 py-2 text-xs font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  แจ้งด่วนพิเศษ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 3-Step Simple Process */}
      <section className="py-16 bg-slate-50/50 border-t border-slate-200/80">
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
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 font-mono">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                ถ่ายรูปและล็อกพิกัดห้อง
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                เลือกหมวดหมู่อาการ แนบภาพถ่าย และระบบจะดึงพิกัดอาคารสถานที่อัตโนมัติ
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 font-mono">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                คัดกรองและมอบหมายช่าง
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                ระบบจัดคิวงานตามความเร่งด่วน มอบหมายช่างผู้เชี่ยวชาญพร้อมระบุเวลาถึงหน้างาน
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all space-y-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 font-mono">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                ตรวจรับงานและประเมินบริการ
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                ตรวจสอบภาพถ่ายหลักฐานหลังการซ่อมเสร็จ และส่งมอบผลประเมินผ่านระบบ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-6 pb-24 md:pb-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-800 text-white text-xs font-semibold">
              C
            </div>
            <span className="font-semibold text-slate-900">CampusOps</span>
            <span>• แผนกเทคโนโลยีคอมพิวเตอร์</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/report" className="hover:text-emerald-800 transition-colors">
              แจ้งซ่อม
            </Link>
            <Link href="/login" className="hover:text-emerald-800 transition-colors">
              เข้าสู่ระบบ
            </Link>
            <Link href="/tracking/REP-089" className="hover:text-emerald-800 transition-colors">
              ติดตามงาน
            </Link>
          </div>
        </div>
      </footer>

      {/* 8. Mobile Bottom Navigation */}
      <MobileBottomNav currentUser={sessionUser} />
    </div>
  );
}
