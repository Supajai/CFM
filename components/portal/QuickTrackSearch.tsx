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
      <div className="relative flex items-center rounded-2xl border border-slate-200/90 bg-white/95 p-1.5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] backdrop-blur-md transition-all focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/15">
        <div className="flex items-center pl-3 pr-2 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={ticketId}
          onChange={(e) => setTicketId(e.target.value)}
          placeholder="กรอกรหัสตั๋ว เช่น #REP-089 เพื่อติดตามความคืบหน้า..."
          className="w-full bg-transparent py-1.5 text-xs sm:text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-4 py-2 text-xs font-medium text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition active:scale-[0.98]"
        >
          <span>ติดตามงาน</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
