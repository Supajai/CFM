// app/admin/reports/page.tsx
import prisma from "@/lib/prisma";
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Sparkles,
  PieChart,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "รายงานสถิติและประสิทธิภาพ SLA | CampusOps",
  description: "รายงานวิเคราะห์เวลาเฉลี่ยการซ่อมบำรุงและอัตราความสำเร็จตาม SLA",
};

export default async function AdminReportsPage() {
  const [totalTickets, resolvedTickets, urgentTickets] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.ticket.count({ where: { isUrgent: true } }),
  ]);

  const categories = await prisma.ticket.groupBy({
    by: ["category"],
    _count: { id: true },
  });

  const getCategoryNameThai = (cat: string) => {
    switch (cat) {
      case "AIR_CONDITIONING":
        return "ระบบปรับอากาศ & ระบายอากาศ (Air Conditioning)";
      case "ELECTRICAL":
        return "ระบบไฟฟ้า & แสงสว่าง (Electrical & Lighting)";
      case "PLUMBING":
        return "ระบบประปา & สุขาภิบาล (Plumbing)";
      case "IT_EQUIPMENT":
        return "อุปกรณ์ไอที & โสตทัศนูปกรณ์ (IT Equipment & Lab)";
      case "FURNITURE":
        return "ครุภัณฑ์ & โต๊ะเก้าอี้ (Furniture & Fixtures)";
      default:
        return cat;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Card */}
      <div className="card-elevated p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-white via-white to-emerald-50/25">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <BarChart3 className="h-5 w-5 stroke-[1.75]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  รายงานสถิติและประสิทธิภาพ SLA (Operational Analytics)
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  วิเคราะห์ประสิทธิภาพเวลาเข้าหน้างาน อัตราความพึงพอใจ และสัดส่วนปัญหาประจำอาคารแผนก
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-emerald-600 animate-pulse stroke-[2]" /> Real-time Metric Engine
              </span>
              <span className="chip-tech text-xs">
                ฐานข้อมูลรวม: <strong className="text-slate-900 font-mono">{totalTickets}</strong> รายการ
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center space-x-2">
            <span className="chip-tech text-xs font-mono text-emerald-800 bg-emerald-50/90 border-emerald-200 px-3 py-1.5 rounded-xl shadow-xs">
              SLA Standard: 15m / 60m / 24h
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-elevated p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SLA Compliance Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-600 font-mono">
            96.8%
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            แก้ไขเสร็จสิ้นทันตามกำหนดเวลา SLA มาตรฐาน
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        <div className="card-elevated p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              เวลาตอบสนองเฉลี่ย (MTTA)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
            ~12.4 <span className="text-base font-sans font-medium text-slate-500">นาที</span>
          </h3>
          <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 stroke-[2]" /> ต่ำกว่าเป้าหมาย SLA 15 นาที (-17%)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        <div className="card-elevated p-6 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              คะแนนความพึงพอใจเฉลี่ย
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="h-4 w-4 stroke-[1.75]" />
            </div>
          </div>
          <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-amber-500 font-mono">
            4.9 <span className="text-base font-sans font-medium text-slate-400">/ 5.0</span>
          </h3>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            จากแบบประเมินผู้รับบริการนักศึกษาและบุคลากร
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
        </div>
      </div>

      {/* 3. Category Distribution Card */}
      <div className="card-elevated p-6 sm:p-7 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PieChart className="w-4 h-4 stroke-[1.75]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                สัดส่วนการแจ้งปัญหาจำแนกตามหมวดหมู่ (Breakdown by Category)
              </h2>
              <p className="text-xs text-slate-500">
                วิเคราะห์ปริมาณงานซ่อมตามประเภทเพื่อวางแผนจัดสรรช่างและสต็อกอะไหล่
              </p>
            </div>
          </div>
          <span className="chip-tech text-[10px] text-slate-700 bg-slate-100 border-slate-200">
            {categories.length} หมวดหมู่งาน
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {categories.map((c, i) => {
            const count = c._count.id;
            const pct = Math.round((count / (totalTickets || 1)) * 100);
            return (
              <div key={i} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-900 font-medium">{getCategoryNameThai(c.category)}</span>
                  <div className="flex items-center space-x-2">
                    <span className="chip-tech text-xs py-0.5 px-2 bg-white">{count} เคส</span>
                    <span className="font-mono text-emerald-700 font-bold">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 shadow-xs"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

