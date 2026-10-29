// components/admin/BuildingFilterDropdown.tsx
"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Building2, Filter } from "lucide-react";

interface BuildingFilterDropdownProps {
  currentBuildingId: string;
  buildings: Array<{ id: string; code: string; name: string }>;
}

export default function BuildingFilterDropdown({
  currentBuildingId,
  buildings,
}: BuildingFilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val === "ALL" || !val) {
      params.delete("buildingId");
    } else {
      params.set("buildingId", val);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <select
          value={currentBuildingId}
          onChange={handleSelect}
          className="appearance-none rounded-xl border border-slate-200/90 bg-white/95 backdrop-blur-md py-2 pl-9 pr-9 text-xs font-semibold text-slate-800 shadow-xs hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
        >
          <option value="ALL">อาคารทั้งหมด (All Buildings)</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              [{b.code}] {b.name}
            </option>
          ))}
        </select>
        <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
        <Filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
      </div>
    </div>
  );
}

