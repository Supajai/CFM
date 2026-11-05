// components/portal/QuickTrackSearch.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";

export default function QuickTrackSearch() {
  const router = useRouter();
  const [ticketId, setTicketId] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    const clean = ticketId.trim().replace("#", "");
    router.push(`/tracking/${clean}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/50 p-1.5 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-200">
        <span className="pl-3.5 pr-2 text-slate-400 shrink-0">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          placeholder="ค้นหาด้วยรหัสตั๋ว เช่น #REP-261022-35AC..."
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2 px-1 font-medium"
        />
        <button
          type="submit"
          className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>ติดตามงาน</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}

