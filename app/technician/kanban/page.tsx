// app/technician/kanban/page.tsx
import { getKanbanTicketsAction } from "@/actions/ticket";
import { getSession } from "@/lib/auth";
import TechnicianKanbanBoard from "@/components/technician/TechnicianKanbanBoard";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "กระดานคันบันงานช่างเทคนิค | CampusOps",
  description: "จัดการลำดับงานซ่อม อัปเดตสถานะงาน และติดตามความคืบหน้าระดับช่าง",
};

export default async function TechnicianKanbanPage() {
  const [res, session] = await Promise.all([
    getKanbanTicketsAction(),
    getSession(),
  ]);

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
    <div className="w-full min-h-[calc(100vh-140px)]">
      <TechnicianKanbanBoard
        initialColumns={columns}
        initialStats={stats}
        currentUser={session}
      />
    </div>
  );
}
