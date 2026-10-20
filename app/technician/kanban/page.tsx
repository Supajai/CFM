// app/technician/kanban/page.tsx
import { getKanbanTicketsAction } from "@/actions/ticket";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "กระดานคันบันงานช่างเทคนิค | CampusOps",
  description: "จัดการลำดับงานซ่อม อัปเดตสถานะงาน และติดตามความคืบหน้าระดับช่าง",
};

export default async function TechnicianKanbanPage() {
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
    <div className="h-[calc(100vh-4rem)] lg:h-screen overflow-hidden">
      <KanbanBoard initialColumns={columns} initialStats={stats} />
    </div>
  );
}
