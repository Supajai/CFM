// components/admin/DepartmentTicketFilter.tsx
"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X } from "lucide-react";
import { getAllDepartmentRooms } from "@/lib/constants/department-locations";
import { REPAIR_CATEGORIES } from "@/lib/constants/campus-master-data";

export default function DepartmentTicketFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentFloor = searchParams.get("floor") || "ALL";
  const currentRoom = searchParams.get("room") || "ALL";
  const currentCategory = searchParams.get("category") || "ALL";

  const allRooms = getAllDepartmentRooms();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key === "floor" && value !== "ALL") {
      const floorNum = parseInt(value, 10);
      const floorRooms = allRooms.filter((r) => r.floor === floorNum);
      const isRoomInFloor = floorRooms.some((r) => r.name === currentRoom || r.id === currentRoom);
      if (!isRoomInFloor) {
        params.delete("room");
      }
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("floor");
    params.delete("room");
    params.delete("category");
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = currentFloor !== "ALL" || currentRoom !== "ALL" || currentCategory !== "ALL";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-800 text-white shadow-sm">
            <Filter className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight">
              ตัวกรองข้อมูลประจำอาคารแผนก
            </h3>
            <p className="text-[11px] text-slate-500">
              กรองคัดแยกตามชั้น ห้องแล็บ และหมวดหมู่งานซ่อมบำรุง
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-rose-600 transition shadow-sm"
          >
            <X className="h-3.5 w-3.5" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* 1. กรองตามชั้น (Floor) */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700">
            ระดับชั้น
          </label>
          <div className="relative">
            <select
              value={currentFloor}
              onChange={(e) => handleFilterChange("floor", e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-normal text-slate-900 shadow-sm transition focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="ALL">ทุกชั้น (ชั้น 1 - 4)</option>
              {[1, 2, 3, 4].map((f) => (
                <option key={f} value={f}>
                  ชั้น {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. กรองตามห้องแล็บ/พื้นที่ (Room) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            ห้องปฏิบัติการ / พื้นที่
          </label>
          <div className="relative">
            <select
              value={currentRoom}
              onChange={(e) => handleFilterChange("room", e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-normal text-slate-900 shadow-sm transition focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 truncate"
            >
              <option value="ALL">ทุกห้อง / ทุกพื้นที่</option>
              {allRooms
                .filter((r) => currentFloor === "ALL" || r.floor === parseInt(currentFloor, 10))
                .map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* 3. กรองตามหมวดหมู่งานซ่อม (Category) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            หมวดหมู่งานซ่อม
          </label>
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-normal text-slate-900 shadow-sm transition focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="ALL">ทุกหมวดหมู่ (7 หมวด)</option>
              {REPAIR_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
