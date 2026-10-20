// app/report/page.tsx - Issue Reporting Page
import ReportForm from "@/components/report/ReportForm";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "แจ้งซ่อม / รายงานปัญหาในสถานศึกษา | CampusOps",
  description: "ส่งคำร้องแจ้งซ่อมและรายงานปัญหาอาคารสถานที่อย่างรวดเร็ว",
};

export default async function ReportPage() {
  // Double Guard: ตรวจสอบ Server Session ซ้ำระดับ Page Component
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/report");
  }

  return (
    <main className="min-h-screen bg-slate-100/60 py-0 sm:py-6">
      <ReportForm currentUser={session} />
    </main>
  );
}
