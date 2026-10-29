// components/building/BuildingFloorMap.tsx
"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import {
  BUILDING_FLOORS_PLAN,
  FloorPlanData,
  BuildingRoomPlan,
  SubPin,
} from "@/lib/constants/building-plan";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Layers,
  MapPin,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  User,
  Phone,
  Wrench,
  X,
  ExternalLink,
  Laptop,
  Zap,
  Snowflake,
  Wifi,
  Droplets,
  Tv,
  Building2,
  Sparkles,
  ArrowRight,
  Info,
  Search,
  Hammer,
  Shield,
  Crown,
  Play,
  Check,
  UserCheck,
  BarChart3,
  AlertCircle,
  Eye,
  Camera,
  ToggleLeft,
  ToggleRight,
  Send,
  Loader2,
  ChevronDown,
} from "lucide-react";
import {
  assignTechnicianAction,
  updateTicketStatusAction,
  resolveTicketAction,
  claimTicketAction,
} from "@/actions/ticket";
import { toggleDepartmentRoomActiveAction } from "@/actions/room";
import TechnicianResolveModal from "@/components/technician/TechnicianResolveModal";

export interface TicketSummary {
  id: string;
  ticketNumber: string;
  title: string;
  description?: string | null;
  category: string;
  priority: string;
  isUrgent: boolean;
  slaTargetMinutes?: number | null;
  status: string;
  floor: number;
  room: string | any;
  roomName: string;
  roomId?: string | null;
  roomCode?: string | null;
  location?: string | null;
  specificLocation?: string | null;
  specificPoint?: string | null;
  createdAt: string | Date;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  reporterId?: string | null;
  reporterName?: string | null;
  reporterPhone?: string | null;
  reporterRole?: string | null;
  technicianId?: string | null;
  technicianName?: string | null;
}

export interface TechnicianOption {
  id: string;
  name: string;
  technicianCode?: string | null;
  specialties: string[];
  activeTasksCount?: number;
  phone?: string | null;
}

export interface RoomHeatmapStat {
  id: string;
  code: string;
  name: string;
  floor: number;
  totalIssues: number;
  activeIssues: number;
  urgentIssues: number;
  isActive?: boolean;
}

interface BuildingFloorMapProps {
  initialFloor?: number;
  tickets?: TicketSummary[];
  currentUserRole?: "USER" | "TECHNICIAN" | "ADMIN" | "SUPER_ADMIN" | string;
  currentUserId?: string;
  currentUserName?: string;
  technicians?: TechnicianOption[];
  heatmapStats?: RoomHeatmapStat[];
  onSelectRoom?: (room: BuildingRoomPlan) => void;
  standalone?: boolean;
  showViewToggle?: boolean;
  currentView?: "map" | "list";
  onToggleView?: (view: "map" | "list") => void;
}

// Controls toolbar inside TransformWrapper
function ZoomToolbar({
  activeFloor,
  totalIssuesOnFloor,
  isDrawerOpen = false,
}: {
  activeFloor: number;
  totalIssuesOnFloor: number;
  isDrawerOpen?: boolean;
}) {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();

  return (
    <div
      className={`absolute z-20 flex items-center gap-1.5 rounded-xl bg-white/95 p-1.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)] border border-slate-200/90 backdrop-blur-md transition-all duration-300 ${
        isDrawerOpen ? "bottom-4 left-4 sm:bottom-4 sm:right-[436px]" : "bottom-4 right-4"
      }`}
    >
      <button
        type="button"
        onClick={() => zoomIn(0.15)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
        title="ซูมเข้า (+)"
      >
        <ZoomIn className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => zoomOut(0.15)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
        title="ซูมออก (-)"
      >
        <ZoomOut className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <div className="h-4 w-px bg-slate-200 mx-0.5" />
      <button
        type="button"
        onClick={() => resetTransform()}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
        title="รีเซ็ตมุมมอง (⟲)"
      >
        <RotateCcw className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        onClick={() => centerView(1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95"
        title="จัดกึ่งกลาง"
      >
        <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function cleanStr(s: any): string {
  if (typeof s !== "string") return "";
  return s.toLowerCase().replace(/[\s\-_(),.]/g, "");
}

/**
 * ฟังก์ชันตรวจสอบว่าตั๋วใบนี้อยู่ในห้องดังกล่าวหรือไม่ (Robust Multi-fallback Matching)
 * รองรับทั้ง Database ID, 2.5D Room Code, Relation Object, ชื่อเต็ม, ชื่อย่อ, รหัสตัวเลข 3 หลัก, และ Fuzzy Matching
 */
export function isTicketInRoom(ticket: any, room: any): boolean {
  if (!ticket || !room) return false;

  // ตรวจสอบชั้น (Floor) หากระบุชัดเจนทั้งสองฝั่ง และไม่ตรงกัน ให้ข้าม (ป้องกันชื่อห้องซ้ำข้ามชั้น เช่น ห้องน้ำ)
  const ticketFloor =
    ticket.floor !== undefined && ticket.floor !== null
      ? Number(ticket.floor)
      : ticket.room?.floor !== undefined && ticket.room?.floor !== null
      ? Number(ticket.room.floor)
      : null;
  const roomFloor = room.floor !== undefined && room.floor !== null ? Number(room.floor) : null;
  if (
    ticketFloor !== null &&
    roomFloor !== null &&
    !isNaN(ticketFloor) &&
    !isNaN(roomFloor) &&
    ticketFloor !== roomFloor
  ) {
    return false;
  }

  // 1. ตรวจสอบจาก ID หรือ Code โดยตรง
  if (ticket.roomId && (ticket.roomId === room.id || ticket.roomId === room.code)) return true;
  if (ticket.roomCode && (ticket.roomCode === room.code || ticket.roomCode === room.id)) return true;

  // ตรวจสอบกรณี ticket.room เป็น string โดยตรง (เช่น "04-SRV-ROOM", "ServerRoom", "Lab401")
  if (typeof ticket.room === "string") {
    const rawRoom = ticket.room.trim();
    if (rawRoom === room.id || rawRoom === room.code) return true;
    const lowerRoom = rawRoom.toLowerCase();
    if (
      lowerRoom === (room.id || "").toLowerCase() ||
      lowerRoom === (room.code || "").toLowerCase()
    ) {
      return true;
    }
  }

  // 2. ตรวจสอบผ่าน Relation object (ticket.room)
  if (ticket.room && typeof ticket.room === "object") {
    if (ticket.room.id && (ticket.room.id === room.id || ticket.room.id === room.code)) return true;
    if (ticket.room.code && (ticket.room.code === room.code || ticket.room.code === room.id)) return true;
    if (ticket.room.name && (ticket.room.name === room.name || ticket.room.name === room.title)) return true;
  }

  // 3. ตรวจสอบผ่าน Normalized String Matching (ลบช่องว่าง, ขีด, วงเล็บ, สัญลักษณ์ออกทั้งหมด)
  const cTicket = cleanStr(
    ticket.roomName ||
      (typeof ticket.room === "string" ? ticket.room : ticket.room?.name) ||
      ticket.roomId ||
      ticket.roomCode ||
      ticket.location ||
      ticket.specificLocation ||
      ""
  );

  const cRoomId = cleanStr(room.id);
  const cRoomCode = cleanStr(room.code);
  const cRoomName = cleanStr(room.name || room.title);
  const cRoomShort = cleanStr(room.shortName);

  if (cRoomId && cTicket.includes(cRoomId)) return true;
  if (cRoomCode && cTicket.includes(cRoomCode)) return true;
  if (cRoomName && (cTicket.includes(cRoomName) || cRoomName.includes(cTicket))) return true;
  if (cRoomShort && (cTicket.includes(cRoomShort) || cRoomShort.includes(cTicket))) return true;

  // 4. สกัดตัวเลขห้อง 3 หลักบนชั้นเดียวกัน (เช่น 401, 101, 201, 301, 102, 202, 302, 403)
  const tDigits = cTicket.match(/\d{3}/)?.[0];
  const rDigits = (cRoomCode + cRoomId).match(/\d{3}/)?.[0];
  if (tDigits && rDigits && tDigits === rDigits) return true;

  // 5. การจับคู่ด้วยคำสำคัญเฉพาะพื้นที่ (Semantic Keyword Matching)
  // ห้องเซิร์ฟเวอร์
  if (cTicket.includes("server") || cTicket.includes("srv") || cTicket.includes("เซิร์ฟเวอร์")) {
    if (cRoomId.includes("server") || cRoomCode.includes("srv") || cRoomName.includes("เซิร์ฟเวอร์")) return true;
  }
  // ห้องน้ำ
  if (cTicket.includes("ห้องน้ำ") || cTicket.includes("สุขา") || cTicket.includes("wc") || cTicket.includes("restroom")) {
    if (cRoomId.includes("restroom") || cRoomCode.includes("wc") || cRoomName.includes("ห้องน้ำ")) return true;
  }
  // ห้องพักครู / สำนักงาน
  if (cTicket.includes("พักครู") || cTicket.includes("สำนักงาน") || cTicket.includes("office")) {
    if (cRoomId.includes("office") || cRoomName.includes("พักครู")) return true;
  }
  // ห้องพักช่าง / ศูนย์ซ่อมบำรุง
  if (cTicket.includes("เจ้าหน้าที่") || cTicket.includes("ศูนย์ซ่อมบำรุง") || cTicket.includes("ช่าง")) {
    if (cRoomId.includes("staff") || cRoomName.includes("เจ้าหน้าที่")) return true;
  }
  // ระเบียง / พื้นที่ส่วนกลาง
  if (cTicket.includes("ระเบียง") || cTicket.includes("terrace")) {
    if (cRoomId.includes("terrace") || cRoomCode.includes("terrace")) return true;
  }

  return false;
}

export default function BuildingFloorMap({
  initialFloor = 1,
  tickets = [],
  currentUserRole = "USER",
  currentUserId,
  currentUserName,
  technicians = [],
  heatmapStats = [],
  onSelectRoom,
  standalone = true,
  showViewToggle = false,
  currentView = "map",
  onToggleView,
}: BuildingFloorMapProps) {
  const router = useRouter();
  const [currentFloor, setCurrentFloor] = useState<number>(initialFloor);
  const [selectedRoom, setSelectedRoom] = useState<BuildingRoomPlan | null>(null);
  const [selectedSubPin, setSelectedSubPin] = useState<SubPin | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  
  // Super Admin view mode: 'active' or 'heatmap'
  const [superAdminMode, setSuperAdminMode] = useState<"active" | "heatmap">("active");

  // Technician filter: 'all' or 'my-tasks'
  const [technicianFilter, setTechnicianFilter] = useState<"all" | "my-tasks">(
    currentUserRole === "TECHNICIAN" ? "my-tasks" : "all"
  );

  // Technician Drawer States
  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [resolvingModalTicket, setResolvingModalTicket] = useState<{
    id: string;
    ticketNumber: string;
    title: string;
    room: string;
    building: string;
    status: string;
  } | null>(null);

  // Technician Action States (In-Progress & Resolve)
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<string>("");
  const [resolvePhoto, setResolvePhoto] = useState<string>(
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80"
  );
  const [isPendingAction, startTransition] = useTransition();
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Admin Quick Assign State
  const [selectedTechForTicket, setSelectedTechForTicket] = useState<Record<string, string>>({});

  // Room Maintenance State Map
  const [roomMaintenanceMap, setRoomMaintenanceMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    heatmapStats.forEach((s) => {
      if (s.isActive === false) {
        map[s.code] = true;
        map[s.id] = true;
      }
    });
    return map;
  });

  // Get current floor plan data
  const currentFloorData = useMemo(() => {
    return (
      BUILDING_FLOORS_PLAN.find((f) => f.floor === currentFloor) ||
      BUILDING_FLOORS_PLAN[0]
    );
  }, [currentFloor]);

  // Heatmap dictionary by room id/code
  const heatmapMap = useMemo(() => {
    const map: Record<string, RoomHeatmapStat> = {};
    heatmapStats.forEach((s) => {
      map[s.id] = s;
      map[s.code] = s;
    });
    return map;
  }, [heatmapStats]);

  // 1. กรองเฉพาะตั๋วที่ยังคงค้างอยู่จริง (Active Tickets: PENDING, ASSIGNED, IN_PROGRESS, ON_HOLD)
  const activeTickets = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.status === "PENDING" ||
        t.status === "ASSIGNED" ||
        t.status === "IN_PROGRESS" ||
        t.status === "ON_HOLD"
    );
  }, [tickets]);

  // 2. หากผู้ใช้เลือกแท็บ "งานของฉัน" (technicianFilter === "my-tasks")
  const displayTickets = useMemo(() => {
    if (currentUserRole === "TECHNICIAN" && technicianFilter === "my-tasks") {
      return activeTickets.filter(
        (t) =>
          Boolean(
            currentUserId &&
              (t.technicianId === currentUserId ||
                (currentUserName &&
                  t.technicianName &&
                  t.technicianName.includes(currentUserName)))
          )
      );
    }
    return activeTickets;
  }, [activeTickets, currentUserRole, technicianFilter, currentUserId, currentUserName]);

  // Aggregate tickets by floor and room based on displayTickets
  const ticketStats = useMemo(() => {
    const floorCounts: Record<
      number,
      { total: number; urgent: number; critical: number; myTasks: number; unassigned: number }
    > = {
      1: { total: 0, urgent: 0, critical: 0, myTasks: 0, unassigned: 0 },
      2: { total: 0, urgent: 0, critical: 0, myTasks: 0, unassigned: 0 },
      3: { total: 0, urgent: 0, critical: 0, myTasks: 0, unassigned: 0 },
      4: { total: 0, urgent: 0, critical: 0, myTasks: 0, unassigned: 0 },
    };

    const roomTickets: Record<string, TicketSummary[]> = {};

    displayTickets.forEach((t) => {
      const fl = t.floor || 1;
      const isMyTask = Boolean(
        currentUserId &&
          (t.technicianId === currentUserId ||
            (t.technicianName &&
              currentUserName &&
              t.technicianName.includes(currentUserName)))
      );
      const isUnassigned = !t.technicianId;

      if (floorCounts[fl]) {
        floorCounts[fl].total += 1;
        const isCritical = t.priority === "CRITICAL";
        const isUrgent = t.isUrgent || t.priority === "URGENT" || isCritical;
        if (isUrgent) {
          floorCounts[fl].urgent += 1;
        }
        if (isCritical) {
          floorCounts[fl].critical += 1;
        }
        if (isMyTask) {
          floorCounts[fl].myTasks += 1;
        }
        if (isUnassigned) {
          floorCounts[fl].unassigned += 1;
        }
      }

      // Group by room ID or room name match
      const matchedRoom = currentFloorData.rooms.find((r) =>
        isTicketInRoom(t, r)
      );

      if (matchedRoom) {
        if (!roomTickets[matchedRoom.id]) roomTickets[matchedRoom.id] = [];
        roomTickets[matchedRoom.id].push(t);

        if (!roomTickets[matchedRoom.code]) roomTickets[matchedRoom.code] = [];
        roomTickets[matchedRoom.code].push(t);
      } else {
        const key = typeof t.room === "string" ? t.room : t.roomId || t.roomCode || t.roomName || "unknown";
        if (!roomTickets[key]) {
          roomTickets[key] = [];
        }
        roomTickets[key].push(t);
      }
    });

    return { floorCounts, roomTickets };
  }, [displayTickets, currentFloorData, currentUserId, currentUserName]);

  // จำนวนงานค้างบนชั้นปัจจุบันแยกตามโหมด (สำหรับปุ่ม Switcher)
  const myActiveCountOnFloor = useMemo(() => {
    return activeTickets.filter(
      (t) =>
        (t.floor || 1) === currentFloor &&
        Boolean(
          currentUserId &&
            (t.technicianId === currentUserId ||
              (currentUserName &&
                t.technicianName &&
                t.technicianName.includes(currentUserName)))
        )
    ).length;
  }, [activeTickets, currentFloor, currentUserId, currentUserName]);

  const allActiveCountOnFloor = useMemo(() => {
    return activeTickets.filter((t) => (t.floor || 1) === currentFloor).length;
  }, [activeTickets, currentFloor]);

  // ลำดับความสำคัญของตั๋วสำหรับช่างเทคนิค
  const priorityRank = (p: string, isUrgent?: boolean) => {
    if (isUrgent || p === "CRITICAL") return 4;
    if (p === "URGENT") return 3;
    if (p === "HIGH") return 2;
    if (p === "MEDIUM") return 1;
    return 0;
  };

  // Get active tickets for currently selected room
  const selectedRoomTickets = useMemo(() => {
    if (!selectedRoom) return [];
    // สำหรับช่างเทคนิค: ดึงจาก activeTickets ทั้งหมดในห้อง เพื่อให้เห็นทั้งงานตนเองและงานกลางที่ยังไม่มีช่างรับ (สามารถกด Claim ได้)
    const pool = currentUserRole === "TECHNICIAN" ? activeTickets : displayTickets;
    return pool.filter((t) => isTicketInRoom(t, selectedRoom));
  }, [selectedRoom, activeTickets, displayTickets, currentUserRole]);

  // เรียงลำดับตั๋วตามความเร่งด่วนสูงสุดก่อน (Urgency / SLA First)
  const sortedRoomTickets = useMemo(() => {
    return [...selectedRoomTickets].sort((a, b) => {
      const rankA = priorityRank(a.priority, a.isUrgent);
      const rankB = priorityRank(b.priority, b.isUrgent);
      if (rankB !== rankA) return rankB - rankA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [selectedRoomTickets]);

  const displayedRoomTickets = sortedRoomTickets;
  const activeTicket = sortedRoomTickets[selectedTicketIndex] || sortedRoomTickets[0] || null;

  const isMyTask = Boolean(
    activeTicket &&
    currentUserId &&
    (activeTicket.technicianId === currentUserId ||
      (currentUserName &&
        activeTicket.technicianName &&
        activeTicket.technicianName.includes(currentUserName)))
  );

  const isUnassigned = Boolean(activeTicket && !activeTicket.technicianId);

  const handleRoomClick = (room: BuildingRoomPlan) => {
    setSelectedRoom(room);
    setSelectedSubPin(null);
    setResolvingTicketId(null);
    setSelectedTicketIndex(0);
    setActionSuccessMessage(null);
    onSelectRoom?.(room);
  };

  const handleSubPinClick = (e: React.MouseEvent, room: BuildingRoomPlan, subPin: SubPin) => {
    e.stopPropagation();
    setSelectedRoom(room);
    setSelectedSubPin(subPin);
    setResolvingTicketId(null);
    setSelectedTicketIndex(0);
    setActionSuccessMessage(null);
    onSelectRoom?.(room);
  };

  // 1. Technician: Claim Ticket (กดรับงานเข้าคิวฉัน)
  const handleClaimTicket = (ticketId: string) => {
    startTransition(async () => {
      const res = await claimTicketAction(ticketId);
      if (res.success) {
        setActionSuccessMessage("กดรับงานเข้าคิวปฏิบัติการของคุณเรียบร้อยแล้ว");
        router.refresh();
        setTimeout(() => setActionSuccessMessage(null), 3500);
      } else {
        alert(res.error || "ไม่สามารถรับงานได้");
      }
    });
  };

  // 2. Technician: Start Working (เข้าหน้างาน)
  const handleStartWork = (ticketId: string) => {
    startTransition(async () => {
      const res = await updateTicketStatusAction({
        ticketId,
        status: "IN_PROGRESS",
        note: `ช่าง ${currentUserName || "เทคนิค"} เข้าถึงหน้างานและเริ่มลงมือซ่อมบำรุง`,
      });
      if (res.success) {
        setActionSuccessMessage("เริ่มลงมือซ่อมแล้ว (สถานะ In-Progress)");
        router.refresh();
        setTimeout(() => setActionSuccessMessage(null), 3500);
      } else {
        alert(res.error || "ไม่สามารถเริ่มงานได้");
      }
    });
  };

  // 3. Technician: Open Resolve Modal (เปิดหน้าต่างบันทึกปิดงาน)
  const handleOpenResolveModal = (t: TicketSummary) => {
    setResolvingModalTicket({
      id: t.id,
      ticketNumber: t.ticketNumber,
      title: t.title,
      room: t.roomName || t.room,
      building: "ตึกปฏิบัติการและวิจัย",
      status: t.status,
    });
    setIsResolveModalOpen(true);
  };

  // 2. Technician: Resolve Ticket
  const handleConfirmResolve = (ticketId: string) => {
    startTransition(async () => {
      const res = await resolveTicketAction({
        ticketId,
        resolutionDetail: resolveNote || "แก้ไขปัญหาเรียบร้อยแล้ว อุปกรณ์พร้อมใช้งาน",
        afterImageUrl: resolvePhoto,
      });
      if (res.success) {
        setActionSuccessMessage("บันทึกปิดงานและแนบภาพถ่ายหลักฐานเรียบร้อยแล้ว");
        setResolvingTicketId(null);
        setResolveNote("");
        setTimeout(() => setActionSuccessMessage(null), 3500);
      }
    });
  };

  // 3. Admin: Assign Technician
  const handleAssignTech = (ticketId: string) => {
    const techId = selectedTechForTicket[ticketId];
    if (!techId) return;

    startTransition(async () => {
      const res = await assignTechnicianAction({
        ticketId,
        technicianId: techId,
        note: "มอบหมายงานผ่านศูนย์แผนผังอาคารอัจฉริยะ (Operational Canvas)",
      });
      if (res.success) {
        setActionSuccessMessage("จ่ายงานให้ช่างเทคนิคเรียบร้อยแล้ว");
        setTimeout(() => setActionSuccessMessage(null), 3500);
      }
    });
  };

  // 4. Super Admin: Toggle Maintenance Mode
  const handleToggleMaintenance = (room: BuildingRoomPlan) => {
    const currentIsMaint = Boolean(roomMaintenanceMap[room.code] || roomMaintenanceMap[room.id]);
    const newIsActive = currentIsMaint; // If currently maint (inactive), make it active

    startTransition(async () => {
      const res = await toggleDepartmentRoomActiveAction(room.id, newIsActive);
      if (res.success) {
        setRoomMaintenanceMap((prev) => ({
          ...prev,
          [room.code]: !newIsActive,
          [room.id]: !newIsActive,
        }));
        setActionSuccessMessage(
          newIsActive
            ? `เปิดใช้งาน ${room.shortName} ตามปกติแล้ว`
            : `ตั้งค่า ${room.shortName} เป็นโหมดปิดปรับปรุงชั่วคราวแล้ว`
        );
        setTimeout(() => setActionSuccessMessage(null), 3500);
      }
    });
  };

  const getSubPinIcon = (type: SubPin["type"]) => {
    switch (type) {
      case "hardware":
        return <Laptop className="h-2.5 w-2.5" />;
      case "power":
        return <Zap className="h-2.5 w-2.5" />;
      case "ac":
        return <Snowflake className="h-2.5 w-2.5" />;
      case "network":
        return <Wifi className="h-2.5 w-2.5" />;
      case "restroom":
        return <Droplets className="h-2.5 w-2.5" />;
      case "av":
        return <Tv className="h-2.5 w-2.5" />;
      default:
        return <MapPin className="h-2.5 w-2.5" />;
    }
  };

  return (
    <div className={`relative w-full ${standalone ? "card-elevated p-4 sm:p-6" : ""} flex flex-col gap-4 overflow-hidden`}>
      {/* Top Header & Role Operation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-xs">
            {currentUserRole === "SUPER_ADMIN" ? (
              <Crown className="h-5 w-5 text-purple-600 stroke-[1.75]" />
            ) : currentUserRole === "TECHNICIAN" ? (
              <Hammer className="h-5 w-5 text-amber-600 stroke-[1.75]" />
            ) : currentUserRole === "ADMIN" ? (
              <Shield className="h-5 w-5 text-emerald-600 stroke-[1.75]" />
            ) : (
              <Building2 className="h-5 w-5 text-emerald-600 stroke-[1.75]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                {currentUserRole === "SUPER_ADMIN"
                  ? "ศูนย์ควบคุมผังอาคารและสถิติสะสม (Super Admin Ops)"
                  : currentUserRole === "TECHNICIAN"
                  ? "แผนที่นำทางภารกิจช่างเทคนิค (Technician Duty Canvas)"
                  : currentUserRole === "ADMIN"
                  ? "ศูนย์จ่ายงานและมอนิเตอร์อาคาร (Triage Operations Hub)"
                  : "แผนผังอาคาร 2.5D อัจฉริยะ (Campus 3D Twin)"}
              </h2>
              <span className={`chip-tech text-[10px] py-0.5 px-2 ${
                currentUserRole === "SUPER_ADMIN"
                  ? "bg-purple-50 text-purple-800 border-purple-200"
                  : currentUserRole === "TECHNICIAN"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}>
                ROLE: {currentUserRole}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUserRole === "SUPER_ADMIN"
                ? "วิเคราะห์ Heatmap ความเสียหายสะสมและควบคุมโหมดเปิด-ปิดห้องปฏิบัติการ"
                : currentUserRole === "TECHNICIAN"
                ? "ดูจุดที่ตั้งตั๋วงานที่ได้รับมอบหมาย อัปเดตการเข้าหน้างาน และบันทึกส่งหลักฐานปิดงาน"
                : currentUserRole === "ADMIN"
                ? "ตรวจจับตั๋วงานค้างที่ยังไม่มีช่าง และกดจ่ายงานเข้าห้องแล็บทันที"
                : "คลิกเพื่อดูรายละเอียดห้อง โต๊ะปฏิบัติการ หรือส่งคำร้องแจ้งซ่อมตรงจุด"}
            </p>
          </div>
        </div>

        {/* Action Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* SUPER ADMIN Mode Switcher */}
          {currentUserRole === "SUPER_ADMIN" && (
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setSuperAdminMode("active")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  superAdminMode === "active"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                งานซ่อมปัจจุบัน
              </button>
              <button
                type="button"
                onClick={() => setSuperAdminMode("heatmap")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                  superAdminMode === "heatmap"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Flame className="h-3 w-3" />
                <span>Heatmap สถิติสะสม</span>
              </button>
            </div>
          )}

          {/* TECHNICIAN Filter Switcher */}
          {currentUserRole === "TECHNICIAN" && (
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => setTechnicianFilter("my-tasks")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                  technicianFilter === "my-tasks"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Hammer className="h-3 w-3" />
                <span>งานของฉัน ({myActiveCountOnFloor})</span>
              </button>
              <button
                type="button"
                onClick={() => setTechnicianFilter("all")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  technicianFilter === "all"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                งานทั้งหมด ({allActiveCountOnFloor})
              </button>
            </div>
          )}

          {/* View Toggle (Map <-> List) if requested */}
          {showViewToggle && onToggleView && (
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                type="button"
                onClick={() => onToggleView("map")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                  currentView === "map"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="h-3 w-3" />
                <span>ผังอาคาร 2.5D</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleView("list")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                  currentView === "list"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart3 className="h-3 w-3" />
                <span>รายการเดิม</span>
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs pl-2 border-l border-slate-200">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">ปกติ</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-slate-600 font-medium">มีงานซ่อม</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-600 font-semibold">งานเร่งด่วน</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMessage && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          <button type="button" onClick={() => setActionSuccessMessage(null)}>
            <X className="h-3.5 w-3.5 text-emerald-700" />
          </button>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div className="relative flex flex-col lg:flex-row gap-4 items-start w-full">
        {/* Elevator Floor Switcher (Left Column) */}
        <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-44 bg-slate-50/80 p-2 rounded-2xl border border-slate-200/90 backdrop-blur-sm z-10">
          <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 text-slate-400 text-[11px] font-mono font-semibold uppercase tracking-wider border-b border-slate-200/60 pb-2">
            <Layers className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
            <span>เลือกระดับชั้น</span>
          </div>

          {[4, 3, 2, 1].map((floorNum) => {
            const floorInfo = BUILDING_FLOORS_PLAN.find((f) => f.floor === floorNum);
            const stats = ticketStats.floorCounts[floorNum] || { total: 0, urgent: 0, critical: 0, myTasks: 0, unassigned: 0 };
            const isActive = currentFloor === floorNum;
            const count = stats.total;
            const hasCritical = stats.critical > 0 || stats.urgent > 0;

            return (
              <button
                key={floorNum}
                type="button"
                onClick={() => {
                  setCurrentFloor(floorNum);
                  setSelectedRoom(null);
                  setSelectedSubPin(null);
                  setResolvingTicketId(null);
                }}
                className={`relative flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isActive
                    ? "bg-white border-emerald-500/50 shadow-sm text-slate-900 font-semibold ring-2 ring-emerald-500/20"
                    : "bg-white/60 border-slate-200/70 text-slate-600 hover:bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0 pr-1">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {floorNum}F
                  </span>
                  <div className="hidden sm:block min-w-0">
                    <div className="text-xs font-medium text-slate-900 leading-tight truncate">
                      {floorInfo?.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[85px]">
                      {floorInfo?.shortLabel === "4F"
                        ? "Server & Net"
                        : floorInfo?.shortLabel === "3F"
                        ? "Software Lab"
                        : floorInfo?.shortLabel === "2F"
                        ? "Classroom"
                        : "Hardware Lab"}
                    </div>
                  </div>
                </div>

                {/* Minimal Floor Badge Indicator */}
                {count > 0 && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* จุดแจ้งเตือนเฉพาะกรณีมีงานด่วนวิกฤต (CRITICAL) */}
                    {hasCritical && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
                    )}

                    {/* กล่องตัวเลขขนาดกะทัดรัด */}
                    <span
                      className={`min-w-[26px] h-[26px] px-1.5 rounded-lg text-xs font-bold inline-flex items-center justify-center border whitespace-nowrap ${
                        hasCritical
                          ? "bg-rose-50 text-rose-600 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {count}
                    </span>
                  </div>
                )}
              </button>
            );
          })}

          <div className="hidden lg:block pt-2 text-[11px] text-slate-400 px-2 leading-relaxed border-t border-slate-200/60 mt-1">
            <span className="font-semibold text-slate-700 block mb-0.5">การควบคุม:</span>
            หมุนลูกกลิ้งซูมแบบพอดี (8%) และคลิกลากมุมมอง 3D
          </div>
        </div>

        {/* 2.5D Isometric SVG Canvas Box */}
        <div className="relative flex-1 w-full h-[520px] sm:h-[600px] lg:h-[680px] rounded-2xl border border-slate-200/90 bg-slate-50/70 overflow-hidden shadow-sm">
          {/* Floor Subtitle Tag */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none max-w-[calc(100%-2rem)] sm:max-w-md">
            <div className="inline-flex items-center space-x-2 rounded-xl bg-white/95 px-3.5 py-1.5 shadow-xs border border-slate-200/90 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-xs font-bold text-slate-900 font-mono truncate">
                {currentFloorData.label}: {currentFloorData.nameTh}
              </span>
            </div>
          </div>

          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            centerOnInit={true}
            limitToBounds={true}
            smooth={false}
            wheel={{
              step: 0.08,
              activationKeys: [],
            }}
            panning={{
              velocityDisabled: false,
              excluded: ["cursor-pointer"],
            }}
            zoomAnimation={{
              disabled: false,
              animationTime: 100,
              animationType: "easeOut",
            }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <ZoomToolbar
                  activeFloor={currentFloor}
                  totalIssuesOnFloor={ticketStats.floorCounts[currentFloor]?.total || 0}
                  isDrawerOpen={Boolean(selectedRoom)}
                />

                <TransformComponent
                  wrapperClass="!w-full !h-full cursor-grab active:cursor-grabbing"
                  contentClass="!w-full !h-full flex items-center justify-center p-2"
                >
                  <svg
                    viewBox="0 0 960 620"
                    className="w-full h-full max-h-[640px] select-none"
                    style={{ filter: "drop-shadow(0 20px 25px rgba(0,0,0,0.06))" }}
                  >
                    <defs>
                      <linearGradient id="slabTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F9F8F6" />
                        <stop offset="100%" stopColor="#ECE8DF" />
                      </linearGradient>
                      <linearGradient id="slabFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#DDD7CB" />
                        <stop offset="100%" stopColor="#C9C2B4" />
                      </linearGradient>
                      <linearGradient id="slabSideGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#CCC5B6" />
                        <stop offset="100%" stopColor="#B8AF9F" />
                      </linearGradient>
                      <linearGradient id="wallTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FCFAF7" />
                        <stop offset="100%" stopColor="#EDEAE2" />
                      </linearGradient>
                      <linearGradient id="wallFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#E2DDD2" />
                        <stop offset="100%" stopColor="#D0C9BD" />
                      </linearGradient>
                      <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.35" />
                      </filter>
                      <filter id="urgentGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#ef4444" floodOpacity="0.45" />
                      </filter>
                      <filter id="warningGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.45" />
                      </filter>
                    </defs>

                    {/* 1. Base Ground Slab (Extruded 3D Foundation) */}
                    <g className="transition-all duration-300">
                      <polygon points={currentFloorData.slabSide} fill="url(#slabSideGrad)" />
                      <polygon points={currentFloorData.slabFront} fill="url(#slabFrontGrad)" />
                      <polygon
                        points={currentFloorData.slabPolygon}
                        fill="url(#slabTopGrad)"
                        stroke="#D5CEBF"
                        strokeWidth="1.5"
                      />
                    </g>

                    {/* 2. Corridor / Walkway */}
                    {currentFloorData.corridorPolygon && (
                      <polygon
                        points={currentFloorData.corridorPolygon}
                        fill="#F3F0E9"
                        stroke="#E2DDD2"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* 3. Rooms and Interior Geometry */}
                    {currentFloorData.rooms.map((room) => {
                      // กรองตั๋วเฉพาะของห้องนี้ด้วยฟังก์ชัน Multi-fallback Matching ใหม่
                      const pool =
                        currentUserRole === "TECHNICIAN" && technicianFilter === "my-tasks"
                          ? displayTickets
                          : activeTickets;
                      const roomTickets = pool.filter((t) => isTicketInRoom(t, room));
                      const hasActiveIssue = roomTickets.length > 0;
                      const hasCriticalIssue = roomTickets.some(
                        (t) => t.priority === "CRITICAL" || t.priority === "URGENT" || t.isUrgent
                      );
                      const hasIssues = hasActiveIssue;
                      const hasUrgent = hasCriticalIssue;
                      const hasMyTask = Boolean(
                        currentUserId && roomTickets.some((t) => t.technicianId === currentUserId)
                      );
                      const hasMyReported = Boolean(
                        currentUserId && roomTickets.some((t) => t.reporterId === currentUserId)
                      );
                      const hasUnassigned = roomTickets.some((t) => !t.technicianId);
                      const isHovered = hoveredRoomId === room.id;
                      const isSelected = selectedRoom?.id === room.id;
                      const isMaintenance = Boolean(roomMaintenanceMap[room.code] || roomMaintenanceMap[room.id]);

                      // Heatmap Calculation (Super Admin)
                      const stat = heatmapMap[room.id] || heatmapMap[room.code];
                      const totalHistorical = stat?.totalIssues || roomTickets.length;

                      // Room floor styling (Room Boundary / Mesh Stroke & Glow)
                      let floorFill = "#FFFFFF";
                      let floorStroke = "#D0C9BD";

                      if (isMaintenance) {
                        floorFill = "#E2E8F0"; // Gray closed for maintenance
                        floorStroke = "#94A3B8";
                      } else if (currentUserRole === "SUPER_ADMIN" && superAdminMode === "heatmap") {
                        if (totalHistorical >= 4) {
                          floorFill = "#FFE4E6"; // High issues (Red)
                          floorStroke = "#EF4444";
                        } else if (totalHistorical >= 2) {
                          floorFill = "#FEF3C7"; // Medium issues (Amber)
                          floorStroke = "#F59E0B";
                        } else {
                          floorFill = "#ECFDF5"; // Normal (Green)
                          floorStroke = "#10B981";
                        }
                      } else {
                        if (room.type === "facility") {
                          floorFill = "#EFF6FF"; // Soft light blue for restrooms
                        } else if (room.type === "common") {
                          floorFill = "#F0FDF4"; // Soft green
                        } else if (room.type === "server") {
                          floorFill = "#F8FAFC"; // High tech slate
                        }

                        if (isHovered || isSelected) {
                          floorFill = hasCriticalIssue ? "#FFE4E6" : hasActiveIssue ? "#FEF3C7" : "#ECFDF5";
                          floorStroke = hasCriticalIssue ? "#EF4444" : hasActiveIssue ? "#F59E0B" : "#10B981";
                        } else if (hasCriticalIssue) {
                          floorFill = "#FFF1F2"; // Warning rose tint for critical issue
                          floorStroke = "#EF4444"; // Vivid red stroke
                        } else if (hasActiveIssue) {
                          floorFill = "#FFFBEB"; // Warning light orange/amber tint
                          floorStroke = "#F59E0B"; // Vivid orange stroke
                        }
                      }

                      return (
                        <g
                          key={room.id}
                          className="cursor-pointer transition-all duration-200"
                          onMouseEnter={() => setHoveredRoomId(room.id)}
                          onMouseLeave={() => setHoveredRoomId(null)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoomClick(room);
                          }}
                          onPointerUp={(e) => {
                            e.stopPropagation();
                            handleRoomClick(room);
                          }}
                        >
                          {/* Room Floor Plane with Warning/Urgent Glow */}
                          <polygon
                            points={room.floorPolygon}
                            fill={floorFill}
                            stroke={floorStroke}
                            strokeWidth={isSelected ? "2.5" : hasCriticalIssue || hasActiveIssue ? "2.2" : isHovered ? "2" : "1.2"}
                            className="transition-colors duration-200"
                            filter={
                              isSelected
                                ? "url(#emeraldGlow)"
                                : hasCriticalIssue
                                ? "url(#urgentGlow)"
                                : hasActiveIssue
                                ? "url(#warningGlow)"
                                : undefined
                            }
                          />

                          {/* Furniture / Desks */}
                          {room.desks?.map((deskPoints, idx) => (
                            <polygon
                              key={idx}
                              points={deskPoints}
                              fill="#E5E0D6"
                              stroke="#D4CEBF"
                              strokeWidth="0.8"
                              className="opacity-75"
                            />
                          ))}

                          {/* 3D Extruded Walls */}
                          {room.walls?.map((wall, wIdx) => (
                            <g key={wIdx} className="pointer-events-none">
                              {wall.side && (
                                <polygon points={wall.side} fill="url(#slabSideGrad)" stroke="#C7BFB0" strokeWidth="0.5" />
                              )}
                              {wall.front && (
                                <polygon points={wall.front} fill="url(#wallFrontGrad)" stroke="#CEC6B7" strokeWidth="0.5" />
                              )}
                              <polygon points={wall.top} fill="url(#wallTopGrad)" stroke="#DFD8CA" strokeWidth="0.8" />
                            </g>
                          ))}

                          {/* Interior Sub-Pins */}
                          {room.subPins?.map((sp) => {
                            const isPinSelected = selectedSubPin?.id === sp.id;
                            let pinColor = "#475569";
                            if (sp.type === "power") pinColor = "#F59E0B";
                            if (sp.type === "hardware") pinColor = "#8B5CF6";
                            if (sp.type === "network") pinColor = "#3B82F6";
                            if (sp.type === "ac") pinColor = "#06B6D4";
                            if (sp.type === "restroom") pinColor = "#0EA5E9";

                            return (
                              <g
                                key={sp.id}
                                transform={`translate(${sp.x}, ${sp.y})`}
                                onClick={(e) => handleSubPinClick(e, room, sp)}
                                className="group/pin"
                              >
                                <ellipse cx="0" cy="8" rx="6" ry="3" fill="#000000" opacity="0.18" />
                                <circle
                                  cx="0"
                                  cy="0"
                                  r={isPinSelected ? "9" : "7.5"}
                                  fill={isPinSelected ? "#10B981" : "#FFFFFF"}
                                  stroke={isPinSelected ? "#059669" : pinColor}
                                  strokeWidth="1.75"
                                  className="transition-transform group-hover/pin:scale-125"
                                />
                                <circle cx="0" cy="0" r="3" fill={pinColor} />
                                <g className="opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                                  <rect
                                    x="-28"
                                    y="-22"
                                    width="56"
                                    height="16"
                                    rx="4"
                                    fill="#0F172A"
                                    fillOpacity="0.9"
                                  />
                                  <text
                                    x="0"
                                    y="-11"
                                    textAnchor="middle"
                                    fill="#FFFFFF"
                                    fontSize="8"
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                  >
                                    {sp.code}
                                  </text>
                                </g>
                              </g>
                            );
                          })}

                          {/* 4. Primary Floating Room Pill Badge & Alert Pin */}
                          <g
                            id={`room-badge-${room.id}`}
                            className="cursor-pointer group/room-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomClick(room);
                            }}
                            onPointerUp={(e) => {
                              e.stopPropagation();
                              handleRoomClick(room);
                            }}
                            transform={`translate(${room.centerPoint.x}, ${room.centerPoint.y})`}
                          >
                            <ellipse cx="0" cy="18" rx="18" ry="6" fill="#000000" opacity="0.15" />

                            {/* Beacons based on roles */}
                            {hasCriticalIssue ? (
                              <circle cx="0" cy="0" r="24" fill="#EF4444" opacity="0.3" className="animate-ping" />
                            ) : hasActiveIssue ? (
                              <circle cx="0" cy="0" r="22" fill="#F59E0B" opacity="0.25" className="animate-pulse" />
                            ) : currentUserRole === "ADMIN" && hasUnassigned ? (
                              <circle cx="0" cy="0" r="20" fill="#F59E0B" opacity="0.2" className="animate-pulse" />
                            ) : null}

                            {/* Main Pill Badge Container */}
                            {(() => {
                              const pillWidth = hasActiveIssue ? 134 : 112;
                              const pillX = -pillWidth / 2;
                              const dotX = pillX + 15;
                              const textX = hasActiveIssue ? pillX + 28 : 0;

                              return (
                                <>
                                  <rect
                                    x={pillX}
                                    y="-13"
                                    width={pillWidth}
                                    height="26"
                                    rx="13"
                                    fill={
                                      isMaintenance
                                        ? "#475569"
                                        : isSelected
                                        ? "#0F172A"
                                        : isHovered
                                        ? "#1E293B"
                                        : "#0F172A"
                                    }
                                    stroke={
                                      isMaintenance
                                        ? "#94A3B8"
                                        : hasCriticalIssue
                                        ? "#EF4444"
                                        : hasActiveIssue
                                        ? "#F59E0B"
                                        : isSelected
                                        ? "#10B981"
                                        : "#334155"
                                    }
                                    strokeWidth={isSelected || hasCriticalIssue || hasActiveIssue ? "2" : "1.5"}
                                    className="transition-all filter drop-shadow-md"
                                  />

                                  {/* Status indicator dot / Icon */}
                                  {isMaintenance ? (
                                    <text x={dotX - 4} y="3.5" fill="#E2E8F0" fontSize="9">🚧</text>
                                  ) : hasCriticalIssue ? (
                                    <circle cx={dotX} cy="0" r="4.5" fill="#EF4444" className="animate-ping" />
                                  ) : hasActiveIssue ? (
                                    <circle cx={dotX} cy="0" r="4" fill="#F59E0B" className="animate-pulse" />
                                  ) : (
                                    <circle cx={dotX} cy="0" r="4" fill="#10B981" />
                                  )}

                                  {/* Room Code Text with Badge */}
                                  <text
                                    x={textX}
                                    y="3.5"
                                    textAnchor={hasActiveIssue ? "start" : "middle"}
                                    fill="#FFFFFF"
                                    fontSize="10"
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                    letterSpacing="0.5"
                                  >
                                    {room.code}
                                    {hasActiveIssue && (
                                      <tspan
                                        dx="5"
                                        fill={hasCriticalIssue ? "#F87171" : "#FBBF24"}
                                        fontWeight="extrabold"
                                      >
                                        ({roomTickets.length})
                                      </tspan>
                                    )}
                                  </text>

                                  {/* Count Badges: เฉพาะเมื่อมีงานค้างในห้องนั้น (hasIssues) */}
                                  {currentUserRole === "SUPER_ADMIN" && superAdminMode === "heatmap" ? (
                                    <g transform={`translate(${pillWidth / 2 - 4}, -10)`}>
                                      <circle cx="0" cy="0" r="8.5" fill="#8B5CF6" stroke="#FFFFFF" strokeWidth="1.5" />
                                      <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                                        {totalHistorical}
                                      </text>
                                    </g>
                                  ) : hasActiveIssue ? (
                                    <g transform={`translate(${pillWidth / 2 - 4}, -10)`}>
                                      <circle
                                        cx="0"
                                        cy="0"
                                        r="9"
                                        fill={hasCriticalIssue ? "#EF4444" : "#F59E0B"}
                                        stroke="#FFFFFF"
                                        strokeWidth="1.75"
                                        className="filter drop-shadow-sm"
                                      />
                                      <text
                                        x="0"
                                        y="3"
                                        textAnchor="middle"
                                        fill="#FFFFFF"
                                        fontSize="9.5"
                                        fontWeight="bold"
                                        fontFamily="monospace"
                                      >
                                        {roomTickets.length}
                                      </text>
                                    </g>
                                  ) : null}
                                </>
                              );
                            })()}

                            {/* 5. Floating Alert Pin (หมุดพิกัดเตือนกระพริบเหนือห้อง) */}
                            {hasActiveIssue && (
                              <g
                                transform="translate(0, -34)"
                                className="transition-transform group-hover/room-badge:scale-110"
                              >
                                {/* Animated Pulsing Beacon Wave */}
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="16"
                                  fill={hasCriticalIssue ? "#EF4444" : "#F59E0B"}
                                  opacity="0.35"
                                  className="animate-ping pointer-events-none"
                                />

                                {/* Downward Pin Stem/Pointer Triangle */}
                                <polygon
                                  points="-4,9 4,9 0,16"
                                  fill={hasCriticalIssue ? "#DC2626" : "#EA580C"}
                                />

                                {/* Main Pin Circular Body */}
                                <circle
                                  cx="0"
                                  cy="0"
                                  r="12.5"
                                  fill={hasCriticalIssue ? "#DC2626" : "#EA580C"}
                                  stroke="#FFFFFF"
                                  strokeWidth="2"
                                  className="filter drop-shadow-md"
                                />

                                {/* Pin Icon: Exclamation for Critical, Wrench for Active Repair */}
                                {hasCriticalIssue ? (
                                  <g transform="translate(0, -1)">
                                    <rect x="-1.25" y="-6.5" width="2.5" height="7" rx="1.25" fill="#FFFFFF" />
                                    <circle cx="0" cy="4" r="1.4" fill="#FFFFFF" />
                                  </g>
                                ) : (
                                  <g transform="translate(-6.5, -6.5) scale(0.65)">
                                    <path
                                      d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                                      fill="#FFFFFF"
                                    />
                                  </g>
                                )}
                              </g>
                            )}

                            {/* Room Subtitle Label */}
                            <text
                              x="0"
                              y="28"
                              textAnchor="middle"
                              fill="#334155"
                              fontSize="10"
                              fontWeight="600"
                              className="select-none pointer-events-none drop-shadow-xs"
                            >
                              {room.shortName}
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </svg>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>

          {/* Room Detail Slide-over Drawer / Mobile Bottom Sheet */}
          {selectedRoom && (
            <>
              {/* 1. Backdrop โปร่งแสงแบบแตะเพื่อปิด (Mobile View) */}
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-xs z-30 md:hidden transition-opacity cursor-pointer animate-in fade-in duration-200"
                onClick={() => {
                  setSelectedRoom(null);
                  setSelectedSubPin(null);
                  setResolvingTicketId(null);
                  setSelectedTicketIndex(0);
                }}
                aria-hidden="true"
              />

              {/* 2. Responsive Drawer / Bottom Sheet Container */}
              <div
                role="dialog"
                aria-modal="true"
                aria-label="รายละเอียดห้อง"
                className="fixed inset-x-0 bottom-16 z-40 max-h-[60vh] overflow-y-auto bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-4 md:p-0 transition-transform duration-300 md:absolute md:inset-auto md:top-0 md:right-0 md:bottom-0 md:z-30 md:w-[440px] md:max-h-none md:bg-white/98 md:backdrop-blur-md md:border-l md:border-t-0 md:rounded-none flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right"
              >
                {/* Drag Indicator for Mobile */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 md:hidden shrink-0" />

                {/* Drawer Header */}
                <div className="p-0 pb-3 md:p-5 border-b border-slate-200/80 bg-white/90 backdrop-blur-xs flex items-start justify-between shrink-0 mb-1 md:mb-0">
                  <div className="pr-2">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="chip-tech text-[11px] font-bold py-0.5 px-2 bg-slate-900 text-white border-slate-700">
                        [{selectedRoom.floor}F] {selectedRoom.code}
                      </span>
                      <span className="chip-tech text-[10px] py-0.5 px-2 bg-slate-100 text-slate-700 border-slate-200 font-medium">
                        {selectedRoom.badge}
                      </span>
                      {roomMaintenanceMap[selectedRoom.code] && (
                        <span className="chip-tech text-[10px] py-0.5 px-2 bg-rose-50 text-rose-700 border-rose-200 font-bold">
                          ปิดปรับปรุง
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                      {selectedRoom.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {sortedRoomTickets.length > 0 ? (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          sortedRoomTickets.some((t) => t.isUrgent)
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {sortedRoomTickets.some((t) => t.isUrgent) ? "🚨 งานด่วน" : "⚠️ มีงานซ่อม"} {sortedRoomTickets.length} เคส
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          สถานะปกติ
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400">
                        ชั้น {selectedRoom.floor} • {selectedRoom.capacity || "พื้นที่แผนก"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRoom(null);
                      setSelectedSubPin(null);
                      setResolvingTicketId(null);
                      setSelectedTicketIndex(0);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                    title="ปิดหน้าต่าง"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto pt-3 md:p-5 space-y-4">
                {/* Action Feedback Banner */}
                {actionSuccessMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{actionSuccessMessage}</span>
                  </div>
                )}

                {/* Selected Sub-Pin Alert */}
                {selectedSubPin && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 font-semibold text-blue-900">
                      {getSubPinIcon(selectedSubPin.type)}
                      <span>จุดที่เลือก: {selectedSubPin.name}</span>
                    </div>
                    <p className="text-[11px] text-blue-700 font-mono">
                      รหัสจุด: {selectedSubPin.code}
                      {selectedSubPin.description ? ` • ${selectedSubPin.description}` : ""}
                    </p>
                  </div>
                )}

                {/* Secondary Info: Collapsible Accordion (ข้อมูลห้อง & ผู้รับผิดชอบ) */}
                <details className="group rounded-xl border border-slate-200/80 bg-slate-50/60 text-xs overflow-hidden transition-all">
                  <summary className="flex items-center justify-between p-3 font-medium text-slate-700 cursor-pointer hover:bg-slate-100/70 select-none">
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Info className="h-3.5 w-3.5 text-slate-500" />
                      <span>ข้อมูลห้อง & ผู้รับผิดชอบ ({selectedRoom.capacity || "ความจุทั่วไป"})</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="p-3 pt-1 space-y-2 border-t border-slate-200/60 mt-0.5 bg-white">
                    {selectedRoom.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/70">
                        {selectedRoom.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-slate-500">ครูประจำชั้น / ผู้รับผิดชอบ:</span>
                      <span className="font-semibold text-slate-800">{selectedRoom.supervisor}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-1">
                      ตำแหน่ง: {selectedRoom.supervisorRole}
                    </p>
                    {selectedRoom.supervisorPhone && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-slate-500">เบอร์โทรภายใน/ติดต่อ:</span>
                        <a
                          href={`tel:${selectedRoom.supervisorPhone}`}
                          className="font-mono text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {selectedRoom.supervisorPhone}
                        </a>
                      </div>
                    )}
                  </div>
                </details>

                {/* 👑 SUPER ADMIN SPECIFIC: Cumulative Stats & Maintenance Mode Switch */}
                {currentUserRole === "SUPER_ADMIN" && (
                  <div className="rounded-xl border border-purple-200/80 bg-purple-50/50 p-3 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-semibold text-purple-900">
                      <span className="flex items-center gap-1.5">
                        <Crown className="h-3.5 w-3.5 text-purple-600" />
                        <span>การควบคุมระบบ (Super Admin Governance)</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-white p-2 border border-purple-100">
                        <span className="text-[10px] text-slate-500 block">เคสสะสมทั้งหมด</span>
                        <strong className="text-base text-purple-900 font-mono">
                          {heatmapMap[selectedRoom.id]?.totalIssues || selectedRoomTickets.length}
                        </strong>
                      </div>
                      <div className="rounded-lg bg-white p-2 border border-purple-100">
                        <span className="text-[10px] text-slate-500 block">งานค้างปัจจุบัน</span>
                        <strong className="text-base text-amber-600 font-mono">
                          {selectedRoomTickets.length}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isPendingAction}
                      onClick={() => handleToggleMaintenance(selectedRoom)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                        roomMaintenanceMap[selectedRoom.code]
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-200"
                      }`}
                    >
                      {isPendingAction ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : roomMaintenanceMap[selectedRoom.code] ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>เปิดห้องใช้งานตามปกติ (End Maintenance)</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>ปิดปรับปรุงห้องชั่วคราว (Maintenance Mode)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* 🛠️ TECHNICIAN VIEW: Primary Task Card or Clean Empty State */}
                {currentUserRole === "TECHNICIAN" ? (
                  sortedRoomTickets.length === 0 ? (
                    /* 4. กรณีห้องที่ไม่มีรายการซ่อมค้าง (Empty State) */
                    <div className="py-12 px-4 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">ห้องอยู่ในสถานะปกติ</h4>
                      <p className="text-xs text-slate-400 mt-1">ไม่มีรายการแจ้งซ่อมหรือภารกิจคงค้างในห้องนี้</p>
                    </div>
                  ) : (
                    /* Primary Task Section */
                    <div className="space-y-3.5">
                      {/* Ticket Pill Selector (if multiple tickets in room) */}
                      {sortedRoomTickets.length > 1 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                              เลือกใบงาน ({sortedRoomTickets.length} เคสในห้องนี้)
                            </span>
                            <span className="text-[10px] text-slate-400">
                              เรียงตามลำดับความเร่งด่วน
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                            {sortedRoomTickets.map((t, idx) => {
                              const isSelected = selectedTicketIndex === idx;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setSelectedTicketIndex(idx)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                                    isSelected
                                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                      : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                                  }`}
                                >
                                  {t.isUrgent && <span>🚨</span>}
                                  <span className="font-mono">{t.ticketNumber}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Primary Task Card */}
                      {activeTicket && (
                        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-3.5 shadow-sm">
                          {/* Header: Ticket Number & Badges */}
                          <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-100">
                            <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {activeTicket.ticketNumber}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {activeTicket.isUrgent ? (
                                <span className="chip-tech text-[10px] py-0.5 px-2 bg-rose-50 text-rose-700 border-rose-200 font-bold flex items-center gap-1">
                                  <span>🚨</span> งานด่วน SLA {activeTicket.slaTargetMinutes || 15}m
                                </span>
                              ) : (
                                <span className="chip-tech text-[10px] py-0.5 px-2 bg-blue-50 text-blue-700 border-blue-200 font-medium flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> SLA {activeTicket.slaTargetMinutes || 60}m
                                </span>
                              )}
                              <span className="chip-tech text-[10px] py-0.5 px-2 bg-slate-100 text-slate-800 font-semibold">
                                {activeTicket.status}
                              </span>
                            </div>
                          </div>

                          {/* Title & Category */}
                          <div className="space-y-1">
                            <span className="chip-tech text-[10px] py-0.5 px-2 bg-emerald-50 text-emerald-800 border-emerald-200 font-medium">
                              {activeTicket.category}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {activeTicket.title}
                            </h4>
                          </div>

                          {/* Before Photo Preview with Click-to-Zoom */}
                          <div className="space-y-1">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
                              รูปภาพอาการเสีย (Issue Photos)
                            </span>
                            {activeTicket.beforeImageUrl ? (
                              <div
                                className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-900/5 aspect-video flex items-center justify-center"
                                onClick={() => setZoomedImage(activeTicket.beforeImageUrl || null)}
                              >
                                <img
                                  src={activeTicket.beforeImageUrl}
                                  alt="ภาพถ่ายจุดชำรุด (Before Photo)"
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px]">
                                  <Maximize2 className="h-4 w-4" />
                                  <span>แตะเพื่อเปิดดูภาพขยาย</span>
                                </div>
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono flex items-center gap-1">
                                  <Camera className="h-3 w-3" />
                                  <span>รูปถ่ายอาการเสีย (Before)</span>
                                </div>
                              </div>
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-400">
                                <Camera className="h-5 w-5 mx-auto mb-1 text-slate-300" />
                                <span>ไม่มีภาพถ่ายอาการเสียจากผู้แจ้ง</span>
                              </div>
                            )}
                          </div>

                          {/* Specific Point Location */}
                          {activeTicket.specificPoint && (
                            <div className="flex items-start gap-2 text-xs text-slate-700 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80">
                              <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-amber-900">ตำแหน่งเฉพาะจุด: </span>
                                <span className="text-amber-800 font-medium">{activeTicket.specificPoint}</span>
                              </div>
                            </div>
                          )}

                          {/* Description */}
                          {activeTicket.description && (
                            <div className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                              <span className="font-semibold text-slate-700 block mb-0.5">รายละเอียดอาการ:</span>
                              {activeTicket.description}
                            </div>
                          )}

                          {/* Reporter Contact Info */}
                          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 space-y-1.5 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                                ข้อมูลผู้แจ้งเพื่อติดต่อ
                              </span>
                              {activeTicket.reporterRole && (
                                <span className="chip-tech text-[10px] py-0.5 px-2 bg-white text-slate-600 border-slate-200">
                                  {activeTicket.reporterRole === "STUDENT"
                                    ? "นักศึกษา"
                                    : activeTicket.reporterRole === "STAFF" || activeTicket.reporterRole === "TEACHER"
                                    ? "อาจารย์ / บุคลากร"
                                    : activeTicket.reporterRole}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-0.5">
                              <div className="flex items-center space-x-2 text-slate-800 font-semibold">
                                <User className="h-3.5 w-3.5 text-blue-600" />
                                <span>{activeTicket.reporterName || "ผู้ใช้งานในระบบ"}</span>
                              </div>
                              {activeTicket.reporterPhone ? (
                                <a
                                  href={`tel:${activeTicket.reporterPhone}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-mono text-xs font-semibold transition"
                                  title="โทรประสานงานกรณีห้องล็อก"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{activeTicket.reporterPhone}</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400">ไม่มีเบอร์โทร</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* 👥 NON-TECHNICIAN (USER/ADMIN) VIEW: Active Tickets List */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Wrench className="h-3.5 w-3.5 text-slate-500" />
                        <span>ปัญหาที่แจ้งซ่อมค้างอยู่</span>
                      </span>
                      <span className={`chip-tech text-[10px] py-0.5 px-2 ${
                        displayedRoomTickets.length > 0
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {displayedRoomTickets.length > 0 ? `${displayedRoomTickets.length} เคส` : "ปกติ ไม่พบปัญหา"}
                      </span>
                    </div>

                    {displayedRoomTickets.length === 0 ? (
                      <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/40 p-4 text-center space-y-1">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" strokeWidth={1.75} />
                        <p className="text-xs font-semibold text-emerald-900">
                          สภาพแวดล้อมพร้อมใช้งาน
                        </p>
                        <p className="text-[11px] text-emerald-700">
                          ยังไม่มีการแจ้งปัญหาชำรุดในห้องนี้
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {displayedRoomTickets.map((t) => {
                          const isMyAssigned = t.technicianId === currentUserId;
                          const isUnassignedTicket = !t.technicianId;

                          return (
                            <div
                              key={t.id}
                              className={`rounded-xl border p-3 space-y-2 transition-all text-xs ${
                                isMyAssigned
                                  ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30"
                                  : isUnassignedTicket && currentUserRole === "ADMIN"
                                  ? "bg-rose-50/60 border-rose-200"
                                  : "bg-slate-50/70 border-slate-200 hover:bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="chip-tech text-[10px] py-0.5 px-1.5 font-bold">
                                  {t.ticketNumber}
                                </span>
                                <div className="flex items-center space-x-1">
                                  {t.isUrgent && (
                                    <span className="chip-tech text-[10px] py-0.5 px-1.5 bg-rose-50 text-rose-700 border-rose-200 font-bold">
                                      ด่วน 15M
                                    </span>
                                  )}
                                  <span className="chip-tech text-[10px] py-0.5 px-1.5 bg-slate-100 text-slate-800">
                                    {t.status}
                                  </span>
                                </div>
                              </div>

                              <h4 className="font-semibold text-slate-900 leading-tight">
                                {t.title}
                              </h4>

                              {t.specificPoint && (
                                <p className="text-[11px] text-slate-600 font-mono">
                                  ตำแหน่ง: {t.specificPoint}
                                </p>
                              )}

                              {t.technicianName && (
                                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                  <UserCheck className="h-3 w-3 text-emerald-600" />
                                  <span>ช่างรับผิดชอบ: {t.technicianName}</span>
                                </div>
                              )}

                              {/* 🏢 ADMIN QUICK ASSIGN */}
                              {currentUserRole === "ADMIN" && isUnassignedTicket && (
                                <div className="pt-2 border-t border-rose-200/80 space-y-2">
                                  <span className="text-[11px] font-semibold text-rose-700 block">
                                    ⚡ จ่ายงานให้ช่างทันที:
                                  </span>
                                  <div className="flex gap-1.5">
                                    <select
                                      value={selectedTechForTicket[t.id] || ""}
                                      onChange={(e) =>
                                        setSelectedTechForTicket((prev) => ({
                                          ...prev,
                                          [t.id]: e.target.value,
                                        }))
                                      }
                                      className="flex-1 text-xs rounded-lg border border-slate-200 bg-white p-1.5 focus:border-emerald-500 focus:outline-none"
                                    >
                                      <option value="">-- เลือกช่างเทคนิค --</option>
                                      {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id}>
                                          {tech.name} (ค้าง {tech.activeTasksCount || 0} งาน)
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="button"
                                      disabled={!selectedTechForTicket[t.id] || isPendingAction}
                                      onClick={() => handleAssignTech(t.id)}
                                      className="btn-primary-gradient px-3 py-1.5 text-xs font-semibold disabled:opacity-50 shrink-0"
                                    >
                                      {isPendingAction ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        "จ่ายงาน"
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Sticky Bottom Area */}
              {currentUserRole === "TECHNICIAN" ? (
                /* TECHNICIAN ACTION AREA: Only visible when there is an active ticket */
                sortedRoomTickets.length > 0 && activeTicket && (
                  <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200 shrink-0">
                    {/* กรณีที่ 1: งานส่วนกลาง ยังไม่มีช่างรับผิดชอบ */}
                    {isUnassigned && (
                      <button
                        type="button"
                        disabled={isPendingAction}
                        onClick={() => handleClaimTicket(activeTicket.id)}
                        className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isPendingAction ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span>✋</span>
                            <span>รับงานนี้</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* กรณีที่ 2: งานที่ช่างรับแล้ว (ASSIGNED หรือ IN_PROGRESS หรือ ON_HOLD หรือ PENDING) */}
                    {(isMyTask || (!isUnassigned && activeTicket.technicianId === currentUserId)) &&
                      (activeTicket.status === "ASSIGNED" ||
                        activeTicket.status === "IN_PROGRESS" ||
                        activeTicket.status === "ON_HOLD" ||
                        activeTicket.status === "PENDING") && (
                      <Link
                        href={`/technician/active-task/${activeTicket.id}`}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
                      >
                        <span>{activeTicket.status === "ON_HOLD" ? "⏸️" : "🚀"}</span>
                        <span>{activeTicket.status === "ON_HOLD" ? "ดูรายละเอียดงานพัก / นำกลับศูนย์" : "เข้าสู่หน้าจอปฏิบัติงานซ่อม (Active Task)"}</span>
                      </Link>
                    )}

                    {/* กรณีที่ 3: งานซ่อมเสร็จสิ้นแล้ว (RESOLVED / CLOSED) */}
                    {(activeTicket.status === "RESOLVED" || activeTicket.status === "CLOSED") && (
                      <div className="space-y-2">
                        <div className="w-full py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2">
                          <span>✅</span>
                          <span>ซ่อมบำรุงเสร็จสิ้นแล้ว (RESOLVED)</span>
                        </div>
                        <Link
                          href={`/technician/active-task/${activeTicket.id}`}
                          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                        >
                          <span>📋</span>
                          <span>ดูรายละเอียดประวัติการซ่อม</span>
                        </Link>
                      </div>
                    )}

                    {/* กรณีที่ 4: งานของช่างท่านอื่น */}
                    {!isUnassigned && !isMyTask && activeTicket.technicianId !== currentUserId && (
                      <div className="w-full py-2.5 px-4 bg-slate-100 text-slate-500 font-medium text-xs rounded-xl text-center">
                        ช่างผู้รับผิดชอบ: {activeTicket.technicianName || "ช่างท่านอื่นในแผนก"}
                      </div>
                    )}
                  </div>
                )
              ) : currentUserRole === "USER" ? (
                /* 1. ปุ่มแจ้งปัญหา (เฉพาะเมื่อ Role เป็น USER เท่านั้น - ห้ามแสดงในมุมมองช่างเทคนิค) */
                <div className="p-4 bg-white/95 backdrop-blur-xs border-t border-slate-200 shrink-0">
                  <Link
                    href={`/report?floor=${selectedRoom.floor}&room=${selectedRoom.id}&roomName=${encodeURIComponent(
                      selectedRoom.name
                    )}${selectedSubPin ? `&specificPoint=${encodeURIComponent(selectedSubPin.name)}` : ""}`}
                    className="w-full btn-primary-gradient py-2.5 px-4 text-xs font-semibold flex items-center justify-center space-x-2 rounded-xl"
                  >
                    <Wrench className="h-4 w-4" strokeWidth={1.75} />
                    <span>+ แจ้งปัญหา / ส่งคำร้องในห้องนี้</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </div>
              ) : null}
            </div>
          </>
        )}

          {/* Lightbox Zoom Modal for Before Photo */}
          {zoomedImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in"
              onClick={() => setZoomedImage(null)}
            >
              <div
                className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setZoomedImage(null)}
                  className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
                <img
                  src={zoomedImage}
                  alt="ภาพขยายอาการเสีย (Before Photo)"
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl mx-auto"
                />
                <div className="p-2.5 text-center text-xs text-slate-300">
                  แตะที่ใดก็ได้เพื่อปิดหน้าต่าง
                </div>
              </div>
            </div>
          )}

          {/* Technician Resolve Modal Integration */}
          {resolvingModalTicket && (
            <TechnicianResolveModal
              isOpen={isResolveModalOpen}
              ticket={resolvingModalTicket}
              onClose={() => {
                setIsResolveModalOpen(false);
                setResolvingModalTicket(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
