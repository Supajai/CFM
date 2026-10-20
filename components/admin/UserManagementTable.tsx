// components/admin/UserManagementTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Crown,
  Building,
  Hammer,
  GraduationCap,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Filter,
  UserPlus,
  Edit3,
  Trash2,
  X,
  Key,
  AlertTriangle,
  Lock,
  ChevronDown,
} from "lucide-react";
import { Role } from "@prisma/client";
import { updateUserRoleAction } from "@/actions/auth";
import {
  createUserAction,
  updateUserAction,
  deleteUserAction,
  CreateUserInput,
  UpdateUserInput,
} from "@/actions/user";
import { formatDateThai } from "@/lib/utils";
import {
  ACADEMIC_DEPARTMENTS,
  CLASS_LEVEL_OPTIONS,
  getMajorsByDepartment,
} from "@/lib/constants/academic-data";
import {
  ADMIN_POSITIONS,
  ADMIN_DEPARTMENTS,
  TECHNICIAN_SERVICE_CENTERS,
  TECHNICIAN_SPECIALTIES_MASTER,
} from "@/lib/constants/campus-master-data";

// ตัวเลือกสายงานความเชี่ยวชาญช่างซ่อมบำรุง
export const TECHNICIAN_SPECIALTIES = TECHNICIAN_SPECIALTIES_MASTER;

// ตัวเลือกระดับชั้นการศึกษา (อ้างอิงจาก master data)
export const CLASS_LEVELS = CLASS_LEVEL_OPTIONS;

export interface BuildingOption {
  id: string;
  code: string;
  name: string;
  adminId?: string | null;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
  studentId: string | null;
  technicianCode: string | null;
  position: string | null;
  department: string | null;
  classLevel?: string | null;
  major?: string | null;
  specialty?: string | null;
  managedBuildings?: Array<{ id: string; code: string; name: string }>;
  createdAt: Date | string;
  _count: {
    reportedTickets: number;
    assignedTickets: number;
  };
}

interface UserManagementTableProps {
  initialUsers: UserItem[];
  currentUserId: string;
  availableBuildings?: BuildingOption[];
}

const initialCreateFormState: CreateUserInput = {
  name: "",
  email: "",
  password: "Password123!",
  role: Role.USER,
  studentId: "",
  technicianCode: "",
  position: ADMIN_POSITIONS[0].value,
  department: ADMIN_DEPARTMENTS[0].value,
  classLevel: "ปวช. 1",
  major: "",
  specialty: TECHNICIAN_SPECIALTIES_MASTER[0].value,
  phone: "",
  assignedBuildingId: "",
};

export default function UserManagementTable({
  initialUsers,
  currentUserId,
  availableBuildings = [],
}: UserManagementTableProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State: Create User
  const [createForm, setCreateForm] = useState<CreateUserInput>(initialCreateFormState);

  // Form State: Edit User
  const [editForm, setEditForm] = useState<UpdateUserInput>({
    name: "",
    email: "",
    role: Role.USER,
    studentId: "",
    technicianCode: "",
    position: "",
    department: "",
    classLevel: "",
    major: "",
    specialty: "",
    phone: "",
    newPassword: "",
  });

  // สถิติจำนวนผู้ใช้แต่ละบทบาท
  const stats = useMemo(() => {
    return {
      total: users.length,
      superAdmins: users.filter((u) => u.role === Role.SUPER_ADMIN).length,
      admins: users.filter((u) => u.role === Role.ADMIN).length,
      technicians: users.filter((u) => u.role === Role.TECHNICIAN).length,
      students: users.filter((u) => u.role === Role.USER).length,
    };
  }, [users]);

  // การกรองตาราง
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchStudentId = u.studentId?.toLowerCase().includes(q);
        const matchDept = u.department?.toLowerCase().includes(q);
        const matchPos = u.position?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchStudentId && !matchDept && !matchPos) return false;
      }

      if (selectedRoleFilter !== "ALL") {
        if (u.role !== selectedRoleFilter) return false;
      }

      return true;
    });
  }, [users, searchQuery, selectedRoleFilter]);

  // ฟังก์ชันเปลี่ยน Role จาก Dropdown ตาราง
  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingUserId(userId);
    setAlertMsg(null);

    const prevUsers = [...users];
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );

    try {
      const res = await updateUserRoleAction(userId, newRole);
      if (res.success) {
        setAlertMsg({ type: "success", text: "อัปเดตสิทธิ์ผู้ใช้งานสำเร็จแล้ว" });
      } else {
        setUsers(prevUsers);
        setAlertMsg({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์" });
      }
    } catch (err: any) {
      console.error(err);
      setUsers(prevUsers);
      setAlertMsg({ type: "error", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // เปิด Modal แก้ไข พร้อมโหลดข้อมูลเดิม
  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    const currentBuildingId =
      u.managedBuildings && u.managedBuildings.length > 0 ? u.managedBuildings[0].id : "";

    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      studentId: u.studentId || "",
      technicianCode: u.technicianCode || "",
      position: u.position || (u.role === Role.ADMIN ? ADMIN_POSITIONS[0].value : ""),
      department:
        u.department ||
        (u.role === Role.ADMIN
          ? ADMIN_DEPARTMENTS[0].value
          : u.role === Role.TECHNICIAN
          ? TECHNICIAN_SERVICE_CENTERS[0].value
          : ""),
      classLevel: u.classLevel || "",
      major: u.major || "",
      specialty:
        u.specialty || (u.role === Role.TECHNICIAN ? TECHNICIAN_SPECIALTIES_MASTER[0].value : ""),
      phone: u.phone || "",
      assignedBuildingId: currentBuildingId,
      newPassword: "",
    });
  };

  // Submit: สร้างผู้ใช้งานใหม่
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await createUserAction(createForm);
      if (res.success && res.user) {
        let assignedBlds: Array<{ id: string; code: string; name: string }> = [];
        if (createForm.role === Role.ADMIN && createForm.assignedBuildingId) {
          const matched = availableBuildings.find((b) => b.id === createForm.assignedBuildingId);
          if (matched) {
            assignedBlds = [{ id: matched.id, code: matched.code, name: matched.name }];
          }
        }

        const newUserItem: UserItem = {
          ...res.user,
          managedBuildings: assignedBlds,
          createdAt: new Date(),
          _count: {
            reportedTickets: 0,
            assignedTickets: 0,
          },
        };
        setUsers((prev) => [newUserItem, ...prev]);
        setShowCreateModal(false);
        setAlertMsg({ type: "success", text: `สร้างผู้ใช้งาน "${res.user.name}" เรียบร้อยแล้ว` });
        // รีเซ็ตฟอร์มกลับค่าเริ่มต้น
        setCreateForm(initialCreateFormState);
      } else {
        setAlertMsg({ type: "error", text: res.error || "ไม่สามารถสร้างผู้ใช้งานได้" });
      }
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: แก้ไขข้อมูลผู้ใช้
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await updateUserAction(editingUser.id, editForm);
      if (res.success && res.user) {
        let assignedBlds: Array<{ id: string; code: string; name: string }> = [];
        if (editForm.role === Role.ADMIN && editForm.assignedBuildingId) {
          const matched = availableBuildings.find((b) => b.id === editForm.assignedBuildingId);
          if (matched) {
            assignedBlds = [{ id: matched.id, code: matched.code, name: matched.name }];
          }
        }

        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  name: res.user!.name,
                  email: res.user!.email,
                  role: res.user!.role,
                  phone: res.user!.phone,
                  studentId: res.user!.studentId,
                  technicianCode: res.user!.technicianCode,
                  position: res.user!.position,
                  department: res.user!.department,
                  classLevel: res.user!.classLevel,
                  major: res.user!.major,
                  specialty: res.user!.specialty,
                  managedBuildings: editForm.role === Role.ADMIN ? assignedBlds : u.managedBuildings,
                }
              : u
          )
        );
        setEditingUser(null);
        setAlertMsg({ type: "success", text: `อัปเดตข้อมูลผู้ใช้ "${res.user.name}" สำเร็จเรียบร้อยแล้ว` });
      } else {
        setAlertMsg({ type: "error", text: res.error || "ไม่สามารถอัปเดตข้อมูลได้" });
      }
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit: ลบผู้ใช้งาน
  const handleDeleteSubmit = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await deleteUserAction(deletingUser.id);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setAlertMsg({
          type: "success",
          text: res.message || `ลบผู้ใช้งาน "${deletingUser.name}" ออกจากระบบเรียบร้อยแล้ว`,
        });
        setDeletingUser(null);
      } else {
        setAlertMsg({ type: "error", text: res.error || "ไม่สามารถลบผู้ใช้งานได้" });
      }
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700 border border-purple-200">
            <Crown className="h-3 w-3 text-purple-600" />
            <span>SUPER ADMIN</span>
          </span>
        );
      case Role.ADMIN:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 border border-blue-200">
            <Building className="h-3 w-3 text-blue-600" />
            <span>ADMIN</span>
          </span>
        );
      case Role.TECHNICIAN:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
            <Hammer className="h-3 w-3 text-amber-600" />
            <span>TECHNICIAN</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 border border-slate-200">
            <GraduationCap className="h-3 w-3 text-slate-500" />
            <span>USER / นักศึกษา</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Stats Banner */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                จัดการรายชื่อและสิทธิ์ผู้ใช้งาน (RBAC)
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              ควบคุมสิทธิ์การเข้าถึงระบบ 4 ระดับ (Super Admin, Admin, Technician, User)
            </p>
          </div>

          {/* Action: Add User Button */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ เพิ่มผู้ใช้งานใหม่</span>
            </button>
          </div>
        </div>

        {/* Quick Role Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-xl border border-purple-200 bg-purple-50 px-3 py-1 font-semibold text-purple-800">
            Super Admin: {stats.superAdmins}
          </span>
          <span className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-800">
            Admin: {stats.admins}
          </span>
          <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 font-semibold text-amber-800">
            Technician: {stats.technicians}
          </span>
          <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700">
            Users: {stats.students}
          </span>
        </div>

        {/* Alert Feedback Banner */}
        {alertMsg && (
          <div
            className={`flex items-center justify-between rounded-2xl p-3.5 text-xs border ${
              alertMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <div className="flex items-center space-x-2">
              {alertMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              )}
              <span className="font-medium">{alertMsg.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertMsg(null)}
              className="rounded-full p-1 hover:bg-black/5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, อีเมล, รหัสนักศึกษา, สังกัด, ตำแหน่ง..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="ALL">ทุกบทบาท (All Roles)</option>
              <option value={Role.SUPER_ADMIN}>เฉพาะ Super Admin</option>
              <option value={Role.ADMIN}>เฉพาะ Admin อาคาร</option>
              <option value={Role.TECHNICIAN}>เฉพาะ Technician ช่าง</option>
              <option value={Role.USER}>เฉพาะ User นักศึกษา/บุคลากร</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Users Table */}
      <div className="mt-5 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">ผู้ใช้งาน / บัญชี</th>
                <th className="px-4 py-3.5">สังกัด / ติดต่อ</th>
                <th className="px-4 py-3.5 text-center">ประวัติใบงาน</th>
                <th className="px-6 py-3.5">สิทธิ์ปัจจุบัน (Role Selector)</th>
                <th className="px-4 py-3.5 text-right">วันที่ลงทะเบียน</th>
                <th className="px-6 py-3.5 text-right">จัดการ (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => {
                const isCurrent = u.id === currentUserId;
                const isUpdatingThis = updatingUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    {/* 1. User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-xs font-bold text-slate-800 shadow-sm border border-slate-200">
                          {u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 truncate">
                              {u.name}
                            </span>
                            {isCurrent && (
                              <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-800">
                                บัญชีคุณ
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {u.email}
                          </p>
                          {/* Role-Specific details in table row */}
                          {u.role === Role.USER && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {u.studentId && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  รหัส: {u.studentId}
                                </span>
                              )}
                              {(u.classLevel || u.major) && (
                                <span className="text-[9px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {[u.classLevel, u.major].filter(Boolean).join(" • ")}
                                </span>
                              )}
                            </div>
                          )}
                          {u.role === Role.TECHNICIAN && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {u.technicianCode && (
                                <span className="text-[10px] text-amber-800 font-bold font-mono">
                                  รหัสช่าง: {u.technicianCode}
                                </span>
                              )}
                              {u.specialty && (
                                <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  🛠️ {u.specialty}
                                </span>
                              )}
                            </div>
                          )}
                          {(u.role === Role.ADMIN || u.role === Role.SUPER_ADMIN) && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {u.studentId && (
                                <span className="text-[10px] text-blue-700 font-mono">
                                  รหัสบุคลากร: {u.studentId}
                                </span>
                              )}
                              {u.position && (
                                <span className="text-[10px] text-slate-500 truncate max-w-[200px]">
                                  {u.position}
                                </span>
                              )}
                              {u.role === Role.ADMIN && (
                                u.managedBuildings && u.managedBuildings.length > 0 ? (
                                  <span className="text-[9px] font-bold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                                    📍 {u.managedBuildings.map((b) => b.name.split("-")[0]?.trim() || b.code).join(", ")}
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                    ⚠️ ยังไม่ระบุอาคาร
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. Department & Phone */}
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800 truncate max-w-[200px]">
                        {u.department || "-"}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {u.phone || "-"}
                      </p>
                    </td>

                    {/* 3. Tickets count */}
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-800">
                          {u._count.reportedTickets} แจ้ง
                        </span>
                        {u.role === Role.TECHNICIAN && (
                          <span className="text-[10px] text-blue-600 font-semibold">
                            ({u._count.assignedTickets} มอบหมาย)
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Role Selector Dropdown */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <select
                          disabled={isUpdatingThis || isCurrent}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition focus:outline-none cursor-pointer disabled:cursor-not-allowed ${
                            u.role === Role.SUPER_ADMIN
                              ? "border-purple-300 bg-purple-50 text-purple-800"
                              : u.role === Role.ADMIN
                              ? "border-blue-300 bg-blue-50 text-blue-800"
                              : u.role === Role.TECHNICIAN
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <option value={Role.SUPER_ADMIN}>👑 Super Admin</option>
                          <option value={Role.ADMIN}>🏢 Admin อาคาร</option>
                          <option value={Role.TECHNICIAN}>🔧 Technician ช่าง</option>
                          <option value={Role.USER}>🎓 User นักศึกษา/บุคลากร</option>
                        </select>

                        {isUpdatingThis && (
                          <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                        )}
                      </div>
                    </td>

                    {/* 5. Date */}
                    <td className="px-4 py-4 text-right text-[11px] text-slate-500 font-mono">
                      {formatDateThai(u.createdAt)}
                    </td>

                    {/* 6. Actions (Edit & Delete) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="flex items-center justify-center rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200 transition"
                          title="แก้ไขข้อมูลผู้ใช้"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        {isCurrent ? (
                          <span
                            className="flex items-center justify-center rounded-xl p-2 text-slate-300 cursor-not-allowed"
                            title="ไม่สามารถลบบัญชี Super Admin ของตนเองได้"
                          >
                            <Trash2 className="h-3.5 w-3.5 opacity-30" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingUser(u)}
                            className="flex items-center justify-center rounded-xl p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-100 transition"
                            title="ลบผู้ใช้"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    ไม่พบข้อมูลผู้ใช้ที่ตรงกับคำค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. Modal: สร้างผู้ใช้งานใหม่ (Dynamic Role-Based Create Modal) */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ
                  </h2>
                  <p className="text-xs text-slate-500">
                    เลือกบทบาทและกรอกข้อมูลที่เกี่ยวข้องตามสายงาน
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm(initialCreateFormState);
                }}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* ========================================================= */}
              {/* STEP 1: Role Selector (Radio Cards) */}
              {/* ========================================================= */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span>ขั้นตอนที่ 1: เลือกบทบาทผู้ใช้งาน (Role Selection)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    ฟอร์มด้านล่างจะปรับเปลี่ยนอัตโนมัติ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Card 1: USER (นักศึกษา / บุคลากร) */}
                  <button
                    type="button"
                    onClick={() =>
                      setCreateForm((prev) => ({
                        ...prev,
                        role: Role.USER,
                        technicianCode: "",
                        specialty: "",
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      createForm.role === Role.USER
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 transition ${
                        createForm.role === Role.USER
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight">🎓 นักศึกษา / บุคลากร</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Role: USER</span>
                  </button>

                  {/* Card 2: TECHNICIAN (ช่างซ่อมบำรุง) */}
                  <button
                    type="button"
                    onClick={() =>
                      setCreateForm((prev) => ({
                        ...prev,
                        role: Role.TECHNICIAN,
                        classLevel: "",
                        major: "",
                        specialty: prev.specialty || TECHNICIAN_SPECIALTIES_MASTER[0].value,
                        department: prev.department || TECHNICIAN_SERVICE_CENTERS[0].value,
                        assignedBuildingId: "",
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      createForm.role === Role.TECHNICIAN
                        ? "border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-500/20 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 transition ${
                        createForm.role === Role.TECHNICIAN
                          ? "bg-amber-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Hammer className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight">🛠️ ช่างซ่อมบำรุง</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Role: TECHNICIAN</span>
                  </button>

                  {/* Card 3: ADMIN (แอดมินงานอาคาร) */}
                  <button
                    type="button"
                    onClick={() =>
                      setCreateForm((prev) => ({
                        ...prev,
                        role: Role.ADMIN,
                        technicianCode: "",
                        specialty: "",
                        classLevel: "",
                        major: "",
                        position: prev.position || ADMIN_POSITIONS[0].value,
                        department: prev.department || ADMIN_DEPARTMENTS[0].value,
                        assignedBuildingId: prev.assignedBuildingId || (availableBuildings && availableBuildings[0]?.id) || "",
                      }))
                    }
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                      createForm.role === Role.ADMIN
                        ? "border-blue-600 bg-blue-50/70 text-blue-950 ring-2 ring-blue-500/20 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl mb-2 transition ${
                        createForm.role === Role.ADMIN
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Building className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight">🏢 แอดมินงานอาคาร</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Role: ADMIN</span>
                  </button>
                </div>
              </div>

              {/* ========================================================= */}
              {/* STEP 2: Dynamic Input Fields based on Role */}
              {/* ========================================================= */}

              {/* 2.1 Role USER (นักศึกษา / บุคลากร) */}
              {createForm.role === Role.USER && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs font-semibold">
                    <GraduationCap className="h-4 w-4 text-emerald-600" />
                    <span>ขั้นตอนที่ 2: กรอกข้อมูลนักศึกษา / บุคลากร (Student Details)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ชื่อ-นามสกุล */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="เช่น นายกิตติศักดิ์ พัฒนากุล"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* รหัสนักศึกษา */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสนักศึกษา (Student ID)
                      </label>
                      <input
                        type="text"
                        value={createForm.studentId || ""}
                        onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                        placeholder="เช่น 65-0482001 หรือ 66-021004"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* ระดับชั้น */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ระดับชั้น (Class Level)
                      </label>
                      <div className="relative">
                        <select
                          value={createForm.classLevel || ""}
                          onChange={(e) => setCreateForm({ ...createForm, classLevel: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer transition"
                        >
                          <option value="">--- กรุณาเลือกระดับชั้น ---</option>
                          {CLASS_LEVEL_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* แผนกวิชา (Cascading Master Dropdown) */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        แผนกวิชา (Department)
                      </label>
                      <div className="relative">
                        <select
                          value={createForm.department || ""}
                          onChange={(e) => {
                            const selectedDept = e.target.value;
                            setCreateForm({
                              ...createForm,
                              department: selectedDept,
                              major: "", // Reset สาขาวิชาทันทีเมื่อสลับแผนก
                            });
                          }}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer transition"
                        >
                          <option value="">--- กรุณาเลือกแผนกวิชา ---</option>
                          {ACADEMIC_DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* สาขาวิชา (Cascading Dependent Dropdown) */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>สาขาวิชา (Major)</span>
                        {!createForm.department && (
                          <span className="text-[10px] text-amber-600 font-normal">
                            (เลือกแผนกวิชาก่อน)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!createForm.department}
                          value={createForm.major || ""}
                          onChange={(e) => setCreateForm({ ...createForm, major: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer transition disabled:bg-slate-100/80 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          {!createForm.department ? (
                            <option value="">--- กรุณาเลือกแผนกวิชาก่อน ---</option>
                          ) : (
                            <>
                              <option value="">--- กรุณาเลือกสาขาวิชา ---</option>
                              {getMajorsByDepartment(createForm.department).map((major) => (
                                <option key={major} value={major}>
                                  {major}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* เบอร์โทรศัพท์มือถือ */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        เบอร์โทรศัพท์มือถือ
                      </label>
                      <input
                        type="text"
                        value={createForm.phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        placeholder="081-234-5678"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* อีเมลมหาวิทยาลัย */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        อีเมลมหาวิทยาลัย <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="student@campus.ac.th"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* รหัสผ่านเริ่มต้น */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>
                          รหัสผ่านเริ่มต้น (Default Password) <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400">อย่างน้อย 6 ตัวอักษร</span>
                      </label>
                      <div className="relative">
                        <Key className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          minLength={6}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          placeholder="Password123!"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2.2 Role TECHNICIAN (ช่างซ่อมบำรุง) */}
              {createForm.role === Role.TECHNICIAN && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-900 text-xs font-semibold">
                    <Hammer className="h-4 w-4 text-amber-600" />
                    <span>ขั้นตอนที่ 2: กรอกข้อมูลช่างซ่อมบำรุง (Technician Details)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ชื่อ-นามสกุล */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="เช่น นายช่างศักดา คงทน"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* รหัสช่าง */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสช่าง (Technician ID)
                      </label>
                      <input
                        type="text"
                        value={createForm.technicianCode || ""}
                        onChange={(e) =>
                          setCreateForm({
                            ...createForm,
                            technicianCode: e.target.value,
                            studentId: e.target.value,
                          })
                        }
                        placeholder="เช่น #08 หรือ TECH-12 (เว้นว่างเพื่อรันเลขอัตโนมัติ)"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* สายงานความเชี่ยวชาญหลัก */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        สายงานความเชี่ยวชาญหลัก <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={createForm.specialty || TECHNICIAN_SPECIALTIES_MASTER[0].value}
                          onChange={(e) => setCreateForm({ ...createForm, specialty: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {TECHNICIAN_SPECIALTIES_MASTER.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* ศูนย์ซ่อม / สังกัดงานอาคาร */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ศูนย์ซ่อม / สังกัดงานอาคาร <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={createForm.department || TECHNICIAN_SERVICE_CENTERS[0].value}
                          onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {TECHNICIAN_SERVICE_CENTERS.map((c) => (
                            <option key={c.value} value={c.value}>
                              🏢 {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* เบอร์โทรศัพท์ติดต่อด่วน */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        เบอร์โทรศัพท์ติดต่อด่วน
                      </label>
                      <input
                        type="text"
                        value={createForm.phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        placeholder="089-999-9999"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* อีเมลสำหรับรับงาน */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        อีเมลสำหรับรับงาน <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="tech.sakda@campus.ac.th"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* รหัสผ่านเริ่มต้น */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>
                          รหัสผ่านเริ่มต้น (Default Password) <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400">อย่างน้อย 6 ตัวอักษร</span>
                      </label>
                      <div className="relative">
                        <Key className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          minLength={6}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          placeholder="Password123!"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2.3 Role ADMIN (แอดมินงานอาคาร) */}
              {createForm.role === Role.ADMIN && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-900 text-xs font-semibold">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span>ขั้นตอนที่ 2: กรอกข้อมูลแอดมินงานอาคาร (Building Admin Details)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ชื่อ-นามสกุล */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="เช่น น.ส.กัญญา รักษ์อาคาร"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* อาคารที่รับผิดชอบหลัก (Assigned Building) */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>
                          อาคารที่รับผิดชอบหลัก (Assigned Building) <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-blue-600 font-medium">ผูกกับ Scoped Data Authorization</span>
                      </label>
                      <div className="relative">
                        <select
                          required
                          value={createForm.assignedBuildingId || ""}
                          onChange={(e) => setCreateForm({ ...createForm, assignedBuildingId: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          <option value="">-- กรุณาเลือกอาคารที่รับผิดชอบ --</option>
                          <option value="ALL">🏢 ทุกอาคาร (แอดมินส่วนกลาง / ไม่จำกัดอาคาร)</option>
                          {availableBuildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              📍 [{b.code}] {b.name} {b.adminId ? "(มีผู้ดูแลเดิมแล้ว)" : "(ว่าง)"}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Admin คนนี้จะมีสิทธิ์ดูสถิติและจ่ายงานซ่อมเฉพาะอาคารที่เลือกตามกฎความปลอดภัย
                      </p>
                    </div>

                    {/* รหัสบุคลากร */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสบุคลากร (Staff ID)
                      </label>
                      <input
                        type="text"
                        value={createForm.studentId || ""}
                        onChange={(e) => setCreateForm({ ...createForm, studentId: e.target.value })}
                        placeholder="เช่น ST-4401 หรือ ADM-02"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* ตำแหน่งงาน */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ตำแหน่งงาน (Position) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={createForm.position || ADMIN_POSITIONS[0].value}
                          onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {ADMIN_POSITIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* ฝ่าย / หน่วยงาน */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ฝ่าย / หน่วยงาน (Department) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={createForm.department || ADMIN_DEPARTMENTS[0].value}
                          onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {ADMIN_DEPARTMENTS.map((d) => (
                            <option key={d.value} value={d.value}>
                              🏢 {d.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {/* เบอร์โทรศัพท์ */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        เบอร์โทรศัพท์ติดต่อ
                      </label>
                      <input
                        type="text"
                        value={createForm.phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        placeholder="02-123-4567, 081-999-8888"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* อีเมล */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        อีเมลประจำตำแหน่ง <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="admin.facility@campus.ac.th"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* รหัสผ่านเริ่มต้น */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>
                          รหัสผ่านเริ่มต้น (Default Password) <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400">อย่างน้อย 6 ตัวอักษร</span>
                      </label>
                      <div className="relative">
                        <Key className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          minLength={6}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          placeholder="Password123!"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2.4 Role SUPER_ADMIN (ผู้ดูแลระบบสูงสุด) */}
              {createForm.role === Role.SUPER_ADMIN && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-900 text-xs font-semibold">
                    <Crown className="h-4 w-4 text-purple-600" />
                    <span>ขั้นตอนที่ 2: กรอกข้อมูลผู้ดูแลระบบสูงสุด (Super Admin Details)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        placeholder="เช่น ดร.ผู้ดูแล ระบบหลัก"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        อีเมลระบบ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={createForm.email}
                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                        placeholder="superadmin2@campus.ac.th"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        เบอร์โทรศัพท์
                      </label>
                      <input
                        type="text"
                        value={createForm.phone || ""}
                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                        placeholder="080-000-0000"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>
                          รหัสผ่านเริ่มต้น <span className="text-rose-500">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400">อย่างน้อย 6 ตัวอักษร</span>
                      </label>
                      <div className="relative">
                        <Key className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          minLength={6}
                          value={createForm.password}
                          onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                          placeholder="Password123!"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-mono font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm(initialCreateFormState);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกและสร้างผู้ใช้"}</span>
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. Modal: แก้ไขข้อมูลผู้ใช้ (Edit User Modal) */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    แก้ไขข้อมูลผู้ใช้งาน
                  </h2>
                  <p className="text-xs text-slate-500">
                    อัปเดตข้อมูลส่วนตัว บทบาท หรือรีเซ็ตรหัสผ่านสำหรับบัญชีนี้
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Name */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* 2. Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    อีเมลมหาวิทยาลัย <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* 3. Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="text"
                    value={editForm.phone || ""}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* 4. Role */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    บทบาทผู้ใช้ (Role)
                  </label>
                  <select
                    disabled={editingUser.id === currentUserId}
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value={Role.USER}>🎓 USER (นักศึกษา / บุคลากร)</option>
                    <option value={Role.TECHNICIAN}>🛠️ TECHNICIAN (ช่างซ่อมบำรุง)</option>
                    <option value={Role.ADMIN}>🏢 ADMIN (หัวหน้างานอาคารสถานที่)</option>
                    <option value={Role.SUPER_ADMIN}>👑 SUPER_ADMIN (ผู้ดูแลระบบสูงสุด)</option>
                  </select>
                </div>

                {/* Conditional Fields based on Role in Edit Modal */}
                {editForm.role === Role.USER && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสนักศึกษา (Student ID)
                      </label>
                      <input
                        type="text"
                        value={editForm.studentId || ""}
                        onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                        placeholder="เช่น 65-0482001"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ระดับชั้น (Class Level)
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.classLevel || ""}
                          onChange={(e) => setEditForm({ ...editForm, classLevel: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer transition"
                        >
                          <option value="">--- กรุณาเลือกระดับชั้น ---</option>
                          {CLASS_LEVEL_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        แผนกวิชา (Department)
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.department || ""}
                          onChange={(e) => {
                            const selectedDept = e.target.value;
                            setEditForm({
                              ...editForm,
                              department: selectedDept,
                              major: "", // Reset สาขาวิชาทันทีเมื่อสลับแผนก
                            });
                          }}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer transition"
                        >
                          <option value="">--- กรุณาเลือกแผนกวิชา ---</option>
                          {ACADEMIC_DEPARTMENTS.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>สาขาวิชา (Major)</span>
                        {!editForm.department && (
                          <span className="text-[10px] text-amber-600 font-normal">
                            (เลือกแผนกวิชาก่อน)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          disabled={!editForm.department}
                          value={editForm.major || ""}
                          onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-medium text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer transition disabled:bg-slate-100/80 disabled:text-slate-400 disabled:cursor-not-allowed"
                        >
                          {!editForm.department ? (
                            <option value="">--- กรุณาเลือกแผนกวิชาก่อน ---</option>
                          ) : (
                            <>
                              <option value="">--- กรุณาเลือกสาขาวิชา ---</option>
                              {getMajorsByDepartment(editForm.department).map((major) => (
                                <option key={major} value={major}>
                                  {major}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </>
                )}

                {editForm.role === Role.TECHNICIAN && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสช่าง (Technician ID)
                      </label>
                      <input
                        type="text"
                        value={editForm.technicianCode || editForm.studentId || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            technicianCode: e.target.value,
                            studentId: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        สายงานความเชี่ยวชาญหลัก
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.specialty || TECHNICIAN_SPECIALTIES_MASTER[0].value}
                          onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {TECHNICIAN_SPECIALTIES_MASTER.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ศูนย์ซ่อม / สังกัดงานอาคาร
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.department || TECHNICIAN_SERVICE_CENTERS[0].value}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {TECHNICIAN_SERVICE_CENTERS.map((c) => (
                            <option key={c.value} value={c.value}>
                              🏢 {c.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </>
                )}

                {editForm.role === Role.ADMIN && (
                  <>
                    {/* อาคารที่รับผิดชอบหลัก */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>อาคารที่รับผิดชอบหลัก (Assigned Building)</span>
                        <span className="text-[10px] text-blue-600 font-medium">Scoped Authorization</span>
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.assignedBuildingId || ""}
                          onChange={(e) => setEditForm({ ...editForm, assignedBuildingId: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          <option value="">-- ไม่ระบุ / ปลดการผูกอาคาร --</option>
                          <option value="ALL">🏢 ทุกอาคาร (แอดมินส่วนกลาง / ไม่จำกัดอาคาร)</option>
                          {availableBuildings.map((b) => (
                            <option key={b.id} value={b.id}>
                              📍 [{b.code}] {b.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสบุคลากร (Staff ID)
                      </label>
                      <input
                        type="text"
                        value={editForm.studentId || ""}
                        onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ตำแหน่งงาน (Position)
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.position || ADMIN_POSITIONS[0].value}
                          onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {ADMIN_POSITIONS.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ฝ่าย / หน่วยงาน (Department)
                      </label>
                      <div className="relative">
                        <select
                          value={editForm.department || ADMIN_DEPARTMENTS[0].value}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer appearance-none pr-8"
                        >
                          {ADMIN_DEPARTMENTS.map((d) => (
                            <option key={d.value} value={d.value}>
                              🏢 {d.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </>
                )}

                {editForm.role === Role.SUPER_ADMIN && (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        รหัสบุคลากร (Staff ID)
                      </label>
                      <input
                        type="text"
                        value={editForm.studentId || ""}
                        onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ตำแหน่งงาน (Position)
                      </label>
                      <input
                        type="text"
                        value={editForm.position || ""}
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        ฝ่าย / สำนักงาน (Department)
                      </label>
                      <input
                        type="text"
                        value={editForm.department || ""}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </>
                )}

                {/* Reset Password (Optional) */}
                <div className="sm:col-span-2 space-y-1 rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Lock className="h-3.5 w-3.5 text-blue-600" />
                    <span>ตั้งรหัสผ่านใหม่ (Reset Password)</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    เว้นว่างไว้หากต้องการใช้รหัสผ่านเดิม หรือกรอกอย่างน้อย 6 ตัวอักษรเพื่อเปลี่ยนรหัสผ่าน
                  </p>
                  <div className="relative mt-2">
                    <Key className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      minLength={6}
                      value={editForm.newPassword || ""}
                      onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                      className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-mono text-slate-800 focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</span>
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. Modal: ยืนยันการลบผู้ใช้ (Delete Confirmation Dialog) */}
      {/* ========================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Icon */}
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ยืนยันการลบผู้ใช้งาน
                </h3>
                <p className="text-xs text-slate-500">
                  การกระทำนี้ไม่สามารถย้อนกลับได้
                </p>
              </div>
            </div>

            {/* Target User Info */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {deletingUser.name}
                </p>
                {getRoleBadge(deletingUser.role)}
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {deletingUser.email}
              </p>
              {deletingUser.department && (
                <p className="text-[11px] text-slate-400">
                  สังกัด: {deletingUser.department}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              คุณแน่ใจหรือไม่ที่จะลบผู้ใช้นี้ออกจากระบบ? รายการตั๋วที่เคยแจ้งซ่อมหรือเคยได้รับมอบหมายจะถูกปลดความสัมพันธ์อย่างปลอดภัยโดยไม่ทำให้ข้อมูลระบบสูญหาย
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{isSubmitting ? "กำลังลบ..." : "ยืนยันการลบผู้ใช้"}</span>
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
