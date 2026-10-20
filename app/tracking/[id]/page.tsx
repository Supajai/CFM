// app/tracking/[id]/page.tsx
import { getTicketByIdOrNumberAction } from "@/actions/ticket";
import TrackingView from "@/components/tracking/TrackingView";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const cleanId = params.id.startsWith("#") ? params.id : `#${params.id}`;
  return {
    title: `ติดตามสถานะการแจ้งซ่อม ${cleanId} | CampusOps`,
    description: `ตรวจสอบความคืบหน้าการซ่อมบำรุงและตำแหน่งช่างสำหรับตั๋ว ${cleanId}`,
  };
}

export default async function TrackingPage({ params }: PageProps) {
  const [res, session] = await Promise.all([
    getTicketByIdOrNumberAction(params.id),
    getSession(),
  ]);

  if (!res.success || !res.ticket) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            ไม่พบข้อมูลใบงาน #{params.id}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            รหัสตั๋วอาจไม่ถูกต้อง หรือใบงานยังไม่ได้ถูกบันทึกในระบบ
          </p>

          <div className="mt-6 flex flex-col space-y-2">
            <Link
              href="/tracking/REP-089"
              className="rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
            >
              ดูตั๋วตัวอย่าง #REP-089
            </Link>
            <Link
              href={session?.role === "USER" ? "/student/dashboard" : session?.role === "TECHNICIAN" ? "/technician/kanban" : session?.role === "ADMIN" ? "/admin/dashboard" : "/"}
              className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100/60 py-0 sm:py-6">
      <TrackingView ticket={res.ticket} currentUser={session} />
    </main>
  );
}
