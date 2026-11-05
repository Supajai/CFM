// components/kanban/KanbanBoard.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  AlertTriangle,
  Flame,
  Plus,
  SlidersHorizontal,
  Layers,
  MapPin,
  CheckCircle2,
  Clock,
  Users,
  Bell,
  Moon,
  ExternalLink,
  X,
  Send,
  Loader2,
  Download,
  Filter,
  CheckCheck,
  MoreHorizontal,
  ChevronRight,
  MoveRight,
  Phone,
  MessageSquare,
} from "lucide-react";
import KanbanCard from "./KanbanCard";
import { updateTicketStatusAction, createTicketAction } from "@/actions/ticket";
import { TicketStatus, Category, Priority } from "@prisma/client";

interface KanbanBoardProps {
  initialColumns: {
    todo: any[];
    inProgress: any[];
    done: any[];
  };
  initialStats: {
    totalOpen: number;
    urgentCount: number;
    assignedToday: number;
    completedToday: number;
    pendingVerification: number;
  };
}

const BUILDINGS = [
  "ทั้งหมด",
  "อาคาร 3",
  "อาคาร 1",
  "อาคาร 2",
  "อาคาร 5",
  "หอสมุดกลาง",
  "เวิร์กช็อป 4",
];

export default function KanbanBoard({
  initialColumns,
  initialStats,
}: KanbanBoardProps) {
  const router = useRouter();

  // สถานะตั๋วแยกตามคอลัมน์
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // ตัวกรองและการค้นหา
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("ทั้งหมด");
  const [isUrgentOnly, setIsUrgentOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");

  // โมดอลสร้างใบงานใหม่
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBuilding, setNewBuilding] = useState("อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์");
  const [newRoom, setNewRoom] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<Category>(Category.AIR_CONDITIONING);
  const [newUrgent, setNewUrgent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("kanban-search-input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ฟังก์ชันกรองตั๋วในคอลัมน์
  const filterTickets = (tickets: any[]) => {
    return tickets.filter((t) => {
      // ค้นหาข้อความ
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchNumber = t.ticketNumber.toLowerCase().includes(q);
        const matchRoom = t.room.toLowerCase().includes(q);
        const matchBuilding = t.building.toLowerCase().includes(q);
        if (!matchTitle && !matchNumber && !matchRoom && !matchBuilding) return false;
      }

      // กรองอาคาร
      if (selectedBuilding !== "ทั้งหมด") {
        if (!t.building.includes(selectedBuilding)) return false;
      }

      // กรองเฉพาะงานด่วน
      if (isUrgentOnly) {
        if (!t.isUrgent && t.priority !== "CRITICAL" && t.priority !== "URGENT") return false;
      }

      return true;
    });
  };

  const filteredTodo = useMemo(() => filterTickets(columns.todo), [columns.todo, searchQuery, selectedBuilding, isUrgentOnly]);
  const filteredInProgress = useMemo(() => filterTickets(columns.inProgress), [columns.inProgress, searchQuery, selectedBuilding, isUrgentOnly]);
  const filteredDone = useMemo(() => filterTickets(columns.done), [columns.done, searchQuery, selectedBuilding, isUrgentOnly]);

  // ฟังก์ชันย้ายสถานะตั๋ว (Drag & Drop หรือ Quick Action)
  const moveTicketStatus = async (ticketId: string, nextStatus: TicketStatus) => {
    // หาตัวตั๋วเดิม
    let movedTicket: any = null;
    let fromCol: "todo" | "inProgress" | "done" = "todo";

    for (const key of ["todo", "inProgress", "done"] as const) {
      const found = columns[key].find((t) => t.id === ticketId);
      if (found) {
        movedTicket = found;
        fromCol = key;
        break;
      }
    }

    if (!movedTicket) return;

    // คำนวณคอลัมน์ปลายทาง
    let toCol: "todo" | "inProgress" | "done" = "todo";
    if (nextStatus === TicketStatus.IN_PROGRESS) toCol = "inProgress";
    else if (nextStatus === TicketStatus.RESOLVED || nextStatus === TicketStatus.CLOSED) toCol = "done";

    if (fromCol === toCol && movedTicket.status === nextStatus) return;

    // Optimistic UI Update
    const updatedTicket = { ...movedTicket, status: nextStatus };
    setColumns((prev) => ({
      ...prev,
      [fromCol]: prev[fromCol].filter((t) => t.id !== ticketId),
      [toCol]: [updatedTicket, ...prev[toCol]],
    }));

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updatedTicket);
    }

    // Server Action sync
    try {
      setIsUpdating(true);
      await updateTicketStatusAction({
        ticketId,
        status: nextStatus,
        note:
          nextStatus === TicketStatus.IN_PROGRESS
            ? "ช่างเทคนิครับงานและเริ่มลงพื้นที่ตรวจสอบหน้างาน"
            : nextStatus === TicketStatus.RESOLVED
            ? "ช่างดำเนินการซ่อมแซมเสร็จสิ้นแล้ว (RESOLVED)"
            : undefined,
      });
      router.refresh();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("text/plain");
    if (ticketId) {
      moveTicketStatus(ticketId, targetStatus);
    }
  };

  // สร้างตั๋วใหม่จาก Kanban Desk
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newRoom.trim()) return;

    try {
      setIsCreating(true);
      const res = await createTicketAction({
        title: newTitle,
        category: newCategory,
        building: newBuilding,
        room: newRoom,
        description: newDesc || newTitle,
        isUrgent: newUrgent,
      });

      if (res.success && res.ticket) {
        setColumns((prev) => ({
          ...prev,
          todo: [res.ticket, ...prev.todo],
        }));
        setShowCreateModal(false);
        setNewTitle("");
        setNewRoom("");
        setNewDesc("");
        setNewUrgent(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-100/90 overflow-x-hidden">
      {/* 1. Top Bar */}
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        {/* Search Input & Shortcuts */}
        <div className="flex items-center space-x-3 flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              id="kanban-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาใบงาน, ครุภัณฑ์, อาคาร..."
              className="w-full rounded-md border border-slate-200 bg-white pl-10 pr-20 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition-colors focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            <div className="absolute right-2.5 top-2.5 chip-tech text-[10px] py-0 px-1.5 text-slate-500">
              Ctrl + K
            </div>
          </div>

          {/* Building Filter Dropdown */}
          <div className="relative shrink-0">
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            >
              <option value="ทั้งหมด">อาคารทั้งหมด</option>
              {BUILDINGS.filter((b) => b !== "ทั้งหมด").map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <button
            type="button"
            onClick={() => setIsUrgentOnly(!isUrgentOnly)}
            className={`flex items-center space-x-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors shrink-0 ${
              isUrgentOnly
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Flame className={`h-3.5 w-3.5 ${isUrgentOnly ? "text-rose-600 fill-rose-600" : "text-slate-400"}`} />
            <span>{isUrgentOnly ? "เฉพาะเร่งด่วน" : "ระดับความเร่งด่วน"}</span>
          </button>
        </div>

        {/* View Switcher & Notification Profile */}
        <div className="flex items-center space-x-3 ml-4">
          <div className="flex rounded-md bg-slate-100 p-1 text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded px-3 py-1 transition-colors ${
                activeTab === "active" ? "bg-white text-slate-900 shadow-sm font-semibold" : "hover:text-slate-900"
              }`}
            >
              ใบงานที่กำลังดำเนินงาน
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("archive")}
              className={`rounded px-3 py-1 transition-colors ${
                activeTab === "archive" ? "bg-white text-slate-900 shadow-sm font-semibold" : "hover:text-slate-900"
              }`}
            >
              คลังประวัติ
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-600 ring-2 ring-white" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Sub-header (Breadcrumb & Live Status Chips) */}
      <div className="border-b border-slate-200 bg-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 text-slate-500">
          <span>ฝ่ายอาคารและสถานที่</span>
          <span>/</span>
          <span className="font-semibold text-slate-900">กระดานคัดกรองงานซ่อม</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* ซิงก์ข้อมูลสด */}
          <div className="flex items-center space-x-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-700" />
            <span>ซิงก์ข้อมูลสด: เชื่อมต่อแล้ว</span>
          </div>

          {/* SLA เฉลี่ย */}
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-600">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>ระยะเวลาคัดกรองเฉลี่ย SLA:</span>
            <span className="chip-tech text-[10px] py-0.5 px-2">18น. 48ว.</span>
          </div>

          {/* เร่งด่วนวิกฤต */}
          <div className="flex items-center space-x-1 rounded-md bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600" />
            <span>เร่งด่วนวิกฤต {initialStats.urgentCount} รายการ</span>
          </div>
        </div>
      </div>

      {/* 3. Action Toolbar */}
      <div className="px-6 pt-5 pb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              รายการงานซ่อมบำรุงที่รอดำเนินการ
            </h2>
            <span className="chip-tech text-xs bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
              {filteredTodo.length + filteredInProgress.length + filteredDone.length} ใบงานเปิดอยู่
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            ศูนย์กลางคัดกรองและกระจายงานซ่อมบำรุงอาคารสถานที่ • คิวงานอัปเดตแบบเรียลไทม์
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white px-3.5 py-2 text-xs font-medium shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>สร้างใบงานใหม่</span>
          </button>
        </div>
      </div>

      {/* 4. Kanban 3 Columns Board */}
      <div className="flex-1 px-6 pb-6 overflow-x-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-w-[900px] h-full items-start">
          {/* Column 1: มอบหมายแล้ว / รอดำเนินการ (To Do / Assigned) */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, TicketStatus.ASSIGNED)}
            className="rounded-lg border border-slate-200/80 bg-slate-50/90 p-4 min-h-[520px] flex flex-col shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-slate-500" />
                <h3 className="text-xs font-semibold text-slate-900 tracking-tight">
                  มอบหมายแล้ว / รอดำเนินการ
                </h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                  {filteredTodo.length}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List of cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {filteredTodo.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                  onMoveStatus={(id, s) => moveTicketStatus(id, s as any)}
                />
              ))}

              {filteredTodo.length === 0 && (
                <div className="rounded-md border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 font-medium">
                  ไม่มีใบงานรอดำเนินการ
                </div>
              )}
            </div>
          </div>

          {/* Column 2: กำลังดำเนินการ (In Progress) */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, TicketStatus.IN_PROGRESS)}
            className="rounded-lg border border-slate-200/80 bg-slate-50/90 p-4 min-h-[520px] flex flex-col shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <h3 className="text-xs font-semibold text-slate-900 tracking-tight">
                  กำลังดำเนินการซ่อม
                </h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-semibold text-amber-800 border border-amber-200">
                  {filteredInProgress.length}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List of cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {filteredInProgress.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                  onMoveStatus={(id, s) => moveTicketStatus(id, s as any)}
                />
              ))}

              {/* Drop hint box */}
              <div className="rounded-md border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-500 font-medium flex items-center justify-center space-x-1.5 transition-colors hover:border-slate-400">
                <span>ลากใบงานมาวางที่นี่เพื่อเริ่มดำเนินการ</span>
              </div>
            </div>
          </div>

          {/* Column 3: เสร็จสิ้น / รอตรวจสอบ (Resolved / Closed) */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, TicketStatus.RESOLVED)}
            className="rounded-lg border border-slate-200/80 bg-slate-50/90 p-4 min-h-[520px] flex flex-col shadow-sm"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-700" />
                <h3 className="text-xs font-semibold text-slate-900 tracking-tight">
                  เสร็จสิ้น / ซ่อมเสร็จแล้ว
                </h3>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                  {filteredDone.length}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 rounded-md hover:bg-slate-200 hover:text-slate-700 transition-colors"
                >
                  <Plus className="h-4 w-4 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* List of cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {filteredDone.map((ticket) => (
                <KanbanCard
                  key={ticket.id}
                  ticket={ticket}
                  onSelect={setSelectedTicket}
                  onMoveStatus={(id, s) => moveTicketStatus(id, s as any)}
                />
              ))}

              {filteredDone.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400 font-medium">
                  ไม่มีใบงานที่เสร็จสิ้น
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Operator Status Bar */}
      <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs shadow-sm">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-600">
              หัวหน้าทีมรับแจ้งเวรปฏิบัติการ:
            </span>
            <span className="font-bold text-slate-900">
              Alex Morgan (ช่างรหัส #04)
            </span>
          </div>

          <div className="hidden sm:flex items-center space-x-4 border-l border-slate-200 pl-4 text-slate-600">
            <span>
              มอบหมายวันนี้:{" "}
              <strong className="text-slate-900 font-mono">{initialStats.assignedToday}</strong>
            </span>
            <span>
              เสร็จสิ้น:{" "}
              <strong className="text-emerald-600 font-mono">{filteredDone.length}</strong>
            </span>
            <span>
              รอตรวจสอบ:{" "}
              <strong className="text-amber-600 font-mono">{initialStats.pendingVerification}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => alert("ระบบสร้างและส่งออกรายงานบันทึกเวรประจำวัน (.csv / .pdf)")}
            className="flex items-center space-x-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5 stroke-[1.75]" />
            <span>ส่งออกบันทึกเวร</span>
          </button>
        </div>
      </footer>

      {/* 6. Ticket Detail Drawer / Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-xl card-elevated p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="chip-tech text-xs bg-slate-100 text-slate-900 border-slate-200 font-bold">
                    {selectedTicket.ticketNumber}
                  </span>
                  {selectedTicket.isUrgent && (
                    <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                      เร่งด่วนสูงสุด
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500">
                    {selectedTicket.building}
                  </span>
                </div>
                <h2 className="mt-2 text-base sm:text-lg font-bold text-slate-900">
                  {selectedTicket.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5 stroke-[1.75]" />
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                รายละเอียดอาการและปัญหา
              </label>
              <p className="mt-1.5 rounded-xl bg-slate-50/80 p-3.5 text-xs leading-relaxed text-slate-700 border border-slate-200/90 font-medium">
                {selectedTicket.description}
              </p>
            </div>

            {/* Location & GPS */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                <span className="font-bold text-slate-600">ห้อง / จุดสังเกต</span>
                <p className="mt-1 font-semibold text-slate-800">{selectedTicket.room}</p>
                {selectedTicket.specificLocation && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedTicket.specificLocation}</p>
                )}
              </div>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
                <span className="font-bold text-slate-600">พิกัด GPS</span>
                <p className="mt-1 font-mono text-slate-800 font-semibold">
                  {selectedTicket.latitude ?? "15.2284"}° N, {selectedTicket.longitude ?? "104.8592"}° E
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">ล็อกพิกัดแล้ว</span>
              </div>
            </div>

            {/* Attachments if any */}
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  หลักฐานภาพถ่าย ({selectedTicket.attachments.length} รูป)
                </span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {selectedTicket.attachments.map((att: any, i: number) => (
                    <div key={i} className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={att.url} alt="att" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-0.5 text-[10px] text-white truncate">
                        {att.fileName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Status Changers */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-xs font-bold text-slate-500">
                เปลี่ยนสถานะใบงานนี้:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => moveTicketStatus(selectedTicket.id, TicketStatus.ASSIGNED)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition active:scale-95 ${
                    selectedTicket.status === TicketStatus.ASSIGNED
                      ? "bg-amber-100 border-amber-300 text-amber-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  รอดำเนินการ
                </button>
                <button
                  type="button"
                  onClick={() => moveTicketStatus(selectedTicket.id, TicketStatus.IN_PROGRESS)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition active:scale-95 ${
                    selectedTicket.status === TicketStatus.IN_PROGRESS
                      ? "bg-blue-100 border-blue-300 text-blue-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  กำลังดำเนินการ
                </button>
                <button
                  type="button"
                  onClick={() => moveTicketStatus(selectedTicket.id, TicketStatus.RESOLVED)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition active:scale-95 ${
                    selectedTicket.status === TicketStatus.RESOLVED
                      ? "bg-emerald-100 border-emerald-300 text-emerald-900"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  เสร็จสิ้น (Resolved)
                </button>
                <Link
                  href={`/tracking/${selectedTicket.ticketNumber.replace("#", "")}`}
                  className="ml-auto inline-flex items-center space-x-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm"
                >
                  <span>ดูหน้าติดตาม</span>
                  <ExternalLink className="h-3.5 w-3.5 stroke-[1.75]" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Create New Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md card-elevated p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                สร้างใบงานแจ้งซ่อมใหม่ (Admin / Desk)
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5 stroke-[1.75]" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700">หัวข้อปัญหา *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="เช่น หลอดไฟทางเดินกระพริบ, แอร์ไม่เย็น..."
                  className="mt-1 w-full rounded-xl border border-slate-200/90 p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700">หมวดหมู่</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200/90 p-2.5 bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  >
                    <option value={Category.AIR_CONDITIONING}>เครื่องปรับอากาศ</option>
                    <option value={Category.ELECTRICAL}>ระบบไฟฟ้า</option>
                    <option value={Category.PLUMBING}>ประปา/สุขาภิบาล</option>
                    <option value={Category.IT_EQUIPMENT}>ไอที/โสตทัศน์</option>
                    <option value={Category.FURNITURE}>ครุภัณฑ์/ฮาร์ดแวร์</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">อาคาร</label>
                  <select
                    value={newBuilding}
                    onChange={(e) => setNewBuilding(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200/90 p-2.5 bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                  >
                    {BUILDINGS.filter((b) => b !== "ทั้งหมด").map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">ห้อง / จุดสังเกต *</label>
                <input
                  type="text"
                  required
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  placeholder="เช่น ห้อง 402 ชั้น 4 หรือ บันไดหนีไฟฝั่งใต้"
                  className="mt-1 w-full rounded-xl border border-slate-200/90 p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">รายละเอียดอาการ</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="อธิบายอาการอย่างละเอียด..."
                  className="mt-1 w-full rounded-xl border border-slate-200/90 p-2.5 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-urgent"
                  checked={newUrgent}
                  onChange={(e) => setNewUrgent(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="modal-urgent" className="font-bold text-rose-600 cursor-pointer">
                  ทำเครื่องหมายเป็นงานเร่งด่วนพิเศษ (SLA 15 นาที)
                </label>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-xl border border-slate-200/90 py-2.5 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-primary-gradient flex-1 py-2.5 font-bold text-white shadow-md disabled:opacity-50"
                >
                  {isCreating ? "กำลังสร้าง..." : "บันทึกและส่งตั๋ว"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

