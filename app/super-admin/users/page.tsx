import { getAllUsersAction } from "@/actions/auth";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import UserManagementTable from "@/components/admin/UserManagementTable";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "จัดการสิทธิ์ผู้ใช้งาน (RBAC) | Super Admin | CampusOps",
  description: "จัดการสิทธิ์และบทบาทผู้ใช้งานทั้ง 4 ระดับสำหรับ Super Admin",
};

export default async function SuperAdminUsersPage() {
  const session = await getSession();

  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/super-admin/dashboard");
  }

  const [usersRes, buildings] = await Promise.all([
    getAllUsersAction(),
    prisma.building.findMany({
      select: { id: true, code: true, name: true, adminId: true },
      orderBy: { code: "asc" },
    }),
  ]);

  const users = usersRes.success && usersRes.users ? usersRes.users : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24">
      <UserManagementTable
        initialUsers={users as any}
        currentUserId={session.userId}
        availableBuildings={buildings}
      />
    </div>
  );
}
