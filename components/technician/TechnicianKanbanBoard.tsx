// components/technician/TechnicianKanbanBoard.tsx - Dedicated Technician Kanban Board
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Flame,
  Clock,
  Bell,
  X,
  ExternalLink,
  MapPin,
  Phone,
  MessageSquare,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  User,
  Sparkles,
} from "lucide-react";
import KanbanTaskCard from "./KanbanTaskCard";
import TechnicianResolveModal from "./TechnicianResolveModal";
import { updateTicketStatusAction } from "@/actions/ticket";
import { TicketStatus } from "@prisma/client";
import { SessionPayload } from "@/lib/auth";

interface TechnicianKanbanBoardProps {
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
  currentUser?: SessionPayload | null;
}

const BUILDINGS = [
  "ทั้งหมด",
  "อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
  "อาคาร 3",
  "อาคาร 1",
  "อาคาร 2",
  "อาคาร 5",
  "หอสมุดกลาง",
];

export default function TechnicianKanbanBoard({
  initialColumns,
  initialStats,
  currentUser,
}: TechnicianKanbanBoardProps) {
  const router = useRouter();

  const currentUserId = currentUser?.userId;

  // คอลัมน์สถานะงาน
  const [columns, setColumns] = useState(initialColumns);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // แท็บคอลัมน์ที่เลือกบนจอมือถือ (Default: ASSIGNED / รอดำเนินการ)
  const [activeMobileColumn, setActiveMobileColumn] = useState<string>("ASSIGNED");

  // ตัวกรองและค้นหา
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("ทั้งหมด");
  const [isUrgentOnly, setIsUrgentOnly] = useState(false);
  const [filterMyTasksOnly, setFilterMyTasksOnly] = useState(false);
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState(false);

  // Resolve Modal State
  const [resolvingTask, setResolvingTask] = useState<any | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  // Keyboard shortcut Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("technician-kanban-search");
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // กรองงาน
  const filterTasks = (tasks: any[]) => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(q);
        const matchNumber = t.ticketNumber?.toLowerCase().includes(q);
        const matchRoom = (t.roomName || t.room)?.toLowerCase().includes(q);
        const matchBuilding = t.building?.toLowerCase().includes(q);
        if (!matchTitle && !matchNumber && !matchRoom && !matchBuilding) {
          return false;
        }
      }

      if (selectedBuilding !== "ทั้งหมด") {
        if (!t.building?.includes(selectedBuilding)) return false;
      }

      if (isUrgentOnly) {
        if (
          !t.isUrgent &&
          t.priority !== "CRITICAL" &&
          t.priority !== "URGENT"
        ) {
          return false;
        }
      }

      if (filterMyTasksOnly && currentUserId) {
        const isMy =
          t.technicianId === currentUserId ||
          t.technician?.id === currentUserId;
        if (!isMy) return false;
      }

      if (filterUnassignedOnly) {
        const isUnassigned = !t.technicianId && !t.technician;
        if (!isUnassigned) return false;
      }

      return true;
    });
  };

  const filteredTodo = useMemo(
    () => filterTasks(columns.todo),
    [columns.todo, searchQuery, selectedBuilding, isUrgentOnly, filterMyTasksOnly, filterUnassignedOnly, currentUserId]
  );
  const filteredInProgress = useMemo(
    () => filterTasks(columns.inProgress),
    [columns.inProgress, searchQuery, selectedBuilding, isUrgentOnly, filterMyTasksOnly, filterUnassignedOnly, currentUserId]
  );
  const filteredDone = useMemo(
    () => filterTasks(columns.done),
    [columns.done, searchQuery, selectedBuilding, isUrgentOnly, filterMyTasksOnly, filterUnassignedOnly, currentUserId]
  );

  // ย้ายสถานะเมื่อ Action ในการ์ดทำงานสำเร็จ
  const handleStatusChanged = (ticketId: string, nextStatus: TicketStatus) => {
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

    if (!movedTicket) {
      router.refresh();
      return;
    }

    let toCol: "todo" | "inProgress" | "done" = "todo";
    if (nextStatus === TicketStatus.IN_PROGRESS) toCol = "inProgress";
    else if (
      nextStatus === TicketStatus.RESOLVED ||
      nextStatus === TicketStatus.CLOSED
    )
      toCol = "done";
    else if (nextStatus === TicketStatus.ASSIGNED) toCol = "todo";

    const updated = {
      ...movedTicket,
      status: nextStatus,
      technicianId: currentUserId || movedTicket.technicianId,
      technician: movedTicket.technician || {
        id: currentUserId,
        name: currentUser?.name || "ช่างประจำแผนก",
      },
    };

    setColumns((prev) => ({
      ...prev,
      [fromCol]: prev[fromCol].filter((t) => t.id !== ticketId),
      [toCol]: [updated, ...prev[toCol].filter((t) => t.id !== ticketId)],
    }));

    router.refresh();
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TicketStatus) => {
    e.preventDefault();
    const ticketId = e.dataTransfer.getData("text/plain");
    if (!ticketId) return;

    // หาตัวการ์ดที่ถูกลาก
    let dragged: any = null;
    for (const key of ["todo", "inProgress", "done"] as const) {
      const found = columns[key].find((t) => t.id === ticketId);
      if (found) {
        dragged = found;
        break;
      }
    }

    if (!dragged) return;

    // ตรวจสอบสิทธิ์การลาก: ไม่อนุญาตให้ลากการ์ดที่เป็นของช่างท่านอื่น
    const isMyTask = Boolean(
      currentUserId &&
        (dragged.technicianId === currentUserId ||
          dragged.technician?.id === currentUserId)
    );
    const isUnassigned = !dragged.technicianId && !dragged.technician;

    if (!isMyTask && !isUnassigned) {
      alert("คุณไม่มีสิทธิ์ย้ายหรือแก้ไขใบงานของช่างท่านอื่น");
      return;
    }

    // ข้อกำหนดกรณีมี Drag and Drop:
    // หากผู้ใช้ลากการ์ดงานจาก "กำลังซ่อม" หรือ "มอบหมายแล้ว" ไปยัง "เสร็จสิ้น"
    // ต้องเปิด TechnicianResolveModal บังคับแนบรูป After Photo ทุกครั้ง ไม่อนุญาตให้ย้ายไปเสร็จสิ้นโดยไม่มีหลักฐาน
    if (
      targetStatus === TicketStatus.RESOLVED ||
      targetStatus === TicketStatus.CLOSED
    ) {
      setResolvingTask(dragged);
      setIsResolveModalOpen(true);
      return;
    }

    // กรณีย้ายไป IN_PROGRESS หรือ ASSIGNED
    try {
      await updateTicketStatusAction({
        ticketId,
        status: targetStatus,
        note:
          targetStatus === TicketStatus.IN_PROGRESS
            ? "ช่างเทคนิครับงานและเริ่มลงพื้นที่ตรวจสอบหน้างาน"
            : undefined,
      });
      handleStatusChanged(ticketId, targetStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const kanbanColumns = [
    {
      id: "ASSIGNED",
      title: "มอบหมายแล้ว / รอดำเนินการ",
      titleShort: "รอดำเนินการ",
      tickets: filteredTodo,
      dotClass: "bg-slate-500",
      badgeClass: "border-slate-200 text-slate-600",
      targetStatus: TicketStatus.ASSIGNED,
      emptyMessage: "ไม่มีใบงานรอดำเนินการ",
    },
    {
      id: "IN_PROGRESS",
      title: "กำลังดำเนินการซ่อม",
      titleShort: "กำลังซ่อม",
      tickets: filteredInProgress,
      dotClass: "bg-amber-500 animate-pulse",
      badgeClass: "border-amber-200 text-amber-800",
      targetStatus: TicketStatus.IN_PROGRESS,
      emptyMessage: "ไม่มีงานที่กำลังซ่อมแซม",
    },
    {
      id: "RESOLVED",
      title: "เสร็จสิ้น / ซ่อมเสร็จแล้ว",
      titleShort: "เสร็จสิ้น",
      tickets: filteredDone,
      dotClass: "bg-emerald-600",
      badgeClass: "border-emerald-200 text-emerald-800",
      targetStatus: TicketStatus.RESOLVED,
      emptyMessage: "ไม่มีใบงานที่เสร็จสิ้น",
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-100/90 min-w-0 pb-24 sm:pb-8">
      {/* 1. Header Toolbar (เฉพาะของช่างเทคนิค: ไม่มีปุ่มสร้างใบงานใหม่) */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-6 py-2.5 sm:py-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-0 sm:min-w-[240px] max-w-xl">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              id="technician-kanban-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาใบงาน, ห้อง, หรืออุปกรณ์..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-10 sm:pr-20 py-2 text-xs font-normal text-slate-800 placeholder-slate-400 transition focus:border-emerald-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
            {/* Shortcut Badge: ซ่อนบนมือถือ */}
            <div className="absolute right-2.5 top-2 text-[10px] py-0.5 px-1.5 text-slate-400 font-mono bg-slate-100 rounded border border-slate-200 hidden sm:inline-flex items-center">
              Ctrl+K
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 sm:hidden cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Chips Container (แนวนอนเลื่อนสไลด์ได้บนมือถือ no-scrollbar) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
            {/* Building Filter */}
            <div className="relative shrink-0">
              <select
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 whitespace-nowrap shrink-0"
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
              className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                isUrgentOnly
                  ? "border-rose-300 bg-rose-50 text-rose-700 shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Flame
                className={`h-3.5 w-3.5 stroke-[1.75] ${
                  isUrgentOnly ? "text-rose-600 fill-rose-600" : "text-slate-400"
                }`}
              />
              <span>{isUrgentOnly ? "เฉพาะเร่งด่วน" : "งานด่วน"}</span>
            </button>

            {/* Filter My Tasks Only */}
            <button
              type="button"
              onClick={() => {
                setFilterMyTasksOnly(!filterMyTasksOnly);
                if (!filterMyTasksOnly) setFilterUnassignedOnly(false);
              }}
              className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterMyTasksOnly
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <User className="h-3.5 w-3.5 text-emerald-700" />
              <span>{filterMyTasksOnly ? "เฉพาะงานฉัน" : "งานของฉัน"}</span>
            </button>

            {/* Filter Unassigned Tasks Only (งานกองกลาง) */}
            <button
              type="button"
              onClick={() => {
                setFilterUnassignedOnly(!filterUnassignedOnly);
                if (!filterUnassignedOnly) setFilterMyTasksOnly(false);
              }}
              className={`flex items-center space-x-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition whitespace-nowrap shrink-0 cursor-pointer ${
                filterUnassignedOnly
                  ? "border-amber-300 bg-amber-50 text-amber-800 shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${filterUnassignedOnly ? "bg-amber-500" : "bg-amber-400"}`} />
              <span>{filterUnassignedOnly ? "เฉพาะกองกลาง" : "งานกองกลาง"}</span>
            </button>
          </div>
        </div>

        {/* Right Status Indicator */}
        <div className="hidden md:flex items-center space-x-2.5 shrink-0">
          <div className="flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>กระดานรวมงานช่าง (Live)</span>
          </div>
        </div>
      </header>

      {/* 2. Sub-header & Guidance (ซ่อนบนมือถือ hidden sm:flex เพื่อประหยัดพื้นที่แนวตั้ง) */}
      <div className="hidden sm:flex border-b border-slate-200 bg-white px-4 sm:px-6 py-2.5 flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-2 text-slate-500">
          <span>หน่วยงานซ่อมบำรุง</span>
          <span>/</span>
          <span className="font-bold text-slate-800">
            กระดานงานช่างเทคนิค
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <span>งานกองกลาง (กดรับได้)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>งานในคิวของคุณ</span>
          </span>
        </div>
      </div>

      {/* 3. Title Section */}
      <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 sm:pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-slate-900">
            กระดานปฏิบัติการงานซ่อมช่างเทคนิค
          </h1>
          <p className="hidden sm:block mt-0.5 text-xs text-slate-500">
            รับงานกลาง ดำเนินการซ่อมตามลำดับ และบันทึกปิดงานพร้อมหลักฐานภาพถ่าย
          </p>
        </div>
      </div>

      {/* 4. Kanban Columns Board */}
      <div className="w-full px-4 sm:px-6">
        {/* Mobile Segmented Column Tabs (แสดงเฉพาะ < 768px) */}
        <div className="flex md:hidden p-1 bg-slate-200/80 rounded-xl gap-1 mb-3.5">
          {kanbanColumns.map((col) => (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveMobileColumn(col.id)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMobileColumn === col.id
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{col.titleShort || col.title}</span>
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded-full font-mono transition-colors ${
                  activeMobileColumn === col.id
                    ? "bg-slate-100 text-slate-900 font-bold"
                    : "bg-slate-300/70 text-slate-600"
                }`}
              >
                {col.tickets.length}
              </span>
            </button>
          ))}
        </div>

        {/* 3 Columns Grid: Desktop แสดงครบ 3 คอลัมน์, Mobile แสดงเฉพาะคอลัมน์ activeMobileColumn */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-start w-full">
          {kanbanColumns.map((col) => (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.targetStatus)}
              className={`${
                activeMobileColumn === col.id ? "flex" : "hidden md:flex"
              } flex-col w-full min-w-0 rounded-xl bg-slate-50/90 border border-slate-200/80 p-3.5 sm:p-4 h-auto md:h-[calc(100vh-220px)] md:min-h-[500px] shadow-sm`}
            >
              {/* ส่วนหัวคอลัมน์ */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${col.dotClass}`} />
                  <span className="font-bold text-sm text-slate-800 truncate">
                    {col.title}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-white border font-mono shrink-0 ${col.badgeClass}`}
                  >
                    {col.tickets.length}
                  </span>
                </div>
              </div>

              {/* ส่วนรายการการ์ดงาน: บนมือถือปลดล็อก h-auto overflow-visible ไม่ให้ติด Nested Scrollbar, บน Desktop เลื่อน Scrollbar ได้ตามปกติ */}
              <div className="flex-1 overflow-visible md:overflow-y-auto pr-0 md:pr-1.5 space-y-3 custom-scrollbar">
                {col.tickets.map((task) => (
                  <KanbanTaskCard
                    key={task.id}
                    task={task}
                    currentUserId={currentUserId}
                    onSelect={setSelectedTask}
                    onOpenResolveModal={(t) => {
                      setResolvingTask(t);
                      setIsResolveModalOpen(true);
                    }}
                    onStatusChanged={handleStatusChanged}
                  />
                ))}

                {col.tickets.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-xs text-slate-400 font-medium">
                    {col.emptyMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Slideover Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                    {selectedTask.ticketNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {selectedTask.building}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedTask.title}
                </h3>

                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedTask.description}
                </p>

                <div className="flex items-center space-x-2 text-slate-700 pt-1">
                  <MapPin className="h-4 w-4 text-emerald-800" />
                  <span className="font-semibold">
                    ชั้น {selectedTask.floor || 1} • {selectedTask.roomName || selectedTask.room}
                  </span>
                </div>

                {selectedTask.reporter && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ข้อมูลผู้แจ้งซ่อม
                    </span>
                    <p className="font-semibold text-slate-800">
                      {selectedTask.reporter.name}
                    </p>
                    {selectedTask.reporter.phone && (
                      <p className="text-slate-500 font-mono">
                        เบอร์ติดต่อ: {selectedTask.reporter.phone}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <Link
                href={`/tracking/${selectedTask.ticketNumber.replace("#", "")}`}
                className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900"
              >
                <span>ดูหน้า Tracking ละเอียด</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="rounded-md bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technician Resolve Modal */}
      {resolvingTask && (
        <TechnicianResolveModal
          ticket={resolvingTask}
          isOpen={isResolveModalOpen}
          onClose={() => {
            setIsResolveModalOpen(false);
            setResolvingTask(null);
            handleStatusChanged(resolvingTask.id, TicketStatus.RESOLVED);
          }}
        />
      )}
    </div>
  );
}
