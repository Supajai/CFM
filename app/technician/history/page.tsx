// app/technician/history/page.tsx
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Star,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";
import { formatDateThai, timeAgoThai } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ประวัติงานที่ซ่อมเสร็จสิ้น (Resolved History) | CampusOps",
  description: "ประวัติผลงานการซ่อมแซมและคะแนนความพึงพอใจจากผู้แจ้ง",
};

export default async function TechnicianHistoryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/technician/history");
  }

  // ดึงรายการงานที่ซ่อมเสร็จแล้ว (RESOLVED หรือ CLOSED)
  const resolvedTickets = await prisma.ticket.findMany({
    where: {
      status: { in: ["RESOLVED", "CLOSED"] },
    },
    orderBy: { resolvedAt: "desc" },
    include: {
      reporter: true,
      attachments: true,
      technician: true,
    },
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            ประวัติงานที่ซ่อมเสร็จสิ้น (Resolved Work History)
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          บันทึกผลงานการซ่อมบำรุง หลักฐานหลังซ่อมเสร็จ และการตรวจรับงานจากผู้แจ้ง
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            ผลงานการแก้ไขปัญหาทั้งหมด
          </h2>
          <span className="rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs font-bold text-slate-600">
            เสร็จสิ้น {resolvedTickets.length} เคส
          </span>
        </div>

        {resolvedTickets.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {resolvedTickets.map((t) => {
              const cleanNumber = t.ticketNumber.replace("#", "");
              const afterAtt = t.attachments.find((a) => a.type === "AFTER");

              return (
                <div
                  key={t.id}
                  className="p-5 hover:bg-slate-50/70 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="flex items-start space-x-4">
                    {/* After Image or Placeholder */}
                    <div className="relative h-16 w-20 shrink-0 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                      {afterAtt ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={afterAtt.url}
                          alt="After repair"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {t.ticketNumber}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          {t.status === "CLOSED" ? "ปิดงานสมบูรณ์" : "ซ่อมเสร็จแล้ว"}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">
                        {t.title}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {t.stepNote || "แก้ไขปัญหาเรียบร้อยแล้ว"}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{t.room} ({t.building})</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateThai(t.resolvedAt || t.updatedAt)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating / Review or Action */}
                  <div className="flex items-center space-x-3 self-end md:self-center">
                    {t.rating ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-3 py-2 text-right">
                        <div className="flex items-center space-x-1 text-amber-500 justify-end">
                          {[...Array(t.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-[10px] text-amber-700 mt-0.5">
                          ความพึงพอใจ: {t.rating}/5 ดาว
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        รอผู้แจ้งให้คะแนน
                      </span>
                    )}

                    <Link
                      href={`/tracking/${cleanNumber}`}
                      className="flex items-center space-x-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800 transition"
                    >
                      <span>ดูรายละเอียด</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            ยังไม่มีรายการงานที่บันทึกซ่อมเสร็จสิ้น
          </div>
        )}
      </div>
    </div>
  );
}
