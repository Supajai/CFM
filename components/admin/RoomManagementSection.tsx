// components/admin/RoomManagementSection.tsx - Rooms & Facilities Management
"use client";

import React, { useState, useMemo } from "react";
import {
  DoorClosed,
  Plus,
  Edit3,
  Trash2,
  Search,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  DepartmentRoomItem,
  DepartmentRoomFormInput,
  createDepartmentRoomAction,
  updateDepartmentRoomAction,
  deleteDepartmentRoomAction,
} from "@/actions/room";

interface RoomManagementSectionProps {
  initialRooms: DepartmentRoomItem[];
}

const ROOM_TYPES = [
  { value: "LAB", label: "ห้องปฏิบัติการคอมพิวเตอร์ / แล็บ (LAB)" },
  { value: "CLASSROOM", label: "ห้องเรียนบรรยายทฤษฎี (CLASSROOM)" },
  { value: "OFFICE", label: "ห้องพักครู / สำนักงาน (OFFICE)" },
  { value: "FACILITY", label: "สุขภัณฑ์ / เซิร์ฟเวอร์ / ศูนย์เครื่องมือ (FACILITY)" },
  { value: "COMMON", label: "โถงกิจกรรม / พื้นที่ส่วนกลาง (COMMON)" },
];

export default function RoomManagementSection({ initialRooms }: RoomManagementSectionProps) {
  const [rooms, setRooms] = useState<DepartmentRoomItem[]>(initialRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>("ALL");

  // Alert State
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<DepartmentRoomItem | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<DepartmentRoomItem | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<DepartmentRoomFormInput>({
    code: "",
    name: "",
    floor: 1,
    type: "LAB",
    description: "",
    isActive: true,
  });

  // Filtered Rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = r.code.toLowerCase().includes(q);
        const matchName = r.name.toLowerCase().includes(q);
        const matchDesc = r.description?.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchDesc) return false;
      }
      if (selectedFloorFilter !== "ALL" && r.floor.toString() !== selectedFloorFilter) {
        return false;
      }
      return true;
    });
  }, [rooms, searchQuery, selectedFloorFilter]);

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormData({
      code: "",
      name: "",
      floor: 1,
      type: "LAB",
      description: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (room: DepartmentRoomItem) => {
    setEditingRoom(room);
    setFormData({
      code: room.code,
      name: room.name,
      floor: room.floor,
      type: room.type,
      description: room.description || "",
      isActive: room.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      if (editingRoom) {
        const res = await updateDepartmentRoomAction(editingRoom.id, formData);
        if (res.success && res.room) {
          setRooms((prev) =>
            prev.map((r) => (r.id === editingRoom.id ? res.room! : r))
          );
          setShowModal(false);
          setAlertMsg({ type: "success", text: `อัปเดตข้อมูลห้อง "${res.room.name}" สำเร็จ` });
        } else {
          setAlertMsg({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการอัปเดตห้อง" });
        }
      } else {
        const res = await createDepartmentRoomAction(formData);
        if (res.success && res.room) {
          setRooms((prev) => [...prev, res.room!]);
          setShowModal(false);
          setAlertMsg({ type: "success", text: `เพิ่มห้อง "${res.room.name}" สำเร็จเรียบร้อย` });
        } else {
          setAlertMsg({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการเพิ่มห้อง" });
        }
      }
    } catch (err: any) {
      setAlertMsg({ type: "error", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRoom) return;
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await deleteDepartmentRoomAction(deletingRoom.id);
      if (res.success) {
        setRooms((prev) => prev.filter((r) => r.id !== deletingRoom.id));
        setAlertMsg({ type: "success", text: `ลบห้อง "${deletingRoom.name}" สำเร็จ` });
        setDeletingRoom(null);
      } else {
        setAlertMsg({ type: "error", text: res.error || "เกิดข้อผิดพลาดในการลบห้อง" });
      }
    } catch (err: any) {
      setAlertMsg({ type: "error", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-white shadow-sm">
              <DoorClosed className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              การจัดการห้องและพื้นที่ภายในแผนก (Rooms & Facilities Management)
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            กำหนดฐานข้อมูลห้องปฏิบัติการ ห้องเรียนบรรยาย และพื้นที่ใช้งานประจำชั้น 1-4 ของอาคารแผนกคอมพิวเตอร์
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 text-xs font-medium shadow-[0_2px_8px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>เพิ่มห้อง / พื้นที่ใหม่</span>
        </button>
      </div>

      {/* Alert Messages */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs border shadow-2xs ${
            alertMsg.type === "success"
              ? "bg-emerald-50/90 text-emerald-800 border-emerald-200/80"
              : "bg-rose-50/90 text-rose-800 border-rose-200/80"
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{alertMsg.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertMsg(null)}
            className="p-1 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. Search & Floor Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาตามรหัสห้อง (เช่น Lab301) หรือชื่อห้อง..."
            className="w-full h-10 rounded-xl border border-slate-300/80 bg-white pl-10 pr-4 py-1 text-xs text-slate-900 shadow-2xs focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
          />
        </div>

        {/* Floor Filter */}
        <div className="flex items-center space-x-1 rounded-xl bg-slate-100/90 p-1 text-xs font-medium border border-slate-200/60 shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedFloorFilter("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
              selectedFloorFilter === "ALL"
                ? "bg-white text-slate-900 shadow-sm font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ทุกชั้น
          </button>
          {["1", "2", "3", "4"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setSelectedFloorFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all ${
                selectedFloorFilter === f
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ชั้น {f}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Rooms Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white/40">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3.5">รหัสห้อง (Code)</th>
              <th className="px-4 py-3.5">ชั้น</th>
              <th className="px-4 py-3.5">ชื่อห้อง / พื้นที่</th>
              <th className="px-4 py-3.5">ประเภท</th>
              <th className="px-4 py-3.5">ประวัติตั๋วงาน</th>
              <th className="px-4 py-3.5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRooms.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-3.5 font-mono">
                  <span className="font-mono text-xs font-semibold bg-slate-100 border border-slate-200/80 text-slate-800 px-2.5 py-1 rounded-md shadow-2xs">
                    {r.code}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-mono text-xs font-semibold rounded-lg bg-slate-100 px-2 py-0.5 text-slate-800 border border-slate-200/80">
                    ชั้น {r.floor}
                  </span>
                </td>
                <td className="px-4 py-3.5 max-w-xs">
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  {r.description && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {r.description}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200/80">
                    {r.type}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                    <span className="font-semibold text-slate-800">{r.ticketsCount || 0} เคส</span>
                    {(r.activeTicketsCount || 0) > 0 && (
                      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200 shadow-2xs">
                        {r.activeTicketsCount} ค้าง
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                      title="แก้ไขข้อมูลห้อง"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingRoom(r)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                      title="ลบห้องนี้"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-lg border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-800 text-white shadow-sm">
                  <DoorClosed className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {editingRoom ? "แก้ไขข้อมูลห้อง/พื้นที่" : "เพิ่มห้อง/พื้นที่ใหม่ในแผนก"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    อาคารแผนกเทคโนโลยีคอมพิวเตอร์
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    รหัสห้อง (Room Code) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="เช่น Lab301, ServerRoom, 201"
                    className="w-full h-10 rounded-xl border border-slate-300/80 bg-white px-3 py-1 font-mono text-xs text-slate-900 shadow-2xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ระดับชั้น <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: Number(e.target.value) })}
                    className="w-full h-10 rounded-xl border border-slate-300/80 bg-white px-3 py-1 text-xs font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {[1, 2, 3, 4].map((f) => (
                      <option key={f} value={f}>
                        ชั้น {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อห้อง / พื้นที่แสดงผล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ห้องปฏิบัติการพัฒนาซอฟต์แวร์และแอปพลิเคชัน (Lab 301)"
                  className="w-full h-10 rounded-xl border border-slate-300/80 bg-white px-3 py-1 text-xs text-slate-900 shadow-2xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ประเภทห้อง
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-300/80 bg-white px-3 py-1 text-xs font-medium text-slate-900 shadow-2xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                >
                  {ROOM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  รายละเอียด / อุปกรณ์ประจำห้อง
                </label>
                <textarea
                  rows={2}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="เช่น เวิร์กสเตชัน 40 เครื่อง, จอภาพ Dual-Display, เครื่องปรับอากาศ 4 ตัว..."
                  className="w-full rounded-xl border border-slate-300/80 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-[0.98] transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 font-medium shadow-[0_2px_8px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <span>{editingRoom ? "บันทึกการแก้ไข" : "เพิ่มห้องใหม่"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deletingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  ยืนยันการลบห้อง / พื้นที่
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  <span className="font-semibold text-slate-700">{deletingRoom.code}</span> • ชั้น {deletingRoom.floor}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              คุณต้องการลบ <strong>{deletingRoom.name}</strong> ออกจากฐานข้อมูลสถานที่ของแผนกหรือไม่?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200/80">
              <button
                type="button"
                onClick={() => setDeletingRoom(null)}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs active:scale-[0.98] transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center space-x-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-medium text-white shadow-2xs active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <span>ยืนยันลบห้องนี้</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
