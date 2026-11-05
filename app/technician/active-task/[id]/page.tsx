// app/technician/active-task/[id]/page.tsx
import React from "react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Wrench } from "lucide-react";
import ActiveTaskScreen from "@/components/technician/ActiveTaskScreen";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const rawId = decodeURIComponent(params?.id || "");
  return {
    title: `ปฏิบัติงานซ่อมภาคสนาม (${rawId}) | CampusOps Field Service`,
    description: "หน้าจอปฏิบัติงานภาคสนามสำหรับช่างเทคนิค เช็กอินหน้างานและบันทึกปิดงานพร้อมแนบภาพถ่าย",
  };
}

export default async function ActiveTaskPage({ params }: PageProps) {
  const session = await getSession();

  if (!session) {
    redirect(`/login?callbackUrl=/technician/active-task/${params.id}`);
  }

  // Strict RBAC: อนุญาตเฉพาะ TECHNICIAN, ADMIN หรือ SUPER_ADMIN
  if (
    session.role !== "TECHNICIAN" &&
    session.role !== "ADMIN" &&
    session.role !== "SUPER_ADMIN"
  ) {
    redirect("/student/dashboard");
  }

  const rawId = decodeURIComponent(params.id || "").trim();
  const withHash = rawId.startsWith("#") ? rawId : `#${rawId}`;

  const ticket = await prisma.ticket.findFirst({
    where: {
      OR: [
        { id: rawId },
        { ticketNumber: rawId },
        { ticketNumber: withHash },
      ],
    },
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          role: true,
          studentId: true,
          position: true,
        },
      },
      technician: {
        select: {
          id: true,
          name: true,
          phone: true,
          technicianCode: true,
        },
      },
      attachments: true,
      histories: {
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-white p-6 sm:p-8 text-center shadow-lg border border-slate-200/90 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              ไม่พบข้อมูลใบงานที่ระบุ
            </h2>
            <p className="text-xs text-slate-500">
              รหัส <span className="font-mono font-semibold">{rawId}</span> อาจถูกลบหรือไม่มีอยู่ในระบบ
            </p>
          </div>
          <Link
            href="/technician/dashboard"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>กลับสู่แผนผัง 2.5D</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ActiveTaskScreen
      ticket={ticket}
      currentUserId={session.userId}
      currentUserName={session.name}
    />
  );
}
