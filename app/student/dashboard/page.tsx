// app/student/dashboard/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import MainNavbar from "@/components/navigation/MainNavbar";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import {
  GraduationCap,
  Plus,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Paperclip,
  Activity,
  User,
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "แดชบอร์ดนักศึกษา / ประวัติการแจ้งซ่อม | CampusOps",
  description: "จัดการและติดตามประวัติการแจ้งซ่อมบำรุงของนักศึกษาและบุคลากร",
};

export default async function StudentDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/student/dashboard");
  }

  // ดึงข้อมูลโปรไฟล์นักศึกษา
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    redirect("/login");
  }

  // ดึงเฉพาะตั๋วที่นักศึกษาคนนี้เป็นผู้แจ้ง (หรือค้นหาตามชื่อ/อีเมลเพื่อความยืดหยุ่น)
  const myTickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { reporterId: user.id },
        { reporter: { email: user.email } },
        { reporter: { name: user.name } },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      attachments: true,
      technician: true,
    },
  });

  // คำนวณ KPI Mini Cards
  const totalCount = myTickets.length;
  const pendingCount = myTickets.filter(
    (t) => t.status === "PENDING" || t.status === "ASSIGNED"
  ).length;
  const inProgressCount = myTickets.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const resolvedCount = myTickets.filter(
    (t) => t.status === "RESOLVED" || t.status === "CLOSED"
  ).length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
            <span>รอตรวจสอบ</span>
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>มอบหมายช่างแล้ว</span>
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span>กำลังดำเนินการซ่อม</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            <span>ซ่อมเสร็จ / รอตรวจรับ</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>ปิดงานสมบูรณ์</span>
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] text-slate-600">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <MainNavbar currentUser={session} />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
        {/* 1. Header: Student Profile Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-md">
              {user.name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-100">
                  นักศึกษา / บุคลากร
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {user.studentId ? `รหัสประจำตัว: ${user.studentId}` : user.email}{" "}
                • {user.department || "คณะเทคโนโลยีและวิศวกรรม"}
              </p>
              {user.phone && (
                <p className="text-[11px] text-slate-400 font-mono">
                  เบอร์โทรติดต่อ: {user.phone}
                </p>
              )}
            </div>
          </div>

          <Link
            href="/report"
            className="flex items-center justify-center space-x-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>แจ้งปัญหา / ส่งคำร้องซ่อมใหม่</span>
          </Link>
        </div>

        {/* 2. KPI Mini Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                งานของฉันทั้งหมด
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-900">
                {totalCount}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Activity className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                รอดำเนินการ
              </p>
              <h3 className="mt-1 text-2xl font-bold text-amber-600">
                {pendingCount}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                กำลังดำเนินการซ่อม
              </p>
              <h3 className="mt-1 text-2xl font-bold text-blue-600">
                {inProgressCount}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Wrench className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                ซ่อมเสร็จสิ้น / ปิดงาน
              </p>
              <h3 className="mt-1 text-2xl font-bold text-emerald-600">
                {resolvedCount}
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 3. My Ticket History Table */}
        <div id="history" className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden scroll-mt-6">
          <div className="border-b border-slate-100 p-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                ประวัติการแจ้งซ่อมของฉัน (My Service Tickets)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                คลิกที่รายการใบงานเพื่อเปิดหน้าติดตามสถานะแบบเรียลไทม์
              </p>
            </div>

            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 font-mono">
              ทั้งหมด {totalCount} รายการ
            </span>
          </div>

          {myTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">รหัสตั๋ว</th>
                    <th className="px-4 py-3.5">หัวข้อ / อาการชำรุด</th>
                    <th className="px-4 py-3.5">สถานที่เกิดเหตุ</th>
                    <th className="px-4 py-3.5">สถานะงาน</th>
                    <th className="px-4 py-3.5">ช่างผู้รับผิดชอบ</th>
                    <th className="px-6 py-3.5 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myTickets.map((t) => {
                    const cleanNumber = t.ticketNumber.replace("#", "");
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/80 transition group"
                      >
                        {/* 1. Ticket Number */}
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {t.ticketNumber}
                          </span>
                          {t.isUrgent && (
                            <span className="block mt-1 text-[10px] text-rose-600 font-bold">
                              • เร่งด่วนวิกฤต
                            </span>
                          )}
                        </td>

                        {/* 2. Issue Title */}
                        <td className="px-4 py-4 max-w-xs">
                          <p className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                            {t.title}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {t.description}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{timeAgoThai(t.createdAt)}</span>
                          </span>
                        </td>

                        {/* 3. Location */}
                        <td className="px-4 py-4">
                          <div className="flex items-start space-x-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-slate-800">
                                {t.room}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                {t.building}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 4. Status Badge */}
                        <td className="px-4 py-4">{getStatusBadge(t.status)}</td>

                        {/* 5. Technician */}
                        <td className="px-4 py-4">
                          {t.technician ? (
                            <div className="flex items-center space-x-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                                {t.technician.name.charAt(0)}
                              </div>
                              <span className="font-medium text-slate-800 truncate">
                                {t.technician.name.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">
                              รอมอบหมาย
                            </span>
                          )}
                        </td>

                        {/* 6. Action Button */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/tracking/${cleanNumber}`}
                            className="inline-flex items-center space-x-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
                          >
                            <span>ติดตามงาน</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Wrench className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">
                  คุณยังไม่มีประวัติการส่งคำร้องแจ้งซ่อม
                </h3>
                <p className="text-xs text-slate-400">
                  เมื่อคุณแจ้งปัญหาในสถานศึกษา รายการคำร้องจะปรากฏที่นี่เพื่อติดตามสถานะ
                </p>
              </div>
              <Link
                href="/report"
                className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                <span>ส่งคำร้องแจ้งซ่อมแรกของคุณ</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* 4. Mobile Bottom Navigation Shell */}
      <MobileBottomNav currentUser={session} />
    </div>
  );
}
