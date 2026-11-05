// app/tracking/[id]/page.tsx
import { getTicketByIdOrNumberAction } from "@/actions/ticket";
import TrackingView from "@/components/tracking/TrackingView";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Search, Sparkles } from "lucide-react";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const rawId = decodeURIComponent(params?.id || "");
    const cleanId = rawId.startsWith("#") ? rawId : `#${rawId}`;
    return {
      title: `ติดตามสถานะการแจ้งซ่อม ${cleanId} | CampusOps`,
      description: `ตรวจสอบความคืบหน้าการซ่อมบำรุงและตำแหน่งช่างสำหรับตั๋ว ${cleanId}`,
    };
  } catch {
    return {
      title: "ติดตามการแจ้งซ่อม | CampusOps",
    };
  }
}

export default async function TrackingPage({ params }: PageProps) {
  try {
    const rawId = decodeURIComponent(params?.id || "");
    const [res, session] = await Promise.all([
      getTicketByIdOrNumberAction(rawId),
      getSession(),
    ]);

  if (!res.success || !res.ticket) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md card-elevated p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/90 shadow-sm">
            <AlertCircle className="h-6 w-6 stroke-[1.75]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              ไม่พบข้อมูลใบงาน <span className="chip-tech text-rose-700 bg-rose-50 border-rose-200 font-mono">#{params.id}</span>
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              รหัสตั๋วอาจไม่ถูกต้อง หรือใบงานยังไม่ได้ถูกบันทึกในระบบของอาคารแผนก
            </p>
          </div>

          <div className="pt-4 flex flex-col space-y-2.5">
            <Link
              href="/tracking/REP-089"
              className="btn-primary-gradient py-2.5 text-xs font-semibold"
            >
              ดูตั๋วตัวอย่าง #REP-089
            </Link>
            <Link
              href={session?.role === "USER" ? "/student/dashboard" : session?.role === "TECHNICIAN" ? "/technician/kanban" : session?.role === "ADMIN" ? "/admin/dashboard" : "/"}
              className="flex items-center justify-center space-x-2 rounded-xl border border-slate-200/90 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 stroke-[1.75]" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-0 sm:py-6">
      <TrackingView ticket={res.ticket} currentUser={session} />
    </main>
  );
  } catch (error: any) {
    console.error("TrackingPage error:", error);
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md card-elevated p-8 text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/90 shadow-sm">
            <AlertCircle className="h-6 w-6 stroke-[1.75]" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
          <p className="text-xs text-slate-500">{error?.message || "ไม่สามารถแสดงผลตั๋วได้ในขณะนี้"}</p>
        </div>
      </main>
    );
  }
}

