// app/report/page.tsx - Issue Reporting Page
import { Suspense } from "react";
import ReportForm from "@/components/report/ReportForm";
import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "แจ้งซ่อมประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ | CampusOps",
  description: "ส่งคำร้องแจ้งซ่อมและรายงานปัญหาภายในอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์อย่างรวดเร็ว",
};

export default async function ReportPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/report");
  }

  return (
    <main className="min-h-screen bg-transparent py-0 sm:py-6">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        }
      >
        <ReportForm currentUser={session} />
      </Suspense>
    </main>
  );
}
