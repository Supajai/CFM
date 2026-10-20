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
    <form onSubmit={handleSearch} className="w-full max-w-xl">
      <div className="relative flex items-center rounded-2xl border-2 border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/50 transition focus-within:border-slate-800">
        <div className="flex items-center pl-3 pr-2 text-slate-400">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          placeholder="กรอกรหัสตั๋ว เช่น #REP-089 เพื่อติดตามความคืบหน้า..."
          className="w-full bg-transparent py-2.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow transition hover:bg-slate-800 active:scale-95"
        >
          <span>ติดตามงาน</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
