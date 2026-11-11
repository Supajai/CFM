// components/building/RoomAssetInspector.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Monitor,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Wrench,
  Tv,
  Snowflake,
  Zap,
  Info,
  X,
  Search,
  Filter,
  Layers,
  Cpu,
  HardDrive,
  Wifi,
  ExternalLink,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";

export type AssetStatus = "NORMAL" | "WARNING" | "CRITICAL";

export interface AssetInfo {
  id: string;
  code: string;
  name: string;
  row?: number;
  col?: number;
  type: "pc" | "teacher_pc" | "projector" | "ac" | "power" | "screen";
  status: AssetStatus;
  issueDescription?: string;
  reportedAt?: string;
  ticketId?: string;
  ticketNumber?: string;
  specs: {
    cpu?: string;
    ram?: string;
    storage?: string;
    display?: string;
    ipAddress?: string;
    details?: string;
  };
}

export type InspectorRole =
  | "USER"
  | "STUDENT"
  | "STAFF"
  | "TECHNICIAN"
  | "ADMIN"
  | "SUPER_ADMIN"
  | (string & {});

export interface RoomAssetInspectorProps {
  roomId?: string;
  roomName?: string;
  floor?: number;
  onBack: () => void;
  onSelectAsset?: (asset: AssetInfo) => void;
  currentRole?: "USER" | "STUDENT" | "STAFF" | "TECHNICIAN" | "ADMIN" | string;
  currentUserRole?: string;
}

// =====================================================================
// Mock Data Generator for Lab Room 322 (40 Student PCs + Room Peripherals)
// =====================================================================
function generateRoom322Assets(): AssetInfo[] {
  const assets: AssetInfo[] = [];

  // 1. Front of Classroom (อุปกรณ์หน้าห้อง)
  assets.push({
    id: "TEACHER-PC",
    code: "TEACHER-PC",
    name: "เครื่องคอมพิวเตอร์อาจารย์ผู้สอน",
    type: "teacher_pc",
    status: "NORMAL",
    specs: {
      cpu: "Intel Core i7-13700",
      ram: "32 GB DDR5",
      storage: "1 TB NVMe SSD",
      display: "Dual 27\" IPS 4K",
      ipAddress: "192.168.22.10",
      details: "เครื่องควบคุมระบบฉายภาพและแม่ข่ายสื่อการสอนประจำห้อง",
    },
  });

  assets.push({
    id: "PRJ-322",
    code: "PRJ-322",
    name: "โปรเจกเตอร์ฉายภาพเพดานหน้าห้อง",
    type: "projector",
    status: "WARNING",
    issueDescription: "หลอดภาพโปรเจกเตอร์เริ่มดรอป / ระบบแจ้งเตือน Lamp Life > 90% แสงเริ่มสลัว",
    reportedAt: "เมื่อ 2 ชั่วโมงที่แล้ว",
    ticketNumber: "#REP-322-PRJ",
    specs: {
      details: "Epson Laser Projector 4,500 Lumens WUXGA",
      display: "ฉายขึ้นจอรับภาพกึ่งกลางห้องขนาด 120 นิ้ว",
    },
  });

  assets.push({
    id: "DISP-322",
    code: "DISP-322",
    name: "จอภาพกระดานอัจฉริยะ (Smart Whiteboard)",
    type: "screen",
    status: "NORMAL",
    specs: {
      details: "Interactive Touch Screen 75 นิ้ว 4K รองรับปากกาสไตลัส",
    },
  });

  // 2. 40 Student Workstations (4 Rows x 10 PCs = PC-01 to PC-40)
  for (let row = 1; row <= 4; row++) {
    for (let col = 1; col <= 10; col++) {
      const pcNumber = (row - 1) * 10 + col;
      const code = `PC-${pcNumber.toString().padStart(2, "0")}`;
      let status: AssetStatus = "NORMAL";
      let issueDescription: string | undefined;
      let ticketNumber: string | undefined;
      let reportedAt: string | undefined;

      // เครื่องจำลองปัญหาตามโจทย์
      if (code === "PC-14") {
        status = "WARNING";
        issueDescription = "สายสัญญาณ HDMI หลวม / ภาพหน้าจอสั่นกระพริบเมื่อขยับโต๊ะ";
        ticketNumber = "#REP-093";
        reportedAt = "วันนี้ 10:45 น.";
      } else if (code === "PC-28") {
        status = "CRITICAL";
        issueDescription = "เครื่องเปิดไม่ติด / พาวเวอร์ซัพพลาย (PSU) เสีย มีเสียงช็อตและกลิ่นไหม้";
        ticketNumber = "#REP-088";
        reportedAt = "เมื่อวาน 16:30 น.";
      }

      assets.push({
        id: `322-${code}`,
        code,
        name: `คอมพิวเตอร์นักศึกษา ${code}`,
        row,
        col,
        type: "pc",
        status,
        issueDescription,
        ticketNumber,
        reportedAt,
        specs: {
          cpu: "Intel Core i5-12400 (6C / 12T)",
          ram: "16 GB DDR4 3200MHz",
          storage: "512 GB M.2 NVMe SSD",
          display: "Dell Professional 24\" IPS FHD (75Hz)",
          ipAddress: `192.168.22.${100 + pcNumber}`,
          details: `ประจำแถวที่ ${row} เครื่องที่ ${col} (เชื่อมต่อระบบ Gigabit LAN)`,
        },
      });
    }
  }

  // 3. Room Peripherals (อุปกรณ์รอบห้อง)
  assets.push({
    id: "AC-322-1",
    code: "AC-01",
    name: "เครื่องปรับอากาศ 1 (ฝั่งทิศตะวันตก)",
    type: "ac",
    status: "NORMAL",
    specs: {
      details: "Daikin Inverter Cassette Type 24,000 BTU",
    },
  });

  assets.push({
    id: "AC-322-2",
    code: "AC-02",
    name: "เครื่องปรับอากาศ 2 (ฝั่งทิศตะวันออก)",
    type: "ac",
    status: "NORMAL",
    specs: {
      details: "Daikin Inverter Cassette Type 24,000 BTU",
    },
  });

  assets.push({
    id: "PWR-322",
    code: "PWR-MAIN",
    name: "ตู้ควบคุมไฟฟ้าหลักประจำห้องแล็บ",
    type: "power",
    status: "NORMAL",
    specs: {
      details: "ตู้เบรกเกอร์ Schneider 3-Phase 50A พร้อมระบบตัดไฟฉุกเฉิน (Emergency E-Stop)",
    },
  });

  return assets;
}

export default function RoomAssetInspector({
  roomId = "02-322",
  roomName = "ห้องปฏิบัติการคอมพิวเตอร์ 322",
  floor = 2,
  onBack,
  onSelectAsset,
  currentRole,
  currentUserRole = "USER",
}: RoomAssetInspectorProps) {
  const role = (currentRole || currentUserRole || "USER").toUpperCase();
  const isTechnician = role === "TECHNICIAN";

  const [assets] = useState<AssetInfo[]>(() => generateRoom322Assets());
  const [selectedAsset, setSelectedAsset] = useState<AssetInfo | null>(null);
  const [filterType, setFilterType] = useState<"ALL" | "PCS" | "ISSUES">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // คำนวณสถิติสถานะอุปกรณ์
  const stats = useMemo(() => {
    const normalCount = assets.filter((a) => a.status === "NORMAL").length;
    const warningCount = assets.filter((a) => a.status === "WARNING").length;
    const criticalCount = assets.filter((a) => a.status === "CRITICAL").length;
    return {
      total: assets.length,
      normal: normalCount,
      warning: warningCount,
      critical: criticalCount,
      hasIssues: warningCount + criticalCount > 0,
    };
  }, [assets]);

  // ฟิลเตอร์คอมพิวเตอร์ 40 เครื่อง
  const studentPcs = useMemo(() => {
    return assets.filter((a) => a.type === "pc");
  }, [assets]);

  // อุปกรณ์หน้าห้อง
  const frontAssets = useMemo(() => {
    return assets.filter((a) => a.type === "teacher_pc" || a.type === "projector" || a.type === "screen");
  }, [assets]);

  // อุปกรณ์เสริมรอบห้อง
  const peripheralAssets = useMemo(() => {
    return assets.filter((a) => a.type === "ac" || a.type === "power");
  }, [assets]);

  // คัดกรองตาม Search Query และ Tab Filter
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch =
        a.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.issueDescription && a.issueDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchSearch) return false;
      if (filterType === "PCS") return a.type === "pc" || a.type === "teacher_pc";
      if (filterType === "ISSUES") return a.status === "WARNING" || a.status === "CRITICAL";
      return true;
    });
  }, [assets, searchQuery, filterType]);

  const handleAssetClick = (asset: AssetInfo) => {
    setSelectedAsset(asset);
    onSelectAsset?.(asset);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Bar สไตล์ Mappedin Minimalist */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95 cursor-pointer shrink-0"
            title="กลับไปยังมุมมองผังอาคาร 2.5D"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">กลับไปแผนผังอาคาร</span>
            <span className="sm:hidden">กลับ</span>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip-tech text-[11px] font-bold py-0.5 px-2 bg-slate-900 text-white border-slate-800">
                [{floor}F] {roomId}
              </span>
              <span className="chip-tech text-[10px] py-0.5 px-2 bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                🖥️ แผนผังอุปกรณ์ดิจิทัลทวิน
              </span>
              <span className={`chip-tech text-[10px] py-0.5 px-2 font-semibold ${
                isTechnician
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}>
                บทบาท: {role}
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                40 ที่นั่งนักศึกษา • ห้องปฏิบัติการคอมพิวเตอร์
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1 leading-snug">
              {roomName}
            </h1>
          </div>
        </div>

        {/* Badge Counters: สรุปสถานะอุปกรณ์ */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>ปกติ {stats.normal}</span>
          </div>

          {stats.warning > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/90 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>แจ้งเตือน {stats.warning}</span>
            </div>
          )}

          {stats.critical > 0 && (
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs">
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
              </span>
              <span className="h-2 w-2 rounded-full bg-rose-600" />
              <span>ชำรุด {stats.critical}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Control Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัสเครื่อง เช่น PC-14, PC-28 หรืออาการเสีย..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 self-start sm:self-auto bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1 rounded-lg transition-all font-medium cursor-pointer ${
              filterType === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            ทั้งหมด ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("PCS")}
            className={`px-3 py-1 rounded-lg transition-all font-medium cursor-pointer ${
              filterType === "PCS" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            คอมพิวเตอร์ (41)
          </button>
          <button
            type="button"
            onClick={() => setFilterType("ISSUES")}
            className={`px-3 py-1 rounded-lg transition-all font-medium cursor-pointer flex items-center gap-1 ${
              filterType === "ISSUES"
                ? "bg-rose-500 text-white shadow-xs font-bold"
                : "text-rose-700 hover:text-rose-900"
            }`}
          >
            <span>มีปัญหา</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {stats.warning + stats.critical}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Main Classroom Canvas: ผังจำลองห้องปฏิบัติการจริง */}
      <div className="relative bg-slate-50/80 rounded-3xl border border-slate-200 p-4 sm:p-7 shadow-sm overflow-hidden">
        {/* Subtle dot background grid */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative z-10 space-y-7 max-w-5xl mx-auto">
          {/* โซนหน้าห้อง (Front of Classroom: Screen, Projector, Teacher Station) */}
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-2">
              <span className="w-12 h-px bg-slate-200" />
              <span>โซนหน้าห้องเรียน (Front of Room / Teacher Stage)</span>
              <span className="w-12 h-px bg-slate-200" />
            </div>

            <div className="flex flex-wrap items-center justify-around gap-4">
              {frontAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                const isWarning = asset.status === "WARNING";
                const isCritical = asset.status === "CRITICAL";

                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleAssetClick(asset)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50/80 border-blue-300 shadow-sm"
                        : isCritical
                        ? "bg-rose-50 border-rose-300 text-rose-900 shadow-xs"
                        : isWarning
                        ? "bg-amber-50 border-amber-300 text-amber-900 shadow-xs"
                        : "bg-slate-50/90 hover:bg-slate-100 border-slate-200 text-slate-800"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isCritical
                          ? "bg-rose-500 text-white"
                          : isWarning
                          ? "bg-amber-500 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {asset.type === "projector" ? (
                        <Tv className="h-5 w-5" />
                      ) : asset.type === "screen" ? (
                        <Monitor className="h-5 w-5" />
                      ) : (
                        <Cpu className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold">{asset.code}</span>
                        {isWarning && (
                          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                        {isCritical && (
                          <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-600 font-medium block">
                        {asset.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* โซนโต๊ะคอมพิวเตอร์นักศึกษา 4 แถว x 10 เครื่อง (Student Workstations Grid) */}
          <div className="space-y-4">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center flex items-center justify-center gap-2">
              <span className="w-16 h-px bg-slate-200" />
              <span>โซนคอมพิวเตอร์นักศึกษา 4 แถว (40 Workstations)</span>
              <span className="w-16 h-px bg-slate-200" />
            </div>

            {/* Render 4 Rows with Center Aisle */}
            {[1, 2, 3, 4].map((rowNum) => {
              const rowPcs = studentPcs.filter((p) => p.row === rowNum);
              const leftBank = rowPcs.filter((p) => (p.col || 1) <= 5);
              const rightBank = rowPcs.filter((p) => (p.col || 1) > 5);

              return (
                <div
                  key={rowNum}
                  className="bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span>แถวที่ {rowNum} (โต๊ะยาว 10 ที่นั่ง)</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      PC-{(rowNum - 1) * 10 + 1} ~ PC-{rowNum * 10}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* ฝั่งซ้าย (5 เครื่อง) */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 flex-1 w-full">
                      {leftBank.map((pc) => (
                        <AssetNodeCard
                          key={pc.id}
                          asset={pc}
                          isSelected={selectedAsset?.id === pc.id}
                          onClick={() => handleAssetClick(pc)}
                        />
                      ))}
                    </div>

                    {/* ทางเดินกลางห้อง (Center Aisle) */}
                    <div className="hidden md:flex flex-col items-center justify-center px-1.5 py-1">
                      <div className="h-10 w-px bg-slate-200 border-l border-dashed border-slate-300" />
                      <span className="text-[9px] font-mono font-bold text-slate-400 py-0.5 tracking-tighter">
                        AISLE
                      </span>
                      <div className="h-10 w-px bg-slate-200 border-l border-dashed border-slate-300" />
                    </div>

                    {/* ฝั่งขวา (5 เครื่อง) */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-2.5 flex-1 w-full">
                      {rightBank.map((pc) => (
                        <AssetNodeCard
                          key={pc.id}
                          asset={pc}
                          isSelected={selectedAsset?.id === pc.id}
                          onClick={() => handleAssetClick(pc)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* โซนอุปกรณ์เสริมรอบห้อง (Air Conditioners & Power Control) */}
          <div className="bg-white/90 rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-2">
              <span className="w-12 h-px bg-slate-200" />
              <span>อุปกรณ์สนับสนุนประจำห้อง (Facility Support Systems)</span>
              <span className="w-12 h-px bg-slate-200" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {peripheralAssets.map((asset) => {
                const isSelected = selectedAsset?.id === asset.id;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => handleAssetClick(asset)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-50 border-blue-300 shadow-sm"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700 shrink-0">
                      {asset.type === "ac" ? <Snowflake className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="font-mono text-xs font-bold flex items-center gap-1.5">
                        <span>{asset.code}</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[10px] text-slate-500">{asset.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Side Drawer: รายละเอียดอุปกรณ์ที่คลิกเลือก (Asset Detail Drawer) */}
      {selectedAsset && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200/90 flex items-start justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                  {selectedAsset.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    selectedAsset.status === "CRITICAL"
                      ? "bg-rose-100 text-rose-800 border border-rose-300"
                      : selectedAsset.status === "WARNING"
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {selectedAsset.status === "CRITICAL"
                    ? "🔴 ชำรุด (Critical)"
                    : selectedAsset.status === "WARNING"
                    ? "🟡 มีแจ้งเตือน (Warning)"
                    : "🟢 ปกติ (Healthy)"}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {selectedAsset.name}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSelectedAsset(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* กล่องแจ้งเตือนอาการเสีย (ถ้ามี) */}
            {selectedAsset.status !== "NORMAL" && (
              <div
                className={`p-4 rounded-2xl border ${
                  selectedAsset.status === "CRITICAL"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    {selectedAsset.status === "CRITICAL" ? (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    )}
                    <span>อาการที่พบ / ปัญหาที่รายงาน:</span>
                  </span>
                  {selectedAsset.ticketNumber && (
                    <span className="font-mono text-[10px] font-bold bg-white/90 px-2 py-0.5 rounded-md border shadow-2xs">
                      {selectedAsset.ticketNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed font-medium pl-5">
                  {selectedAsset.issueDescription}
                </p>
                {selectedAsset.reportedAt && (
                  <div className="text-[10px] text-slate-500 pl-5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>แจ้งเมื่อ: {selectedAsset.reportedAt}</span>
                  </div>
                )}
              </div>
            )}

            {/* ข้อมูลสเปกฮาร์ดแวร์ (Hardware Specs) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-slate-600" />
                <span>ข้อมูลทางเทคนิคของอุปกรณ์ (Specifications)</span>
              </h3>

              <div className="space-y-2 text-xs">
                {selectedAsset.specs.cpu && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">หน่วยประมวลผล (CPU):</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.specs.cpu}</span>
                  </div>
                )}
                {selectedAsset.specs.ram && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">หน่วยความจำ (RAM):</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.specs.ram}</span>
                  </div>
                )}
                {selectedAsset.specs.storage && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">พื้นที่เก็บข้อมูล (SSD):</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.specs.storage}</span>
                  </div>
                )}
                {selectedAsset.specs.display && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">จอภาพ (Monitor):</span>
                    <span className="font-semibold text-slate-800">{selectedAsset.specs.display}</span>
                  </div>
                )}
                {selectedAsset.specs.ipAddress && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="text-slate-500">หมายเลข IP Address:</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedAsset.specs.ipAddress}</span>
                  </div>
                )}
                {selectedAsset.specs.details && (
                  <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                    {selectedAsset.specs.details}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Location Badge */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">ตำแหน่งประจำห้อง:</span>
                <span className="font-semibold text-slate-800">
                  {roomId} ({roomName})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">ชั้นที่:</span>
                <span className="font-semibold text-slate-700">ชั้น {floor} อาคาร 3</span>
              </div>
            </div>
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/90 flex flex-col gap-2">
            {isTechnician ? (
              // 2. สำหรับบทบาทช่างเทคนิค ('TECHNICIAN')
              selectedAsset.status !== "NORMAL" ? (
                // หากอุปกรณ์มีอาการเสีย: แสดงปุ่มสีเขียว "ดูรายละเอียดใบงานซ่อม / อัปเดตงาน"
                <Link
                  href={
                    selectedAsset.ticketId
                      ? `/technician/active-task/${encodeURIComponent(selectedAsset.ticketId)}`
                      : selectedAsset.ticketNumber
                      ? `/technician/active-task/${encodeURIComponent(
                          selectedAsset.ticketNumber.replace("#", "")
                        )}`
                      : `/technician/kanban`
                  }
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-2 transition active:scale-98 text-center cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>ดูรายละเอียดใบงานซ่อม / อัปเดตงาน</span>
                </Link>
              ) : (
                // หากอุปกรณ์ปกติ: แสดงข้อความ "อุปกรณ์สถานะปกติ ไม่มีงานค้าง"
                <div className="w-full p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">อุปกรณ์สถานะปกติ ไม่มีงานค้าง</div>
                    <div className="text-[11px] text-emerald-700/90 mt-0.5">
                      ไม่มีใบงานซ่อมคั่งค้างสำหรับอุปกรณ์นี้
                    </div>
                  </div>
                </div>
              )
            ) : (
              // 1. สำหรับบทบาทนักศึกษา / บุคลากร ('USER' / 'STUDENT' / 'STAFF')
              selectedAsset.status === "NORMAL" ? (
                // กรณีอุปกรณ์ปกติ: แสดงปุ่มสีน้ำเงิน + แจ้งซ่อมเฉพาะจุด ({asset.code})
                <Link
                  href={`/report?floor=${floor}&room=${roomId}&roomName=${encodeURIComponent(
                    roomName
                  )}&specificPoint=${encodeURIComponent(selectedAsset.code)}`}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition active:scale-98 text-center cursor-pointer"
                >
                  <Wrench className="h-4 w-4" />
                  <span>+ แจ้งซ่อมเฉพาะจุด ({selectedAsset.code})</span>
                </Link>
              ) : (
                // กรณีอุปกรณ์ชำรุดอยู่แล้ว: ปิดปุ่มแจ้งซ่อม และแสดงแถบข้อความสีเหลืองแจ้งว่า "อุปกรณ์นี้ถูกแจ้งซ่อมแล้ว (อยู่ระหว่างดำเนินการ)"
                <div className="w-full p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-2xs">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">
                      อุปกรณ์นี้ถูกแจ้งซ่อมแล้ว (อยู่ระหว่างดำเนินการ)
                    </div>
                    <div className="text-[11px] text-amber-700/90 mt-0.5">
                      เพื่อป้องกันการส่งคำขอซ้ำซ้อน
                    </div>
                  </div>
                </div>
              )
            )}

            <button
              type="button"
              onClick={() => setSelectedAsset(null)}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/70 transition cursor-pointer"
            >
              ปิดหน้าต่างย่อย
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Component: Asset Node Card (บัตรคอมพิวเตอร์รายเครื่อง)
// =====================================================================
function AssetNodeCard({
  asset,
  isSelected,
  onClick,
}: {
  asset: AssetInfo;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isCritical = asset.status === "CRITICAL";
  const isWarning = asset.status === "WARNING";
  const isNormal = asset.status === "NORMAL";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
        isSelected
          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-400 shadow-sm scale-105 z-20"
          : isCritical
          ? "bg-rose-50/95 hover:bg-rose-100 border-rose-300 text-rose-950 shadow-2xs hover:scale-105 z-10"
          : isWarning
          ? "bg-amber-50/95 hover:bg-amber-100 border-amber-300 text-amber-950 shadow-2xs hover:scale-105 z-10"
          : "bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 text-slate-800 hover:scale-105 hover:shadow-2xs"
      }`}
      title={`${asset.code} • ${
        isCritical ? "ชำรุด (Critical)" : isWarning ? "แจ้งเตือน (Warning)" : "ปกติ (Normal)"
      }`}
    >
      {/* Radar Ping Beacon สำหรับสถานะชำรุด (Critical) */}
      {isCritical && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600" />
        </span>
      )}

      {/* Pulse Beacon สำหรับสถานะเตือน (Warning) */}
      {isWarning && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
          <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
        </span>
      )}

      {/* Monitor Icon */}
      <div
        className={`p-1.5 rounded-lg mb-1 ${
          isCritical
            ? "text-rose-600 bg-rose-100"
            : isWarning
            ? "text-amber-600 bg-amber-100"
            : isSelected
            ? "text-blue-600 bg-blue-100"
            : "text-slate-600 bg-slate-100"
        }`}
      >
        <Monitor className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
      </div>

      {/* PC Code */}
      <span className="font-mono text-[11px] sm:text-xs font-bold leading-tight block">
        {asset.code}
      </span>

      {/* Status Dot */}
      <div className="flex items-center gap-1 mt-1">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isCritical
              ? "bg-rose-600 animate-ping"
              : isWarning
              ? "bg-amber-500 animate-pulse"
              : "bg-emerald-500"
          }`}
        />
        <span className="text-[9px] font-mono font-medium text-slate-400">
          {isCritical ? "ERR" : isWarning ? "WARN" : "OK"}
        </span>
      </div>
    </button>
  );
}

