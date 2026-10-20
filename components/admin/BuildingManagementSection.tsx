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
  Users,
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

  // Alert State
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingItem | null>(null);
  const [deletingBuilding, setDeletingBuilding] = useState<BuildingItem | null>(null);
  const [deleteTicketStats, setDeleteTicketStats] = useState<{
    totalTickets: number;
    activeTickets: number;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingTickets, setIsCheckingTickets] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BuildingFormInput>({
    code: "",
    name: "",
    zone: "โซนกลาง",
    totalFloors: 4,
    latitude: null,
    longitude: null,
    adminId: null,
  });

  // Filtered Buildings
  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = b.code.toLowerCase().includes(q);
        const matchName = b.name.toLowerCase().includes(q);
        const matchZone = b.zone.toLowerCase().includes(q);
        const matchAdmin = b.admin?.name.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchZone && !matchAdmin) return false;
      }
      if (selectedZoneFilter !== "ALL" && b.zone !== selectedZoneFilter) {
        return false;
      }
      return true;
    });
  }, [buildings, searchQuery, selectedZoneFilter]);

  // Unique Zones list for filter
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    buildings.forEach((b) => {
      if (b.zone) set.add(b.zone);
    });
    return Array.from(set);
  }, [buildings]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingBuilding(null);
    setFormData({
      code: "",
      name: "",
      zone: "โซนกลาง",
      totalFloors: 4,
      latitude: 15.2284,
      longitude: 104.8592,
      adminId: admins.length > 0 ? admins[0].id : null,
    });
    setShowModal(true);
  };

  // Open Edit Modal
  const openEditModal = (b: BuildingItem) => {
    setEditingBuilding(b);
    setFormData({
      code: b.code,
      name: b.name,
      zone: b.zone,
      totalFloors: b.totalFloors,
      latitude: b.latitude,
      longitude: b.longitude,
      adminId: b.adminId || null,
    });
    setShowModal(true);
  };

  // Open Delete Dialog with Ticket Check
  const openDeleteDialog = async (b: BuildingItem) => {
    setDeletingBuilding(b);
    setDeleteTicketStats(null);
    setIsCheckingTickets(true);

    try {
      const stats = await checkBuildingTicketsAction(b.id);
      if (stats.success) {
        setDeleteTicketStats({
          totalTickets: stats.totalTickets,
          activeTickets: stats.activeTickets,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCheckingTickets(false);
    }
  };

  // Geolocation Handler
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("เบราว์เซอร์ของคุณไม่รองรับการระบุพิกัด GPS");
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
        alert("ไม่สามารถดึงพิกัดได้ กรุณาอนุญาตการเข้าถึง Location ในเบราว์เซอร์");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Form Submit (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      if (editingBuilding) {
        // Update Building
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
        // Create Building
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
    <div className="space-y-6">
      {/* Alert Feedback */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs border animate-in fade-in duration-200 ${
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
            className="rounded-lg p-1 hover:bg-black/5 text-slate-500"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Buildings Card Container */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        {/* Header and Add Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">
                รายชื่ออาคารและสถานที่ในวิทยาเขต (Campus Buildings)
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              จัดการข้อมูลอาคาร พิกัด GPS แผนผังความรับผิดชอบ และกำหนดผู้ดูแลประจำอาคาร (Building Admin)
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="rounded-xl bg-purple-50 px-3 py-1.5 font-mono text-xs font-bold text-purple-700 border border-purple-200">
              {buildings.length} อาคารในระบบ
            </span>
            <button
              type="button"
              onClick={openCreateModal}
              className="flex items-center space-x-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>+ เพิ่มอาคารใหม่</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่ออาคาร, รหัส (BLD-..), โซน, หรือผู้ดูแล..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">กรองตามโซน:</span>
            <div className="relative">
              <select
                value={selectedZoneFilter}
                onChange={(e) => setSelectedZoneFilter(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">ทุกโซนพื้นที่ (All Zones)</option>
                {uniqueZones.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Building Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredBuildings.map((b) => (
            <div
              key={b.id}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200 p-4 space-y-3"
            >
              {/* Card Top: Code, Zone & Actions */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {b.code}
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {b.zone}
                  </span>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                    title="แก้ไขข้อมูลอาคาร"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(b)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="ลบอาคาร"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Building Name & Details */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-purple-900 transition leading-snug">
                  {b.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    <span>{b.totalFloors} ชั้น</span>
                  </span>
                  {b.latitude && b.longitude && (
                    <span className="flex items-center space-x-1 font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                      <span>
                        {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Building Admin Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {b.admin ? (
                  <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2 py-1 rounded-xl border border-emerald-200/70 w-full truncate">
                    <User className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-[11px]">ผู้ดูแล: {b.admin.name}</span>
                      {b.admin.phone && (
                        <span className="text-[10px] text-slate-500 font-mono ml-1">
                          ({b.admin.phone})
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-slate-500 bg-slate-100/80 px-2 py-1 rounded-xl w-full">
                    <Shield className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-[11px] font-medium text-slate-500 truncate">
                      ยังไม่ได้กำหนดผู้ดูแล (ส่วนกลาง)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredBuildings.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              ไม่พบอาคารที่ตรงกับเงื่อนไขการค้นหา
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* Modal: เพิ่ม / แก้ไขอาคาร (Add / Edit Modal) */}
      {/* ========================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="flex min-h-full items-center justify-center py-6">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {editingBuilding ? "แก้ไขข้อมูลอาคาร" : "เพิ่มอาคารใหม่เข้าสู่ระบบ"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      กำหนดรหัส ชื่อ โซนที่ตั้ง และมอบหมายแอดมินประจำอาคาร
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 1. Code */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      รหัสอาคาร (Building Code) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="เช่น BLD-03 หรือ WS-04"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 font-mono text-xs font-bold text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none uppercase"
                    />
                  </div>

                  {/* 2. Total Floors */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* 3. Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ชื่ออาคารและสถานที่ (Building Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-slate-400 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* 4. Zone */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      โซนพื้นที่ (Zone) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.zone}
                        onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer"
                      >
                        {COMMON_ZONES.map((z) => (
                          <option key={z} value={z}>
                            {z}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* 5. Building Admin Assignment */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      ผู้ดูแลอาคาร (Building Admin)
                    </label>
                    <div className="relative">
                      <select
                        value={formData.adminId || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, adminId: e.target.value || null })
                        }
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs font-semibold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer"
                      >
                        <option value="">--- ไม่ระบุ / แอดมินกลาง ---</option>
                        {admins.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.position || a.department || "Admin งานอาคาร"})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* 6. GPS Coordinates Section */}
                  <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <MapPin className="h-3.5 w-3.5 text-purple-600" />
                        <span>พิกัด GPS อ้างอิง (อุปกรณ์ / ละติจูด-ลองจิจูด)</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={isLocating}
                        className="flex items-center space-x-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-semibold text-purple-700 border border-purple-200 hover:bg-purple-50 transition active:scale-95 disabled:opacity-50"
                      >
                        {isLocating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Crosshair className="h-3 w-3" />
                        )}
                        <span>{isLocating ? "กำลังค้นหา..." : "จับพิกัดปัจจุบัน"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] text-slate-400">ละติจูด (Latitude)</label>
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
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400">ลองจิจูด (Longitude)</label>
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
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-800 focus:border-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    ยืนยันการลบข้อมูลอาคาร
                  </h3>
                  <p className="text-xs text-slate-500">
                    การกระทำนี้จะนำอาคารออกจากรายชื่อสถานที่ในวิทยาเขต
                  </p>
                </div>
              </div>

              {/* Target Building Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {deletingBuilding.code}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{deletingBuilding.zone}</span>
                </div>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {deletingBuilding.name}
                </p>
                <p className="text-[11px] text-slate-400">
                  จำนวน {deletingBuilding.totalFloors} ชั้น • ผู้ดูแล:{" "}
                  {deletingBuilding.admin?.name || "ยังไม่ได้กำหนดผู้ดูแล"}
                </p>
              </div>

              {/* Ticket Safety Warning */}
              {isCheckingTickets ? (
                <div className="flex items-center justify-center space-x-2 py-3 text-xs text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span>กำลังตรวจสอบรายการแจ้งซ่อมที่เกี่ยวข้อง...</span>
                </div>
              ) : deleteTicketStats ? (
                deleteTicketStats.activeTickets > 0 ? (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 space-y-1 text-xs text-amber-900">
                    <p className="font-bold flex items-center space-x-1.5 text-amber-800">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span>พบตั๋วแจ้งซ่อมค้างอยู่ ({deleteTicketStats.activeTickets} รายการ)</span>
                    </p>
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      อาคารนี้มีรายการแจ้งซ่อมที่ยังดำเนินการไม่เสร็จสิ้นจำนวน{" "}
                      <strong>{deleteTicketStats.activeTickets}</strong> รายการ (จากทั้งหมด{" "}
                      {deleteTicketStats.totalTickets} รายการ)
                      หากลบอาคารออก ตั๋วที่มีอยู่จะยังคงอยู่ในระบบแต่จะไม่สามารถเลือกอาคารนี้ในการแจ้งใหม่ได้
                    </p>
                  </div>
                ) : deleteTicketStats.totalTickets > 0 ? (
                  <div className="rounded-2xl bg-slate-100 p-3 text-xs text-slate-600">
                    อาคารนี้มีประวัติการแจ้งซ่อมที่เสร็จสิ้นแล้วทั้งหมด {deleteTicketStats.totalTickets} รายการ
                  </div>
                ) : (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                    ไม่มีรายการแจ้งซ่อมค้างอยู่ในอาคารนี้ สามารถลบได้อย่างปลอดภัย
                  </div>
                )
              ) : null}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeletingBuilding(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition active:scale-95 disabled:opacity-50"
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
