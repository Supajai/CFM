// app/super-admin/dashboard/page.tsx
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Crown,
  Shield,
  Users,
  Database,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
  Sliders,
  History,
  Activity,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ศูนย์ควบคุมระบบและความปลอดภัย (Super Admin) | CampusOps",
  description: "ศูนย์ควบคุมระบบ สถานะฐานข้อมูล และการกำกับดูแลสิทธิ์ผู้ใช้งาน",
};

export default async function SuperAdminDashboardPage() {
  const [
    totalUsers,
    superAdminCount,
    adminCount,
    technicianCount,
    studentCount,
    totalTickets,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "TECHNICIAN" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.ticket.count(),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Crown className="h-4 w-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              ศูนย์ควบคุมความปลอดภัยและระบบ (System & Governance Hub)
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            บริหารจัดการสถาปัตยกรรมระบบ สิทธิ์ผู้ใช้ 4 ระดับ และการเชื่อมต่อฐานข้อมูลส่วนกลาง
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link
            href="/super-admin/users"
            className="flex items-center space-x-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition active:scale-95"
          >
            <Shield className="h-4 w-4 text-purple-400" />
            <span>จัดการสิทธิ์ผู้ใช้งาน (RBAC)</span>
          </Link>
        </div>
      </div>

      {/* 2. System Infrastructure Health Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Server className="h-5 w-5 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">
              สถานะโครงสร้างพื้นฐานระบบ (System Infrastructure Health)
            </h2>
          </div>
          <span className="flex items-center space-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>All Systems Operational</span>
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
              <Database className="h-4 w-4 text-blue-600" />
              <span>ฐานข้อมูลหลัก</span>
            </div>
            <p className="text-sm font-bold text-slate-900">PostgreSQL 17</p>
            <p className="text-[10px] text-emerald-600 font-medium">● Localhost :5432 (Active)</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
              <Cpu className="h-4 w-4 text-purple-600" />
              <span>เว็บเฟรมเวิร์ก</span>
            </div>
            <p className="text-sm font-bold text-slate-900">Next.js 14</p>
            <p className="text-[10px] text-slate-500">App Router & Server Actions</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
              <Lock className="h-4 w-4 text-amber-600" />
              <span>ความปลอดภัย</span>
            </div>
            <p className="text-sm font-bold text-slate-900">JWT + Bcrypt</p>
            <p className="text-[10px] text-slate-500">HTTP-Only Edge Cookie</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-semibold">
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>ORM & Database Schema</span>
            </div>
            <p className="text-sm font-bold text-slate-900">Prisma ORM 5.x</p>
            <p className="text-[10px] text-slate-500">Total {totalTickets} tickets synced</p>
          </div>
        </div>
      </div>

      {/* 3. User Role Distribution */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            สัดส่วนผู้ใช้งานจำแนกตาม 4 บทบาท (Role-Based Distribution)
          </h2>
          <span className="text-xs font-bold text-slate-500 font-mono">
            สมาชิกรวม {totalUsers} บัญชี
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-purple-800">
              <span>Super Admin (IT)</span>
              <Crown className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-purple-900">{superAdminCount}</h3>
            <p className="text-[11px] text-purple-700">สิทธิ์สูงสุด จัดการระบบ & สิทธิ์</p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-800">
              <span>Admin (หัวหน้างานอาคาร)</span>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-blue-900">{adminCount}</h3>
            <p className="text-[11px] text-blue-700">คัดกรอง จ่ายงาน และดูสถิติ SLA</p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-800">
              <span>Technician (ช่างเทคนิค)</span>
              <Activity className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-amber-900">{technicianCount}</h3>
            <p className="text-[11px] text-amber-700">ปฏิบัติงานภาคสนาม & คันบัน</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
              <span>User (นักศึกษา/บุคลากร)</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="text-3xl font-extrabold text-emerald-900">{studentCount}</h3>
            <p className="text-[11px] text-emerald-700">แจ้งซ่อมและติดตามประวัติตัวเอง</p>
          </div>
        </div>
      </div>

      {/* 4. Quick Governance Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/super-admin/users"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <Shield className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition">
            จัดการผู้ใช้และปรับสิทธิ์ (RBAC Table)
          </h3>
          <p className="text-xs text-slate-500">
            ปรับเปลี่ยนระดับสิทธิ์ของบุคลากรรายบุคคลแบบเรียลไทม์
          </p>
        </Link>

        <Link
          href="/super-admin/settings"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Sliders className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
            ตั้งค่าอาคารและหมวดหมู่ (Master Data)
          </h3>
          <p className="text-xs text-slate-500">
            จัดการรายชื่ออาคารในวิทยาเขต และเป้าหมาย SLA การตอบสนอง
          </p>
        </Link>

        <Link
          href="/super-admin/audit"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition group space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
              <History className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 transition" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">
            บันทึกประวัติความปลอดภัย (System Audit)
          </h3>
          <p className="text-xs text-slate-500">
            ตรวจสอบประวัติการเปลี่ยนสถานะตั๋ว และการยืนยันตัวตน
          </p>
        </Link>
      </div>
    </div>
  );
}
