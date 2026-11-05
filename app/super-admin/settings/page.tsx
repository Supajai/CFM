// app/super-admin/settings/page.tsx
import { Sliders, DoorClosed, Layers, Building } from "lucide-react";
import { Metadata } from "next";
import { getDepartmentRoomsAction } from "@/actions/room";
import RoomManagementSection from "@/components/admin/RoomManagementSection";
import { REPAIR_CATEGORIES } from "@/lib/constants/campus-master-data";
import { DEPARTMENT_BUILDING_NAME, TOTAL_FLOORS } from "@/lib/constants/department-locations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "จัดการห้องและพื้นที่ภายในแผนก (Rooms & Facilities) | Super Admin",
  description: "จัดการข้อมูลห้องและพื้นที่ภายในอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ และเกณฑ์เวลา SLA",
};

export default async function SuperAdminSettingsPage() {
  const roomsRes = await getDepartmentRoomsAction();
  const rooms = roomsRes.success && roomsRes.rooms ? roomsRes.rooms : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(16,185,129,0.35)]">
            <Sliders className="h-5 w-5 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              การจัดการห้องและพื้นที่ภายในแผนก (Rooms & Facilities Management)
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              กำหนดฐานข้อมูลห้องปฏิบัติการ พื้นที่ใช้งานประจำชั้น 1-4 ของ {DEPARTMENT_BUILDING_NAME}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Rooms & Facilities Management Section (Floor 1-4 CRUD) */}
      <RoomManagementSection initialRooms={rooms} />

      {/* 2. 7 Main Repair Categories & SLA Targets */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              หมวดหมู่งานซ่อมบำรุง 7 หมวดหมู่หลัก และเป้าหมายเวลา SLA
            </h2>
            <p className="text-xs text-slate-500">
              เกณฑ์เวลา SLA ตอบสนองงานซ่อมประจำอาคารแผนกเทคโนโลยีคอมพิวเตอร์
            </p>
          </div>
          <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200/80 text-slate-800 px-3 py-1 rounded-xl shadow-2xs">
            7 หมวดหมู่หลัก
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {REPAIR_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors">
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cat.colorClass.bg} ${cat.colorClass.text} border ${cat.colorClass.border} shadow-2xs`}
                  >
                    <Icon className="h-4.5 w-4.5 stroke-[1.75]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{cat.label}</p>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      <span className="font-semibold text-slate-700">{cat.id}</span> • {cat.enLabel}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-xs font-semibold rounded-xl bg-rose-50 px-2.5 py-1 text-rose-700 border border-rose-200 shadow-2xs">
                    ด่วน: {cat.slaUrgentMinutes} นาที
                  </span>
                  <span className="font-mono text-xs font-medium rounded-xl bg-slate-100 px-2.5 py-1 text-slate-700 border border-slate-200/80">
                    ปกติ: {cat.slaNormalMinutes >= 60 ? `${cat.slaNormalMinutes / 60} ชม.` : `${cat.slaNormalMinutes} นาที`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
