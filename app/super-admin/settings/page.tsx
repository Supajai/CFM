// app/super-admin/settings/page.tsx
import { Sliders } from "lucide-react";
import { Metadata } from "next";
import { getBuildingsAction, getBuildingAdminsAction } from "@/actions/building";
import BuildingManagementSection from "@/components/admin/BuildingManagementSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ตั้งค่าระบบและข้อมูลกายภาพ (Master Data) | Super Admin",
  description: "จัดการข้อมูลอาคาร หมวดหมู่งานซ่อม และเกณฑ์เวลา SLA",
};

export default async function SuperAdminSettingsPage() {
  const [buildingsRes, adminsRes] = await Promise.all([
    getBuildingsAction(),
    getBuildingAdminsAction(),
  ]);

  const buildings = buildingsRes.success && buildingsRes.buildings ? buildingsRes.buildings : [];
  const admins = adminsRes.success && adminsRes.admins ? adminsRes.admins : [];

  const serviceCategories = [
    { name: "ระบบปรับอากาศและการระบายอากาศ", code: "AIR_CONDITIONING", defaultSLA: "15 นาที (ด่วน) / 120 นาที (ปกติ)" },
    { name: "ระบบไฟฟ้าและแสงสว่าง", code: "ELECTRICAL", defaultSLA: "15 นาที (ด่วน) / 120 นาที (ปกติ)" },
    { name: "ระบบประปาและสุขาภิบาล", code: "PLUMBING", defaultSLA: "30 นาที (ด่วน) / 180 นาที (ปกติ)" },
    { name: "โสตทัศนูปกรณ์และไอที", code: "IT_EQUIPMENT", defaultSLA: "15 นาที (ด่วน) / 60 นาที (ปกติ)" },
    { name: "ครุภัณฑ์และโครงสร้างกายภาพ", code: "FURNITURE", defaultSLA: "1 วันทำการ" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-200">
            <Sliders className="h-4 w-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            ตั้งค่าระบบและข้อมูลกายภาพ (Master Data & Campus Config)
          </h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          กำหนดฐานข้อมูลอาคารสถานที่ ผู้รับผิดชอบดูแลอาคาร หมวดหมู่อาการชำรุด และเป้าหมาย SLA การตอบสนอง
        </p>
      </div>

      {/* Buildings Master Data with CRUD & Admin Assignment */}
      <BuildingManagementSection initialBuildings={buildings} admins={admins} />

      {/* Categories & SLA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              หมวดหมู่งานซ่อมและเป้าหมายเวลา SLA (Service Categories & SLA)
            </h2>
            <p className="text-xs text-slate-400">
              เกณฑ์เวลา SLA มาตรฐานสำหรับการประเมิน KPI การปฏิบัติงานของทีมช่าง
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {serviceCategories.map((c, i) => (
            <div key={i} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900">{c.name}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{c.code}</p>
              </div>
              <span className="rounded-xl bg-emerald-50 px-3 py-1 font-semibold text-emerald-800 border border-emerald-200">
                SLA: {c.defaultSLA}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

