// components/admin/BuildingManagementSection.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Building,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  User,
  Search,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Shield,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  BuildingItem,
  AdminUserOption,
  BuildingFormInput,
  createBuildingAction,
  updateBuildingAction,
  deleteBuildingAction,
  checkBuildingTicketsAction,
} from "@/actions/building";

interface BuildingManagementSectionProps {
  initialBuildings: BuildingItem[];
  admins: AdminUserOption[];
}

const COMMON_ZONES = [
  "โซนกลาง",
  "โซนตะวันตก",
  "โซนตะวันออก",
  "โซนเหนือ",
  "โซนใต้",
  "โซนปฏิบัติการ",
  "โซนหอพัก",
  "โซนสนามกีฬา",
];

export default function BuildingManagementSection({
  initialBuildings,
  admins,
}: BuildingManagementSectionProps) {
  const [buildings, setBuildings] = useState<BuildingItem[]>(initialBuildings);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>("ALL");

  // Alert Banner State
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingItem | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<BuildingItem | null>(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isCheckingTickets, setIsCheckingTickets] = useState(false);
  const [deleteTicketStats, setDeleteTicketStats] = useState<{
    totalTickets: number;
    activeTickets: number;
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState<BuildingFormInput>({
    code: "",
    name: "",
    zone: "โซนกลาง",
    totalFloors: 1,
    adminId: null,
    latitude: null,
    longitude: null,
  });

  // Unique Zones for Filter
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    buildings.forEach((b) => {
      if (b.zone) set.add(b.zone);
    });
    return Array.from(set);
  }, [buildings]);

  // Filtered Buildings
  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = b.code.toLowerCase().includes(query);
        const matchName = b.name.toLowerCase().includes(query);
        const matchZone = b.zone?.toLowerCase().includes(query);
        const matchAdmin = b.admin?.name.toLowerCase().includes(query);
        if (!matchCode && !matchName && !matchZone && !matchAdmin) return false;
      }
      if (selectedZoneFilter !== "ALL" && b.zone !== selectedZoneFilter) {
        return false;
      }
      return true;
    });
  }, [buildings, searchQuery, selectedZoneFilter]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingBuilding(null);
    setFormData({
      code: "",
      name: "",
      zone: "โซนกลาง",
      totalFloors: 1,
      adminId: null,
      latitude: null,
      longitude: null,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (building: BuildingItem) => {
    setEditingBuilding(building);
    setFormData({
      code: building.code,
      name: building.name,
      zone: building.zone || "โซนกลาง",
      totalFloors: building.totalFloors,
      adminId: building.adminId || null,
      latitude: building.latitude || null,
      longitude: building.longitude || null,
    });
    setShowModal(true);
  };

  // Open Delete Confirmation
  const openDeleteDialog = async (building: BuildingItem) => {
    setDeletingBuilding(building);
    setDeleteTicketStats(null);
    setIsCheckingTickets(true);
    try {
      const stats = await checkBuildingTicketsAction(building.id);
      setDeleteTicketStats(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingTickets(false);
    }
  };

  // Handle Geolocation capture
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการดึงพิกัด GPS อัตโนมัติ");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(pos.coords.latitude.toFixed(6)),
          longitude: parseFloat(pos.coords.longitude.toFixed(6)),
        }));
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        alert(`ไม่สามารถดึงพิกัดได้: ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Submit Create / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      if (editingBuilding) {
        const res = await updateBuildingAction(editingBuilding.id, formData);
        if (res.success && res.building) {
          setBuildings((prev) =>
            prev.map((b) => (b.id === editingBuilding.id ? res.building! : b))
          );
          setShowModal(false);
          setAlertMsg({
            type: "success",
            text: `อัปเดตข้อมูลอาคาร "${res.building.name} (${res.building.code})" สำเร็จเรียบร้อยแล้ว`,
          });
        } else {
          setAlertMsg({ type: "error", text: res.error || "ไม่สามารถอัปเดตข้อมูลอาคารได้" });
        }
      } else {
        const res = await createBuildingAction(formData);
        if (res.success && res.building) {
          setBuildings((prev) => [...prev, res.building!]);
          setShowModal(false);
          setAlertMsg({
            type: "success",
            text: `เพิ่มอาคารใหม่ "${res.building.name} (${res.building.code})" เรียบร้อยแล้ว`,
          });
        } else {
          setAlertMsg({ type: "error", text: res.error || "ไม่สามารถเพิ่มอาคารได้" });
        }
      }
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingBuilding) return;
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await deleteBuildingAction(deletingBuilding.id);
      if (res.success) {
        setBuildings((prev) => prev.filter((b) => b.id !== deletingBuilding.id));
        setAlertMsg({
          type: "success",
          text: res.message || `ลบอาคาร "${deletingBuilding.name}" เรียบร้อยแล้ว`,
        });
        setDeletingBuilding(null);
      } else {
        setAlertMsg({ type: "error", text: res.error || "ไม่สามารถลบอาคารได้" });
      }
    } catch (err: any) {
      console.error(err);
      setAlertMsg({ type: "error", text: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Alert Feedback */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between rounded-md p-3 text-xs border ${
            alertMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
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
            className="rounded p-1 hover:bg-black/5 text-zinc-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Buildings Card Container */}
      <div className="card-elevated p-6 sm:p-7 space-y-5">
        {/* Header and Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Building className="h-4.5 w-4.5 stroke-[1.75]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                รายชื่ออาคารและสถานที่ในวิทยาเขต (Campus Buildings)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              จัดการข้อมูลอาคาร พิกัด GPS แผนผังความรับผิดชอบ และกำหนดผู้ดูแลประจำอาคาร (Building Admin)
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="chip-tech text-xs bg-slate-100 text-slate-800 border-slate-200">
              {buildings.length} อาคารในระบบ
            </span>
            <button
              type="button"
              onClick={openCreateModal}
              className="btn-primary-gradient flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold"
            >
              <Plus className="h-4 w-4 stroke-[2]" />
              <span>เพิ่มอาคารใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400 stroke-[1.75]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่ออาคาร, รหัส (BLD-..), โซน, หรือผู้ดูแล..."
              className="w-full h-9 rounded-xl border border-slate-200/90 bg-slate-50/80 pl-9 pr-3 py-1 text-xs font-medium text-slate-900 shadow-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">กรองตามโซน:</span>
            <div className="relative">
              <select
                value={selectedZoneFilter}
                onChange={(e) => setSelectedZoneFilter(e.target.value)}
                className="h-9 appearance-none rounded-xl border border-slate-200/90 bg-white px-3 pr-8 text-xs font-semibold text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
              >
                <option value="ALL">ทุกโซนพื้นที่ (All Zones)</option>
                {uniqueZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
            </div>
          </div>
        </div>

        {/* Building Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredBuildings.map((b) => (
            <div
              key={b.id}
              className="card-elevated flex flex-col justify-between p-4 sm:p-5 space-y-3.5 hover:border-emerald-500/50 hover:shadow-md transition-all group"
            >
              {/* Card Top: Code, Zone & Actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="chip-tech text-xs bg-slate-100 text-slate-900 border-slate-200 font-bold">
                    {b.code}
                  </span>
                  <span className="rounded-lg bg-slate-100/80 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200/80">
                    {b.zone}
                  </span>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition"
                    title="แก้ไขข้อมูลอาคาร"
                  >
                    <Edit3 className="h-3.5 w-3.5 stroke-[1.75]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(b)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="ลบอาคาร"
                  >
                    <Trash2 className="h-3.5 w-3.5 stroke-[1.75]" />
                  </button>
                </div>
              </div>

              {/* Building Name & Details */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                  {b.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1 font-medium">
                    <Layers className="h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
                    <span>{b.totalFloors} ชั้น</span>
                  </span>
                  {b.latitude && b.longitude && (
                    <span className="chip-tech text-[10px] py-0 px-1.5 bg-white text-slate-600 border-slate-200">
                      <MapPin className="h-3 w-3 text-emerald-600 stroke-[1.75] inline mr-1" />
                      {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Building Admin Badge */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                {b.admin ? (
                  <div className="flex items-center space-x-2 text-emerald-900 bg-emerald-50/90 px-2.5 py-1.5 rounded-xl border border-emerald-200/90 w-full truncate">
                    <User className="h-3.5 w-3.5 text-emerald-600 shrink-0 stroke-[1.75]" />
                    <div className="truncate">
                      <span className="font-bold text-[11px]">ผู้ดูแล: {b.admin.name}</span>
                      {b.admin.phone && (
                        <span className="text-[10px] text-slate-500 font-mono ml-1">
                          ({b.admin.phone})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-slate-500 bg-slate-100/80 px-2.5 py-1.5 rounded-xl border border-slate-200/90 w-full">
                    <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0 stroke-[1.75]" />
                    <span className="text-[11px] font-medium text-slate-500 truncate">
                      ยังไม่ได้กำหนดผู้ดูแล (ส่วนกลาง)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredBuildings.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400 font-medium">
              ไม่พบอาคารที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Modal: เพิ่ม / แก้ไขอาคาร (Add / Edit Modal) */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="w-full max-w-lg card-elevated p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-800 text-white shadow-sm">
                    <Building className="h-5 w-5 stroke-[1.75]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                      {editingBuilding ? "แก้ไขข้อมูลอาคาร" : "เพิ่มอาคารใหม่เข้าสู่ระบบ"}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      กำหนดรหัส ชื่อ โซนที่ตั้ง และมอบหมายแอดมินประจำอาคาร
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-4 w-4 stroke-[1.75]" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* 1. Code */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      รหัสอาคาร (Building Code) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="เช่น BLD-03 หรือ WS-04"
                      className="w-full h-9 rounded-xl border border-slate-200/90 bg-white px-3 py-1 font-mono text-xs font-bold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 uppercase"
                    />
                  </div>

                  {/* 2. Total Floors */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      จำนวนชั้น (Floors) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={formData.totalFloors}
                      onChange={(e) =>
                        setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 1 })
                      }
                      placeholder="เช่น 4"
                      className="w-full h-9 rounded-xl border border-slate-200/90 bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* 3. Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700">
                      ชื่ออาคารและสถานที่ (Building Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์"
                      className="w-full h-9 rounded-xl border border-slate-200/90 bg-white px-3 py-1 text-xs font-medium text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {/* 4. Zone */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      โซนพื้นที่ (Zone) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.zone}
                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        className="w-full h-9 appearance-none rounded-xl border border-slate-200/90 bg-white px-3 pr-8 text-xs font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        {COMMON_ZONES.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
                    </div>
                  </div>

                  {/* 5. Building Admin Assignment */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">
                      ผู้ดูแลอาคาร (Building Admin)
                    </label>
                    <div className="relative">
                      <select
                        value={formData.adminId || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, adminId: e.target.value || null })
                        }
                        className="w-full h-9 appearance-none rounded-xl border border-slate-200/90 bg-white px-3 pr-8 text-xs font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                      >
                        <option value="">--- ไม่ระบุ / แอดมินกลาง ---</option>
                        {admins.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.position || a.department || "Admin งานอาคาร"})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-3.5 w-3.5 text-slate-400 stroke-[1.75]" />
                    </div>
                  </div>

                  {/* 6. GPS Coordinates Section */}
                  <div className="sm:col-span-2 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 stroke-[1.75]" />
                        <span>พิกัด GPS อ้างอิง</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="flex items-center space-x-1 rounded-xl bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 border border-slate-200/90 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                      >
                        {isLocating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Crosshair className="h-3 w-3 text-emerald-600 stroke-[1.75]" />
                        )}
                        <span>{isLocating ? "กำลังค้นหา..." : "จับพิกัดปัจจุบัน"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold">ละติจูด (Latitude)</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.latitude ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              latitude: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          placeholder="เช่น 15.2284"
                          className="w-full h-8 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold">ลองจิจูด (Longitude)</label>
                        <input
                          type="number"
                          step="any"
                          value={formData.longitude ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              longitude: e.target.value ? parseFloat(e.target.value) : null,
                            })
                          }
                          placeholder="เช่น 104.8592"
                          className="w-full h-8 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 font-mono text-xs text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary-gradient flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูลอาคาร"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Modal: ยืนยันการลบอาคาร (Delete Confirmation Dialog) */}
      {/* ========================================================= */}
      {deletingBuilding && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="w-full max-w-md card-elevated p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              {/* Header Icon */}
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-rose-50 text-rose-600 border border-rose-200 shadow-sm">
                  <AlertTriangle className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    ยืนยันการลบข้อมูลอาคาร
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    การกระทำนี้จะนำอาคารออกจากรายชื่อสถานที่ในวิทยาเขต
                  </p>
                </div>
              </div>

              {/* Target Building Info */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="chip-tech text-xs bg-slate-200 text-slate-900 border-slate-300 font-bold">
                    {deletingBuilding.code}
                  </span>
                  <span className="text-xs text-slate-600 font-semibold">{deletingBuilding.zone}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {deletingBuilding.name}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  จำนวน {deletingBuilding.totalFloors} ชั้น • ผู้ดูแล:{" "}
                  {deletingBuilding.admin?.name || "ยังไม่ได้กำหนดผู้ดูแล"}
                </p>
              </div>

              {/* Ticket Safety Warning */}
              {isCheckingTickets ? (
                <div className="flex items-center justify-center space-x-2 py-3 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  <span>กำลังตรวจสอบรายการแจ้งซ่อมที่เกี่ยวข้อง...</span>
                </div>
              ) : deleteTicketStats ? (
                deleteTicketStats.activeTickets > 0 ? (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 space-y-1 text-xs text-amber-900">
                    <p className="font-bold flex items-center space-x-1.5 text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600 stroke-[1.75]" />
                      <span>พบตั๋วแจ้งซ่อมค้างอยู่ ({deleteTicketStats.activeTickets} รายการ)</span>
                    </p>
                    <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                      อาคารนี้มีรายการแจ้งซ่อมที่ยังดำเนินการไม่เสร็จสิ้นจำนวน{" "}
                      <strong>{deleteTicketStats.activeTickets}</strong> รายการ
                    </p>
                  </div>
                ) : deleteTicketStats.totalTickets > 0 ? (
                  <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 border border-slate-200 font-medium">
                    อาคารนี้มีประวัติการแจ้งซ่อมที่เสร็จสิ้นแล้วทั้งหมด {deleteTicketStats.totalTickets} รายการ
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
                    ไม่มีรายการแจ้งซ่อมค้างอยู่ในอาคารนี้ สามารถลบได้อย่างปลอดภัย
                  </div>
                )
              ) : null}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingBuilding(null)}
                  className="rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{isSubmitting ? "กำลังลบ..." : "ยืนยันการลบอาคาร"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

