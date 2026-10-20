// app/admin/kanban/page.tsx - Clean Admin Kanban View
import { getKanbanTicketsAction } from "@/actions/ticket";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import KanbanSidebar from "@/components/kanban/KanbanSidebar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "กระดานคันบันจัดการงานซ่อมบำรุง | CampusOps",
  description: "ศูนย์กลางคัดกรอง กระจายงาน และจัดการสถานะงานซ่อมบำรุงในสถานศึกษา",
};

export default async function AdminKanbanPage() {
  const res = await getKanbanTicketsAction();

  const defaultColumns = {
    todo: [],
    inProgress: [],
    done: [],
  };

  const defaultStats = {
    totalOpen: 14,
    urgentCount: 2,
    assignedToday: 9,
    completedToday: 7,
    pendingVerification: 2,
  };

  const columns = res.success && res.columns ? res.columns : defaultColumns;
  const stats = res.success && res.stats ? res.stats : defaultStats;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* 1. Left Sidebar */}
      <KanbanSidebar />

      {/* 2. Main Kanban Workspace */}
      <KanbanBoard initialColumns={columns} initialStats={stats} />
    </div>
  );
}
