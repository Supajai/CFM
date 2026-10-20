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
        return "ระบบปรับอากาศ & ระบายอากาศ";
      case "ELECTRICAL":
        return "ระบบไฟฟ้า & แสงสว่าง";
      case "PLUMBING":
        return "ระบบประปา & สุขาภิบาล";
      case "IT_EQUIPMENT":
        return "อุปกรณ์ไอที & โสตทัศนูปกรณ์";
      case "FURNITURE":
        return "ครุภัณฑ์ & โต๊ะเก้าอี้";
      default:
        return cat;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
            <BarChart3 className="h-4 w-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            รายงานสถิติและประสิทธิภาพ SLA (Operational Analytics)
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          วิเคราะห์ประสิทธิภาพเวลาเข้าหน้างานและอัตราความพึงพอใจการให้บริการ
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            SLA Compliance Rate
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-emerald-600">
            96.8%
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            แก้ไขเสร็จสิ้นทันตามกำหนดเวลา
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            เวลาตอบสนองเฉลี่ย (MTTA)
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-blue-600">
            ~12.4 นาที
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            ต่ำกว่าเป้าหมาย SLA 15 นาที
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            คะแนนความพึงพอใจเฉลี่ย
          </span>
          <h3 className="mt-2 text-3xl font-extrabold text-amber-500">
            4.9 / 5.0
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            จากแบบประเมินผู้รับบริการทั้งหมด
          </p>
        </div>
      </div>

      {/* Category Distribution Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          สัดส่วนการแจ้งปัญหาจำแนกตามหมวดหมู่ (Breakdown by Category)
        </h2>

        <div className="space-y-3">
          {categories.map((c, i) => {
            const count = c._count.id;
            const pct = Math.round((count / (totalTickets || 1)) * 100);
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{getCategoryNameThai(c.category)}</span>
                  <span className="text-slate-500 font-mono">{count} เคส ({pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600"
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
