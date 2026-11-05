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


export const BUILDING_3_U_SHAPED_FLOORS_PLAN: FloorPlanData[] = [
  {
    "floor": 1,
    "label": "ชั้น 1",
    "shortLabel": "1F",
    "nameTh": "ห้องเรียน ปฏิบัติการ และห้องพักครู",
    "description": "ห้องพักครู 311, ห้องเรียน 312-314, ห้องพักครู 315 และโถงบันได 1-2",
    "accentColor": "#10b981",
    "slabPolygon": "95,115 865,115 865,485 715,485 715,365 245,365 245,485 95,485",
    "slabFront": "95,485 245,485 245,501 95,501 715,485 865,485 865,501 715,501 245,365 715,365 715,381 245,381",
    "slabSide": "95,115 95,485 95,501 95,131 865,115 865,485 865,501 865,131",
    "corridorPolygon": "245,348 715,348 715,362 245,362",
    "rooms": [
      {
        "id": "01-311",
        "code": "01-311",
        "name": "ห้องพักครู 311",
        "shortName": "311 (พักครู)",
        "floor": 1,
        "type": "office",
        "badge": "ห้องพักครู",
        "supervisor": "ครูประจำแผนกวิชาคอมพิวเตอร์",
        "supervisorRole": "ครูผู้ดูแลห้องพักครู 311",
        "supervisorPhone": "081-555-3110",
        "description": "ห้องพักครูและอาจารย์ประจำแผนก ปีกซ้าย อาคาร 3",
        "capacity": "15 ที่นั่งอาจารย์",
        "primaryCategory": "ELECTRICAL",
        "centerPoint": {
          "x": 170,
          "y": 300
        },
        "floorPolygon": "110,130 230,130 230,470 110,470",
        "walls": [
          {
            "top": "110,130 230,130 230,134 110,134",
            "front": "110,470 230,470 230,478 110,478",
            "side": "110,130 110,470 110,478 110,138"
          }
        ],
        "subPins": [
          {
            "id": "01-311-p1",
            "code": "P-311-1",
            "name": "โต๊ะทำงานครู 1",
            "type": "power",
            "x": 145,
            "y": 220,
            "description": "ปลั๊กไฟโต๊ะทำงาน"
          },
          {
            "id": "01-311-ac1",
            "code": "AC-311",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 195,
            "y": 380,
            "description": "แอร์ห้องพักครู"
          }
        ]
      },
      {
        "id": "01-STAIR-L",
        "code": "01-STAIR-L",
        "name": "โถงบันได 1",
        "shortName": "บันได 1",
        "floor": 1,
        "type": "common",
        "badge": "บันไดหลัก 1",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดหลักเชื่อมระหว่างชั้น 1-4 ปีกซ้าย",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 274,
          "y": 250
        },
        "floorPolygon": "238,150 310,150 310,350 238,350",
        "walls": [
          {
            "top": "238,150 310,150 310,154 238,154",
            "front": "238,350 310,350 310,356 238,356"
          }
        ],
        "subPins": [
          {
            "id": "01-STAIR-L-lt",
            "code": "LT-STAIR-L1",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 274,
            "y": 200,
            "description": "ไฟส่องสว่างโถงบันได"
          }
        ]
      },
      {
        "id": "01-312",
        "code": "01-312",
        "name": "ห้องเรียน 312",
        "shortName": "ห้อง 312",
        "floor": 1,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 312",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 312 อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 370,
          "y": 240
        },
        "floorPolygon": "318,130 422,130 422,350 318,350",
        "walls": [
          {
            "top": "318,130 422,130 422,134 318,134",
            "front": "318,350 422,350 422,356 318,356"
          }
        ],
        "subPins": [
          {
            "id": "01-312-av1",
            "code": "AV-312",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 370,
            "y": 170,
            "description": "โปรเจกเตอร์หน้าห้อง"
          },
          {
            "id": "01-312-ac1",
            "code": "AC-312",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 400,
            "y": 310,
            "description": "แอร์ห้อง 312"
          }
        ]
      },
      {
        "id": "01-313",
        "code": "01-313",
        "name": "ห้องเรียน 313",
        "shortName": "ห้อง 313",
        "floor": 1,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 313",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 313 โถงกลาง อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "ELECTRICAL",
        "centerPoint": {
          "x": 480,
          "y": 240
        },
        "floorPolygon": "428,130 532,130 532,350 428,350",
        "walls": [
          {
            "top": "428,130 532,130 532,134 428,134",
            "front": "428,350 532,350 532,356 428,356"
          }
        ],
        "subPins": [
          {
            "id": "01-313-p1",
            "code": "P-313",
            "name": "ตู้ควบคุมไฟฟ้า",
            "type": "power",
            "x": 450,
            "y": 160,
            "description": "เบรกเกอร์ห้อง 313"
          },
          {
            "id": "01-313-ac1",
            "code": "AC-313",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 510,
            "y": 310,
            "description": "แอร์ห้อง 313"
          }
        ]
      },
      {
        "id": "01-314",
        "code": "01-314",
        "name": "ห้องเรียน 314",
        "shortName": "ห้อง 314",
        "floor": 1,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 314",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 314 อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "NETWORK",
        "centerPoint": {
          "x": 590,
          "y": 240
        },
        "floorPolygon": "538,130 642,130 642,350 538,350",
        "walls": [
          {
            "top": "538,130 642,130 642,134 538,134",
            "front": "538,350 642,350 642,356 538,356"
          }
        ],
        "subPins": [
          {
            "id": "01-314-net1",
            "code": "NET-314",
            "name": "Wi-Fi AP",
            "type": "network",
            "x": 590,
            "y": 180,
            "description": "Access Point กระจายสัญญาณ"
          }
        ]
      },
      {
        "id": "01-STAIR-R",
        "code": "01-STAIR-R",
        "name": "โถงบันได 2",
        "shortName": "บันได 2",
        "floor": 1,
        "type": "common",
        "badge": "บันไดหลัก 2",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดหลักเชื่อมระหว่างชั้น 1-4 ปีกขวา",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 686,
          "y": 250
        },
        "floorPolygon": "650,150 722,150 722,350 650,350",
        "walls": [
          {
            "top": "650,150 722,150 722,154 650,154",
            "front": "650,350 722,350 722,356 650,356"
          }
        ],
        "subPins": [
          {
            "id": "01-STAIR-R-lt",
            "code": "LT-STAIR-R1",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 686,
            "y": 200,
            "description": "ไฟส่องสว่างโถงบันได"
          }
        ]
      },
      {
        "id": "01-315",
        "code": "01-315",
        "name": "ห้องพักครู 315",
        "shortName": "315 (พักครู)",
        "floor": 1,
        "type": "office",
        "badge": "ห้องพักครู",
        "supervisor": "ครูประจำแผนกวิชาคอมพิวเตอร์",
        "supervisorRole": "ครูผู้ดูแลห้องพักครู 315",
        "supervisorPhone": "081-555-3150",
        "description": "ห้องพักครูและอาจารย์ประจำแผนก ปีกขวา อาคาร 3",
        "capacity": "15 ที่นั่งอาจารย์",
        "primaryCategory": "ELECTRICAL",
        "centerPoint": {
          "x": 790,
          "y": 300
        },
        "floorPolygon": "730,130 850,130 850,470 730,470",
        "walls": [
          {
            "top": "730,130 850,130 850,134 730,134",
            "front": "730,470 850,470 850,478 730,478",
            "side": "850,130 850,470 850,478 850,138"
          }
        ],
        "subPins": [
          {
            "id": "01-315-p1",
            "code": "P-315",
            "name": "เต้ารับไฟฟ้า",
            "type": "power",
            "x": 760,
            "y": 220,
            "description": "ปลั๊กไฟโต๊ะพักครู"
          },
          {
            "id": "01-315-ac1",
            "code": "AC-315",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 810,
            "y": 380,
            "description": "แอร์ห้องพักครู"
          }
        ]
      }
    ]
  },
  {
    "floor": 2,
    "label": "ชั้น 2",
    "shortLabel": "2F",
    "nameTh": "ห้องเรียน 321-325, ห้องน้ำ และโถงบันได",
    "description": "ห้องเรียน 321, 322, 323, 324, 325, ห้องน้ำหญิง, ห้องน้ำอาจารย์ และโถงบันได 1-2",
    "accentColor": "#3b82f6",
    "slabPolygon": "95,115 865,115 865,485 715,485 715,365 245,365 245,485 95,485",
    "slabFront": "95,485 245,485 245,501 95,501 715,485 865,485 865,501 715,501 245,365 715,365 715,381 245,381",
    "slabSide": "95,115 95,485 95,501 95,131 865,115 865,485 865,501 865,131",
    "corridorPolygon": "245,348 715,348 715,362 245,362",
    "rooms": [
      {
        "id": "02-321",
        "code": "02-321",
        "name": "ห้องเรียน 321",
        "shortName": "ห้อง 321",
        "floor": 2,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 321",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 321 ปีกซ้าย อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 170,
          "y": 300
        },
        "floorPolygon": "110,130 230,130 230,470 110,470",
        "walls": [
          {
            "top": "110,130 230,130 230,134 110,134",
            "front": "110,470 230,470 230,478 110,478",
            "side": "110,130 110,470 110,478 110,138"
          }
        ],
        "subPins": [
          {
            "id": "02-321-av1",
            "code": "AV-321",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 170,
            "y": 220,
            "description": "โปรเจกเตอร์เพดาน"
          },
          {
            "id": "02-321-ac1",
            "code": "AC-321",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 210,
            "y": 380,
            "description": "แอร์ห้อง 321"
          }
        ]
      },
      {
        "id": "02-WC-F",
        "code": "02-WC-F",
        "name": "ห้องน้ำหญิง (ชั้น 2)",
        "shortName": "ห้องน้ำหญิง",
        "floor": 2,
        "type": "facility",
        "badge": "ห้องสุขาหญิง",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่สุขาภิบาล",
        "description": "ห้องสุขาหญิงประจำชั้น 2 ปีกซ้าย อาคาร 3",
        "primaryCategory": "PLUMBING",
        "centerPoint": {
          "x": 274,
          "y": 182
        },
        "floorPolygon": "238,130 310,130 310,235 238,235",
        "walls": [
          {
            "top": "238,130 310,130 310,134 238,134",
            "front": "238,235 310,235 310,240 238,240"
          }
        ],
        "subPins": [
          {
            "id": "02-WC-F-tap",
            "code": "TAP-WCF2",
            "name": "ก๊อกอ่างล้างมือ",
            "type": "restroom",
            "x": 274,
            "y": 175,
            "description": "อ่างล้างมือสุขาหญิง"
          }
        ]
      },
      {
        "id": "02-STAIR-L",
        "code": "02-STAIR-L",
        "name": "โถงบันได 1",
        "shortName": "บันได 1",
        "floor": 2,
        "type": "common",
        "badge": "บันไดหลัก 1",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดเชื่อมชั้น 1-3 ปีกซ้าย",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 274,
          "y": 297
        },
        "floorPolygon": "238,245 310,245 310,350 238,350",
        "walls": [
          {
            "top": "238,245 310,245 310,249 238,249",
            "front": "238,350 310,350 310,356 238,356"
          }
        ],
        "subPins": [
          {
            "id": "02-STAIR-L-lt",
            "code": "LT-STAIR-L2",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 274,
            "y": 280,
            "description": "ไฟส่องสว่างโถงบันได ชั้น 2"
          }
        ]
      },
      {
        "id": "02-322",
        "code": "02-322",
        "name": "ห้องเรียน 322",
        "shortName": "ห้อง 322",
        "floor": 2,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 322",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 322 อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 370,
          "y": 240
        },
        "floorPolygon": "318,130 422,130 422,350 318,350",
        "walls": [
          {
            "top": "318,130 422,130 422,134 318,134",
            "front": "318,350 422,350 422,356 318,356"
          }
        ],
        "subPins": [
          {
            "id": "02-322-av1",
            "code": "AV-322",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 370,
            "y": 170,
            "description": "โปรเจกเตอร์หลักห้อง 322"
          },
          {
            "id": "02-322-ac1",
            "code": "AC-322",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 400,
            "y": 310,
            "description": "แอร์ห้อง 322"
          }
        ]
      },
      {
        "id": "02-323",
        "code": "02-323",
        "name": "ห้องเรียน 323",
        "shortName": "ห้อง 323",
        "floor": 2,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 323",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 323 โถงกลาง อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "ELECTRICAL",
        "centerPoint": {
          "x": 480,
          "y": 240
        },
        "floorPolygon": "428,130 532,130 532,350 428,350",
        "walls": [
          {
            "top": "428,130 532,130 532,134 428,134",
            "front": "428,350 532,350 532,356 428,356"
          }
        ],
        "subPins": [
          {
            "id": "02-323-p1",
            "code": "P-323",
            "name": "เต้ารับไฟฟ้า",
            "type": "power",
            "x": 480,
            "y": 200,
            "description": "ปลั๊กไฟห้อง 323"
          },
          {
            "id": "02-323-ac1",
            "code": "AC-323",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 510,
            "y": 310,
            "description": "แอร์ห้อง 323"
          }
        ]
      },
      {
        "id": "02-324",
        "code": "02-324",
        "name": "ห้องเรียน 324",
        "shortName": "ห้อง 324",
        "floor": 2,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 324",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 324 อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "NETWORK",
        "centerPoint": {
          "x": 590,
          "y": 240
        },
        "floorPolygon": "538,130 642,130 642,350 538,350",
        "walls": [
          {
            "top": "538,130 642,130 642,134 538,134",
            "front": "538,350 642,350 642,356 538,356"
          }
        ],
        "subPins": [
          {
            "id": "02-324-net1",
            "code": "NET-324",
            "name": "Wi-Fi AP",
            "type": "network",
            "x": 590,
            "y": 180,
            "description": "Access Point ห้อง 324"
          }
        ]
      },
      {
        "id": "02-WC-TCH",
        "code": "02-WC-TCH",
        "name": "ห้องน้ำอาจารย์ (ชั้น 2)",
        "shortName": "ห้องน้ำอาจารย์",
        "floor": 2,
        "type": "facility",
        "badge": "ห้องสุขาอาจารย์",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่สุขาภิบาล",
        "description": "ห้องสุขาอาจารย์และบุคลากร ชั้น 2 ปีกขวา อาคาร 3",
        "primaryCategory": "PLUMBING",
        "centerPoint": {
          "x": 686,
          "y": 182
        },
        "floorPolygon": "650,130 722,130 722,235 650,235",
        "walls": [
          {
            "top": "650,130 722,130 722,134 650,134",
            "front": "650,235 722,235 722,240 650,240"
          }
        ],
        "subPins": [
          {
            "id": "02-WC-TCH-tap",
            "code": "TAP-WCT2",
            "name": "ก๊อกอ่างล้างมือ",
            "type": "restroom",
            "x": 686,
            "y": 175,
            "description": "ก๊อกอ่างล้างมือสุขาอาจารย์"
          }
        ]
      },
      {
        "id": "02-STAIR-R",
        "code": "02-STAIR-R",
        "name": "โถงบันได 2",
        "shortName": "บันได 2",
        "floor": 2,
        "type": "common",
        "badge": "บันไดหลัก 2",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดเชื่อมชั้น 1-3 ปีกขวา",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 686,
          "y": 297
        },
        "floorPolygon": "650,245 722,245 722,350 650,350",
        "walls": [
          {
            "top": "650,245 722,245 722,249 650,249",
            "front": "650,350 722,350 722,356 650,356"
          }
        ],
        "subPins": [
          {
            "id": "02-STAIR-R-lt",
            "code": "LT-STAIR-R2",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 686,
            "y": 280,
            "description": "ไฟส่องสว่างโถงบันได ชั้น 2"
          }
        ]
      },
      {
        "id": "02-325",
        "code": "02-325",
        "name": "ห้องเรียน 325",
        "shortName": "ห้อง 325",
        "floor": 2,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 325",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 325 ปีกขวา อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 790,
          "y": 300
        },
        "floorPolygon": "730,130 850,130 850,470 730,470",
        "walls": [
          {
            "top": "730,130 850,130 850,134 730,134",
            "front": "730,470 850,470 850,478 730,478",
            "side": "850,130 850,470 850,478 850,138"
          }
        ],
        "subPins": [
          {
            "id": "02-325-av1",
            "code": "AV-325",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 790,
            "y": 220,
            "description": "โปรเจกเตอร์ห้อง 325"
          },
          {
            "id": "02-325-ac1",
            "code": "AC-325",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 810,
            "y": 380,
            "description": "แอร์ห้อง 325"
          }
        ]
      }
    ]
  },
  {
    "floor": 3,
    "label": "ชั้น 3",
    "shortLabel": "3F",
    "nameTh": "ห้องเรียน 331-335, ห้องน้ำชาย 1-2 และโถงบันได",
    "description": "ห้องเรียน 331, 332, 333, 334, 335, ห้องน้ำชาย 1-2 และโถงบันได 1-2",
    "accentColor": "#8b5cf6",
    "slabPolygon": "95,115 865,115 865,485 715,485 715,365 245,365 245,485 95,485",
    "slabFront": "95,485 245,485 245,501 95,501 715,485 865,485 865,501 715,501 245,365 715,365 715,381 245,381",
    "slabSide": "95,115 95,485 95,501 95,131 865,115 865,485 865,501 865,131",
    "corridorPolygon": "245,348 715,348 715,362 245,362",
    "rooms": [
      {
        "id": "03-331",
        "code": "03-331",
        "name": "ห้องเรียน 331",
        "shortName": "ห้อง 331",
        "floor": 3,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 331",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 331 ปีกซ้าย อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 170,
          "y": 300
        },
        "floorPolygon": "110,130 230,130 230,470 110,470",
        "walls": [
          {
            "top": "110,130 230,130 230,134 110,134",
            "front": "110,470 230,470 230,478 110,478",
            "side": "110,130 110,470 110,478 110,138"
          }
        ],
        "subPins": [
          {
            "id": "03-331-av1",
            "code": "AV-331",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 170,
            "y": 220,
            "description": "โปรเจกเตอร์ห้อง 331"
          },
          {
            "id": "03-331-ac1",
            "code": "AC-331",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 210,
            "y": 380,
            "description": "แอร์ห้อง 331"
          }
        ]
      },
      {
        "id": "03-WC-M1",
        "code": "03-WC-M1",
        "name": "ห้องน้ำชาย 1 (ปีกซ้าย ชั้น 3)",
        "shortName": "ห้องน้ำชาย 1",
        "floor": 3,
        "type": "facility",
        "badge": "ห้องสุขาชาย 1",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่สุขาภิบาล",
        "description": "ห้องสุขาชาย 1 ประจำชั้น 3 ปีกซ้าย อาคาร 3",
        "primaryCategory": "PLUMBING",
        "centerPoint": {
          "x": 274,
          "y": 182
        },
        "floorPolygon": "238,130 310,130 310,235 238,235",
        "walls": [
          {
            "top": "238,130 310,130 310,134 238,134",
            "front": "238,235 310,235 310,240 238,240"
          }
        ],
        "subPins": [
          {
            "id": "03-WC-M1-tap",
            "code": "TAP-WCM1",
            "name": "ก๊อกอ่างล้างมือ",
            "type": "restroom",
            "x": 274,
            "y": 175,
            "description": "ก๊อกอ่างล้างมือสุขาชาย 1"
          }
        ]
      },
      {
        "id": "03-STAIR-L",
        "code": "03-STAIR-L",
        "name": "โถงบันได 1",
        "shortName": "บันได 1",
        "floor": 3,
        "type": "common",
        "badge": "บันไดหลัก 1",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดเชื่อมชั้น 2-4 ปีกซ้าย",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 274,
          "y": 297
        },
        "floorPolygon": "238,245 310,245 310,350 238,350",
        "walls": [
          {
            "top": "238,245 310,245 310,249 238,249",
            "front": "238,350 310,350 310,356 238,356"
          }
        ],
        "subPins": [
          {
            "id": "03-STAIR-L-lt",
            "code": "LT-STAIR-L3",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 274,
            "y": 280,
            "description": "ไฟส่องสว่างโถงบันได ชั้น 3"
          }
        ]
      },
      {
        "id": "03-332",
        "code": "03-332",
        "name": "ห้องเรียน 332",
        "shortName": "ห้อง 332",
        "floor": 3,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 332",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 332 อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 370,
          "y": 240
        },
        "floorPolygon": "318,130 422,130 422,350 318,350",
        "walls": [
          {
            "top": "318,130 422,130 422,134 318,134",
            "front": "318,350 422,350 422,356 318,356"
          }
        ],
        "subPins": [
          {
            "id": "03-332-av1",
            "code": "AV-332",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 370,
            "y": 170,
            "description": "โปรเจกเตอร์ห้อง 332"
          },
          {
            "id": "03-332-ac1",
            "code": "AC-332",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 400,
            "y": 310,
            "description": "แอร์ห้อง 332"
          }
        ]
      },
      {
        "id": "03-333",
        "code": "03-333",
        "name": "ห้องเรียน 333",
        "shortName": "ห้อง 333",
        "floor": 3,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 333",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 333 โถงกลาง อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "ELECTRICAL",
        "centerPoint": {
          "x": 480,
          "y": 240
        },
        "floorPolygon": "428,130 532,130 532,350 428,350",
        "walls": [
          {
            "top": "428,130 532,130 532,134 428,134",
            "front": "428,350 532,350 532,356 428,356"
          }
        ],
        "subPins": [
          {
            "id": "03-333-p1",
            "code": "P-333",
            "name": "เต้ารับไฟฟ้า",
            "type": "power",
            "x": 480,
            "y": 200,
            "description": "ปลั๊กไฟห้อง 333"
          },
          {
            "id": "03-333-ac1",
            "code": "AC-333",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 510,
            "y": 310,
            "description": "แอร์ห้อง 333"
          }
        ]
      },
      {
        "id": "03-334",
        "code": "03-334",
        "name": "ห้องเรียน 334",
        "shortName": "ห้อง 334",
        "floor": 3,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 334",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 334 อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "NETWORK",
        "centerPoint": {
          "x": 590,
          "y": 240
        },
        "floorPolygon": "538,130 642,130 642,350 538,350",
        "walls": [
          {
            "top": "538,130 642,130 642,134 538,134",
            "front": "538,350 642,350 642,356 538,356"
          }
        ],
        "subPins": [
          {
            "id": "03-334-net1",
            "code": "NET-334",
            "name": "Wi-Fi AP",
            "type": "network",
            "x": 590,
            "y": 180,
            "description": "Access Point ห้อง 334"
          }
        ]
      },
      {
        "id": "03-WC-M2",
        "code": "03-WC-M2",
        "name": "ห้องน้ำชาย 2 (ปีกขวา ชั้น 3)",
        "shortName": "ห้องน้ำชาย 2",
        "floor": 3,
        "type": "facility",
        "badge": "ห้องสุขาชาย 2",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่สุขาภิบาล",
        "description": "ห้องสุขาชาย 2 ประจำชั้น 3 ปีกขวา อาคาร 3",
        "primaryCategory": "PLUMBING",
        "centerPoint": {
          "x": 686,
          "y": 182
        },
        "floorPolygon": "650,130 722,130 722,235 650,235",
        "walls": [
          {
            "top": "650,130 722,130 722,134 650,134",
            "front": "650,235 722,235 722,240 650,240"
          }
        ],
        "subPins": [
          {
            "id": "03-WC-M2-tap",
            "code": "TAP-WCM2",
            "name": "ก๊อกอ่างล้างมือ",
            "type": "restroom",
            "x": 686,
            "y": 175,
            "description": "ก๊อกอ่างล้างมือสุขาชาย 2"
          }
        ]
      },
      {
        "id": "03-STAIR-R",
        "code": "03-STAIR-R",
        "name": "โถงบันได 2",
        "shortName": "บันได 2",
        "floor": 3,
        "type": "common",
        "badge": "บันไดหลัก 2",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดเชื่อมชั้น 2-4 ปีกขวา",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 686,
          "y": 297
        },
        "floorPolygon": "650,245 722,245 722,350 650,350",
        "walls": [
          {
            "top": "650,245 722,245 722,249 650,249",
            "front": "650,350 722,350 722,356 650,356"
          }
        ],
        "subPins": [
          {
            "id": "03-STAIR-R-lt",
            "code": "LT-STAIR-R3",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 686,
            "y": 280,
            "description": "ไฟส่องสว่างโถงบันได ชั้น 3"
          }
        ]
      },
      {
        "id": "03-335",
        "code": "03-335",
        "name": "ห้องเรียน 335",
        "shortName": "ห้อง 335",
        "floor": 3,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 335",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 335 ปีกขวา อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 790,
          "y": 300
        },
        "floorPolygon": "730,130 850,130 850,470 730,470",
        "walls": [
          {
            "top": "730,130 850,130 850,134 730,134",
            "front": "730,470 850,470 850,478 730,478",
            "side": "850,130 850,470 850,478 850,138"
          }
        ],
        "subPins": [
          {
            "id": "03-335-av1",
            "code": "AV-335",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 790,
            "y": 220,
            "description": "โปรเจกเตอร์ห้อง 335"
          },
          {
            "id": "03-335-ac1",
            "code": "AC-335",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 810,
            "y": 380,
            "description": "แอร์ห้อง 335"
          }
        ]
      }
    ]
  },
  {
    "floor": 4,
    "label": "ชั้น 4",
    "shortLabel": "4F",
    "nameTh": "ห้องเรียน 341-344 (ห้องแล็บรวมใหญ่ 343), ห้องน้ำ และโถงบันได",
    "description": "ห้องแล็บรวมขนาดใหญ่ 343 (2 ช่วงเสา), ห้องเรียน 341, 342, 344, ห้องน้ำ และโถงบันได 1-2",
    "accentColor": "#f59e0b",
    "slabPolygon": "95,115 865,115 865,485 715,485 715,365 245,365 245,485 95,485",
    "slabFront": "95,485 245,485 245,501 95,501 715,485 865,485 865,501 715,501 245,365 715,365 715,381 245,381",
    "slabSide": "95,115 95,485 95,501 95,131 865,115 865,485 865,501 865,131",
    "corridorPolygon": "245,348 715,348 715,362 245,362",
    "rooms": [
      {
        "id": "04-341",
        "code": "04-341",
        "name": "ห้องเรียน 341",
        "shortName": "ห้อง 341",
        "floor": 4,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 341",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 341 ปีกซ้าย อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 170,
          "y": 300
        },
        "floorPolygon": "110,130 230,130 230,470 110,470",
        "walls": [
          {
            "top": "110,130 230,130 230,134 110,134",
            "front": "110,470 230,470 230,478 110,478",
            "side": "110,130 110,470 110,478 110,138"
          }
        ],
        "subPins": [
          {
            "id": "04-341-av1",
            "code": "AV-341",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 170,
            "y": 220,
            "description": "โปรเจกเตอร์ห้อง 341"
          },
          {
            "id": "04-341-ac1",
            "code": "AC-341",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 210,
            "y": 380,
            "description": "แอร์ห้อง 341"
          }
        ]
      },
      {
        "id": "04-WC-GEN",
        "code": "04-WC-GEN",
        "name": "ห้องน้ำทั่วไป (ชั้น 4)",
        "shortName": "ห้องน้ำทั่วไป",
        "floor": 4,
        "type": "facility",
        "badge": "ห้องสุขาทั่วไป",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่สุขาภิบาล",
        "description": "ห้องสุขาทั่วไปประจำชั้น 4 ปีกซ้าย อาคาร 3",
        "primaryCategory": "PLUMBING",
        "centerPoint": {
          "x": 274,
          "y": 182
        },
        "floorPolygon": "238,130 310,130 310,235 238,235",
        "walls": [
          {
            "top": "238,130 310,130 310,134 238,134",
            "front": "238,235 310,235 310,240 238,240"
          }
        ],
        "subPins": [
          {
            "id": "04-WC-GEN-tap",
            "code": "TAP-WCG4",
            "name": "ก๊อกอ่างล้างมือ",
            "type": "restroom",
            "x": 274,
            "y": 175,
            "description": "ก๊อกอ่างล้างมือสุขาทั่วไป ชั้น 4"
          }
        ]
      },
      {
        "id": "04-STAIR-L",
        "code": "04-STAIR-L",
        "name": "โถงบันได 1",
        "shortName": "บันได 1",
        "floor": 4,
        "type": "common",
        "badge": "บันไดหลัก 1",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดเชื่อมชั้น 3-4 ปีกซ้าย",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 274,
          "y": 297
        },
        "floorPolygon": "238,245 310,245 310,350 238,350",
        "walls": [
          {
            "top": "238,245 310,245 310,249 238,249",
            "front": "238,350 310,350 310,356 238,356"
          }
        ],
        "subPins": [
          {
            "id": "04-STAIR-L-lt",
            "code": "LT-STAIR-L4",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 274,
            "y": 280,
            "description": "ไฟส่องสว่างโถงบันได ชั้น 4"
          }
        ]
      },
      {
        "id": "04-342",
        "code": "04-342",
        "name": "ห้องเรียน 342",
        "shortName": "ห้อง 342",
        "floor": 4,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 342",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 342 โถงกลาง อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 370,
          "y": 240
        },
        "floorPolygon": "318,130 422,130 422,350 318,350",
        "walls": [
          {
            "top": "318,130 422,130 422,134 318,134",
            "front": "318,350 422,350 422,356 318,356"
          }
        ],
        "subPins": [
          {
            "id": "04-342-av1",
            "code": "AV-342",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 370,
            "y": 170,
            "description": "โปรเจกเตอร์ห้อง 342"
          },
          {
            "id": "04-342-ac1",
            "code": "AC-342",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 400,
            "y": 310,
            "description": "แอร์ห้อง 342"
          }
        ]
      },
      {
        "id": "04-343",
        "code": "04-343",
        "name": "ห้องเรียน 343",
        "shortName": "343 (แล็บใหญ่)",
        "floor": 4,
        "type": "lab",
        "badge": "แล็บรวมใหญ่ 2 ช่วงเสา",
        "supervisor": "หัวหน้าสาขาวิชาคอมพิวเตอร์",
        "supervisorRole": "ผู้จัดการศูนย์ปฏิบัติการคอมพิวเตอร์กลาง",
        "supervisorPhone": "081-555-3430",
        "description": "ห้องปฏิบัติการรวมขนาดใหญ่พิเศษ 343 (กินพื้นที่ความกว้าง 2 ล็อกช่วงเสา) โถงกลาง ชั้น 4",
        "capacity": "80 ที่นั่งปฏิบัติการ",
        "primaryCategory": "NETWORK",
        "centerPoint": {
          "x": 535,
          "y": 240
        },
        "floorPolygon": "428,130 642,130 642,350 428,350",
        "walls": [
          {
            "top": "428,130 642,130 642,134 428,134",
            "front": "428,350 642,350 642,356 428,356"
          }
        ],
        "desks": [
          "450,160 510,160 510,185 450,185",
          "560,160 620,160 620,185 560,185",
          "450,220 510,220 510,245 450,245",
          "560,220 620,220 620,245 560,245"
        ],
        "subPins": [
          {
            "id": "04-343-s1",
            "code": "SRV-343-1",
            "name": "ตู้แร็คเซิร์ฟเวอร์กลาง",
            "type": "hardware",
            "x": 490,
            "y": 190,
            "description": "ตู้ Rack อุปกรณ์เครือข่าย"
          },
          {
            "id": "04-343-s2",
            "code": "SW-343-2",
            "name": "สวิตช์เครือข่ายหลัก",
            "type": "network",
            "x": 580,
            "y": 190,
            "description": "Cisco Core Switch"
          },
          {
            "id": "04-343-ac1",
            "code": "AC-343-1",
            "name": "แอร์หลัก 1",
            "type": "ac",
            "x": 460,
            "y": 310,
            "description": "แอร์แขวน 36000 BTU ตัวที่ 1"
          },
          {
            "id": "04-343-ac2",
            "code": "AC-343-2",
            "name": "แอร์หลัก 2",
            "type": "ac",
            "x": 610,
            "y": 310,
            "description": "แอร์แขวน 36000 BTU ตัวที่ 2"
          }
        ]
      },
      {
        "id": "04-WC-TCH",
        "code": "04-WC-TCH",
        "name": "ห้องน้ำอาจารย์ (ชั้น 4)",
        "shortName": "ห้องน้ำอาจารย์",
        "floor": 4,
        "type": "facility",
        "badge": "ห้องสุขาอาจารย์",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่สุขาภิบาล",
        "description": "ห้องสุขาอาจารย์และบุคลากร ชั้น 4 ปีกขวา อาคาร 3",
        "primaryCategory": "PLUMBING",
        "centerPoint": {
          "x": 686,
          "y": 182
        },
        "floorPolygon": "650,130 722,130 722,235 650,235",
        "walls": [
          {
            "top": "650,130 722,130 722,134 650,134",
            "front": "650,235 722,235 722,240 650,240"
          }
        ],
        "subPins": [
          {
            "id": "04-WC-TCH-tap",
            "code": "TAP-WCT4",
            "name": "ก๊อกอ่างล้างมือ",
            "type": "restroom",
            "x": 686,
            "y": 175,
            "description": "ก๊อกอ่างล้างมือสุขาอาจารย์ ชั้น 4"
          }
        ]
      },
      {
        "id": "04-STAIR-R",
        "code": "04-STAIR-R",
        "name": "โถงบันได 2",
        "shortName": "บันได 2",
        "floor": 4,
        "type": "common",
        "badge": "บันไดหลัก 2",
        "supervisor": "ฝ่ายอาคารสถานที่",
        "supervisorRole": "เจ้าหน้าที่ดูแลบันไดและทางสัญจร",
        "description": "โถงบันไดเชื่อมชั้น 3-4 ปีกขวา",
        "primaryCategory": "FACILITY",
        "centerPoint": {
          "x": 686,
          "y": 297
        },
        "floorPolygon": "650,245 722,245 722,350 650,350",
        "walls": [
          {
            "top": "650,245 722,245 722,249 650,249",
            "front": "650,350 722,350 722,356 650,356"
          }
        ],
        "subPins": [
          {
            "id": "04-STAIR-R-lt",
            "code": "LT-STAIR-R4",
            "name": "โคมไฟบันได",
            "type": "power",
            "x": 686,
            "y": 280,
            "description": "ไฟส่องสว่างโถงบันได ชั้น 4"
          }
        ]
      },
      {
        "id": "04-344",
        "code": "04-344",
        "name": "ห้องเรียน 344",
        "shortName": "ห้อง 344",
        "floor": 4,
        "type": "classroom",
        "badge": "ห้องเรียนทฤษฎี/ปฏิบัติ",
        "supervisor": "ครูประจำวิชา",
        "supervisorRole": "ผู้ดูแลห้องเรียน 344",
        "description": "ห้องเรียนทฤษฎีและปฏิบัติการ 344 ปีกขวา อาคาร 3",
        "capacity": "40 ที่นั่ง",
        "primaryCategory": "AV_EQUIPMENT",
        "centerPoint": {
          "x": 790,
          "y": 300
        },
        "floorPolygon": "730,130 850,130 850,470 730,470",
        "walls": [
          {
            "top": "730,130 850,130 850,134 730,134",
            "front": "730,470 850,470 850,478 730,478",
            "side": "850,130 850,470 850,478 850,138"
          }
        ],
        "subPins": [
          {
            "id": "04-344-av1",
            "code": "AV-344",
            "name": "โปรเจกเตอร์",
            "type": "av",
            "x": 790,
            "y": 220,
            "description": "โปรเจกเตอร์ห้อง 344"
          },
          {
            "id": "04-344-ac1",
            "code": "AC-344",
            "name": "เครื่องปรับอากาศ",
            "type": "ac",
            "x": 810,
            "y": 380,
            "description": "แอร์ห้อง 344"
          }
        ]
      }
    ]
  }
];
export const BUILDING_FLOORS_PLAN: FloorPlanData[] = BUILDING_3_U_SHAPED_FLOORS_PLAN;

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


// =====================================================================
// Warm Architectural Stone 2.5D Cutaway Floorplan (Final Polished)
// =====================================================================
const COS30 = Math.cos(Math.PI / 6); // ~0.8660254
const SIN30 = 0.5;

function toIso(x: number, y: number, z: number = 0, originX = 480, originY = 110) {
  return {
    x: Math.round((originX + (x - y) * COS30) * 10) / 10,
    y: Math.round((originY + (x + y) * SIN30 - z) * 10) / 10,
  };
}

function polyStr(pts: { x: number; y: number }[]): string {
  return pts.map((p) => `${p.x},${p.y}`).join(" ");
}

interface DeskBlock3D {
  top: string;
  left: string;
  right: string;
}

/**
 * Creates a 3D isometric extruded desk block with top, left, and right faces.
 * Default height h = 4.5 creates subtle low-poly extrusion without cluttering.
 */
function makeDeskBlock(bx: number, by: number, bw: number, bd: number, h: number = 4.5): DeskBlock3D {
  return {
    top: polyStr([
      toIso(bx, by, h),
      toIso(bx + bw, by, h),
      toIso(bx + bw, by + bd, h),
      toIso(bx, by + bd, h),
    ]),
    left: polyStr([
      toIso(bx, by + bd, h),
      toIso(bx + bw, by + bd, h),
      toIso(bx + bw, by + bd, 0),
      toIso(bx, by + bd, 0),
    ]),
    right: polyStr([
      toIso(bx + bw, by, h),
      toIso(bx + bw, by + bd, h),
      toIso(bx + bw, by + bd, 0),
      toIso(bx + bw, by, 0),
    ]),
  };
}

interface RoomGridSpec {
  x: number;
  y: number;
  w: number;
  d: number;
}

const ROOM_SPECS: Record<string, RoomGridSpec> = {
  // Floor 1
  "01-311": { x: 0, y: 0, w: 110, d: 280 },
  "01-STAIR-L": { x: 110, y: 0, w: 65, d: 150 },
  "01-312": { x: 175, y: 0, w: 90, d: 150 },
  "01-313": { x: 265, y: 0, w: 90, d: 150 },
  "01-314": { x: 355, y: 0, w: 90, d: 150 },
  "01-STAIR-R": { x: 445, y: 0, w: 65, d: 150 },
  "01-315": { x: 510, y: 0, w: 110, d: 280 },

  // Floor 2
  "02-321": { x: 0, y: 0, w: 110, d: 280 },
  "02-WC-F": { x: 110, y: 0, w: 65, d: 75 },
  "02-STAIR-L": { x: 110, y: 75, w: 65, d: 75 },
  "02-322": { x: 175, y: 0, w: 90, d: 150 },
  "02-323": { x: 265, y: 0, w: 90, d: 150 },
  "02-324": { x: 355, y: 0, w: 90, d: 150 },
  "02-WC-TCH": { x: 445, y: 0, w: 65, d: 75 },
  "02-STAIR-R": { x: 445, y: 75, w: 65, d: 75 },
  "02-325": { x: 510, y: 0, w: 110, d: 280 },

  // Floor 3
  "03-331": { x: 0, y: 0, w: 110, d: 280 },
  "03-WC-M1": { x: 110, y: 0, w: 65, d: 75 },
  "03-STAIR-L": { x: 110, y: 75, w: 65, d: 75 },
  "03-332": { x: 175, y: 0, w: 90, d: 150 },
  "03-333": { x: 265, y: 0, w: 90, d: 150 },
  "03-334": { x: 355, y: 0, w: 90, d: 150 },
  "03-WC-M2": { x: 445, y: 0, w: 65, d: 75 },
  "03-STAIR-R": { x: 445, y: 75, w: 65, d: 75 },
  "03-335": { x: 510, y: 0, w: 110, d: 280 },

  // Floor 4
  "04-341": { x: 0, y: 0, w: 110, d: 280 },
  "04-WC-GEN": { x: 110, y: 0, w: 65, d: 75 },
  "04-STAIR-L": { x: 110, y: 75, w: 65, d: 75 },
  "04-342": { x: 175, y: 0, w: 90, d: 150 },
  "04-343": { x: 265, y: 0, w: 180, d: 150 }, // Double-wide Lab (2 bays)
  "04-WC-TCH": { x: 445, y: 0, w: 65, d: 75 },
  "04-STAIR-R": { x: 445, y: 75, w: 65, d: 75 },
  "04-344": { x: 510, y: 0, w: 110, d: 280 },
};

function getRoomGridSpec(roomId: string, roomCode?: string): RoomGridSpec {
  if (ROOM_SPECS[roomId]) return ROOM_SPECS[roomId];
  if (roomCode && ROOM_SPECS[roomCode]) return ROOM_SPECS[roomCode];
  for (const [key, spec] of Object.entries(ROOM_SPECS)) {
    if (roomId.endsWith(key) || (roomCode && roomCode.endsWith(key))) {
      return spec;
    }
  }
  return { x: 175, y: 0, w: 90, d: 150 };
}

function getShortThaiName(room: BuildingRoomPlan): string {
  if (room.id.includes("WC-F")) return "ห้องน้ำหญิง";
  if (room.id.includes("WC-M1")) return "ห้องน้ำชาย 1";
  if (room.id.includes("WC-M2")) return "ห้องน้ำชาย 2";
  if (room.id.includes("WC-GEN")) return "ห้องน้ำทั่วไป";
  if (room.id.includes("WC-TCH")) return "ห้องน้ำอาจารย์";
  if (room.id.includes("STAIR-L") || (room.code && room.code.includes("STAIR-L")) || (room.name && (room.name.includes("บันได 1") || room.name.includes("โถงบันได 1")))) return "โถงบันได 1";
  if (room.id.includes("STAIR-R") || (room.code && room.code.includes("STAIR-R")) || (room.name && (room.name.includes("บันได 2") || room.name.includes("โถงบันได 2")))) return "โถงบันได 2";
  if (room.id.includes("STAIR") || (room.code && room.code.includes("STAIR"))) return "โถงบันได";
  if (room.id.endsWith("311")) return "ห้องพักครู 311";
  if (room.id.endsWith("315")) return "ห้องพักครู 315";
  if (room.id.endsWith("343")) return "ห้องปฏิบัติการ 343";
  return room.name.replace(/\s*\([^)]*\)/g, "").trim();
}

function getCleanRoomSubtitle(room: BuildingRoomPlan): string {
  if (room.id.includes("WC-F")) return "ห้องน้ำหญิง";
  if (room.id.includes("WC-M1")) return "ห้องน้ำชาย 1";
  if (room.id.includes("WC-M2")) return "ห้องน้ำชาย 2";
  if (room.id.includes("WC-GEN")) return "ห้องน้ำทั่วไป";
  if (room.id.includes("WC-TCH")) return "ห้องน้ำอาจารย์";
  if (room.id.includes("STAIR-L") || (room.code && room.code.includes("STAIR-L")) || (room.name && (room.name.includes("บันได 1") || room.name.includes("โถงบันได 1")))) return "โถงบันได 1";
  if (room.id.includes("STAIR-R") || (room.code && room.code.includes("STAIR-R")) || (room.name && (room.name.includes("บันได 2") || room.name.includes("โถงบันได 2")))) return "โถงบันได 2";
  if (room.id.includes("STAIR") || (room.code && room.code.includes("STAIR"))) return "โถงบันได";
  if (room.id.endsWith("343") || (room.name && room.name.includes("ปฏิบัติการ"))) return "ห้องปฏิบัติการ";
  if (room.type === "office" || (room.name && room.name.includes("พักครู"))) return "ห้องพักครู";
  if (room.type === "classroom" || (room.name && room.name.includes("เรียน"))) return "ห้องเรียน";
  const clean = room.name.replace(/\s*\([^)]*\)/g, "").replace(/\s*\d+/g, "").trim();
  return clean || room.name;
}

// 1. Unified U-Shape Base Slab (z = 0 to z = -14)
const BASE_SLAB_DEPTH = -14;

// Slab Top Polygon
const SLAB_TOP_POLYGON = polyStr([
  toIso(0, 0, 0),
  toIso(620, 0, 0),
  toIso(620, 280, 0),
  toIso(510, 280, 0),
  toIso(510, 185, 0),
  toIso(110, 185, 0),
  toIso(110, 280, 0),
  toIso(0, 280, 0),
]);

// 6 Base Slab Thickness Edges (z = 0 to z = -14)
// 1. ขอบหน้าปีกซ้าย: จาก (0, 280) ไป (110, 280) (#cbd5e1)
const SLAB_LEFT_FRONT = polyStr([
  toIso(0, 280, 0),
  toIso(110, 280, 0),
  toIso(110, 280, BASE_SLAB_DEPTH),
  toIso(0, 280, BASE_SLAB_DEPTH),
]);

// 2. ขอบด้านในของปีกซ้าย (หันเข้าหาลานกลางตัว U): จาก (110, 185) มา (110, 280) (#e2e8f0)
const SLAB_LEFT_INNER = polyStr([
  toIso(110, 185, 0),
  toIso(110, 280, 0),
  toIso(110, 280, BASE_SLAB_DEPTH),
  toIso(110, 185, BASE_SLAB_DEPTH),
]);

// 3. ขอบหน้าระเบียงทางเดินโถงกลาง: จาก (110, 185) ไป (510, 185) (#cbd5e1)
const SLAB_CENTER_FRONT = polyStr([
  toIso(110, 185, 0),
  toIso(510, 185, 0),
  toIso(510, 185, BASE_SLAB_DEPTH),
  toIso(110, 185, BASE_SLAB_DEPTH),
]);

// 4. ขอบหน้าปีกขวา: จาก (510, 280) ไป (620, 280) (#cbd5e1)
const SLAB_RIGHT_FRONT = polyStr([
  toIso(510, 280, 0),
  toIso(620, 280, 0),
  toIso(620, 280, BASE_SLAB_DEPTH),
  toIso(510, 280, BASE_SLAB_DEPTH),
]);

// 5. ขอบด้านนอกฝั่งขวาสุด: จาก (620, 0) มา (620, 280) (#cbd5e1)
const SLAB_RIGHT_OUTER = polyStr([
  toIso(620, 0, 0),
  toIso(620, 280, 0),
  toIso(620, 280, BASE_SLAB_DEPTH),
  toIso(620, 0, BASE_SLAB_DEPTH),
]);

// 6. ขอบด้านนอกฝั่งซ้ายสุด: จาก (0, 0) มา (0, 280) (#e2e8f0)
const SLAB_LEFT_OUTER = polyStr([
  toIso(0, 0, 0),
  toIso(0, 280, 0),
  toIso(0, 280, BASE_SLAB_DEPTH),
  toIso(0, 0, BASE_SLAB_DEPTH),
]);

// Walkway Corridor Surface: x: 110..510, y: 150..185 (#eae4d7)
const WALKWAY_POLYGON = polyStr([
  toIso(110, 150, 0),
  toIso(510, 150, 0),
  toIso(510, 185, 0),
  toIso(110, 185, 0),
]);

const WALKWAY_THRESHOLD = {
  p1: toIso(110, 150, 0),
  p2: toIso(510, 150, 0),
};

const WALKWAY_GUIDE_LINE = {
  p1: toIso(110, 167.5, 0),
  p2: toIso(510, 167.5, 0),
};

// Thin 3D Wall Generation Helper (Thickness ~3.5px, Height ~14px Mappedin Slim Cutaway)
interface WallPrism {
  top: string;
  front?: string;
  left?: string;
  lefts?: string[];
  sortKey: number;
}

function getThinWallsForFloor(floorNum: number): WallPrism[] {
  const walls: WallPrism[] = [];
  const H = 14;
  const T = 3.6;
  const H_T = T / 2; // 1.8px half-thickness to center walls on room borders

  // 1. Back perimeter wall (y = 0..T, x: 0..620)
  walls.push({
    top: polyStr([toIso(0, 0, H), toIso(620, 0, H), toIso(620, T, H), toIso(0, T, H)]),
    front: polyStr([toIso(0, T, H), toIso(620, T, H), toIso(620, T, 0), toIso(0, T, 0)]),
    left: polyStr([toIso(0, 0, H), toIso(0, T, H), toIso(0, T, 0), toIso(0, 0, 0)]),
    sortKey: 10,
  });

  // 2. Left outer wing perimeter wall (x = 0..T, y: T..280)
  walls.push({
    top: polyStr([toIso(0, T, H), toIso(T, T, H), toIso(T, 280, H), toIso(0, 280, H)]),
    left: polyStr([toIso(0, T, H), toIso(0, 280, H), toIso(0, 280, 0), toIso(0, T, 0)]),
    front: polyStr([toIso(0, 280, H), toIso(T, 280, H), toIso(T, 280, 0), toIso(0, 280, 0)]),
    sortKey: 290,
  });

  // 3. Right outer wing perimeter wall (x = 620 - T..620, y: T..280)
  walls.push({
    top: polyStr([toIso(620 - T, T, H), toIso(620, T, H), toIso(620, 280, H), toIso(620 - T, 280, H)]),
    left: polyStr([toIso(620 - T, T, H), toIso(620 - T, 280, H), toIso(620 - T, 280, 0), toIso(620 - T, T, 0)]),
    front: polyStr([toIso(620 - T, 280, H), toIso(620, 280, H), toIso(620, 280, 0), toIso(620 - T, 280, 0)]),
    sortKey: 900,
  });

  // 4. Dividing wall between Left Wing and Service Core (x_b = 110)
  {
    const x1 = 110 - H_T;
    const x2 = 110 + H_T;
    walls.push({
      top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
      left: polyStr([toIso(x1, T, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, T, 0)]),
      front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
      sortKey: 260,
    });
  }

  // 5. Dividing wall between Service Core and Classrooms (x_b = 175)
  {
    const x1 = 175 - H_T;
    const x2 = 175 + H_T;
    if (floorNum > 1) {
      // Floors 2-4: Split left face around the bathroom partition wall at y = 75
      const yPart1 = 75 - H_T;
      const yPart2 = 75 + H_T;
      walls.push({
        top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
        lefts: [
          // Segment 1 (inside Bathroom)
          polyStr([toIso(x1, T, H), toIso(x1, yPart1, H), toIso(x1, yPart1, 0), toIso(x1, T, 0)]),
          // Segment 2 (inside Staircase)
          polyStr([toIso(x1, yPart2, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, yPart2, 0)]),
        ],
        front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
        sortKey: 325,
      });
    } else {
      walls.push({
        top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
        left: polyStr([toIso(x1, T, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, T, 0)]),
        front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
        sortKey: 325,
      });
    }
  }

  // 6. Classroom dividing walls
  if (floorNum === 4) {
    // Floor 4: only dividing wall at x = 265 (between 342 and 343)
    const x1 = 265 - H_T;
    const x2 = 265 + H_T;
    walls.push({
      top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
      left: polyStr([toIso(x1, T, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, T, 0)]),
      front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
      sortKey: 415,
    });
  } else {
    // Floors 1-3: walls at x = 265 and x = 355
    const x1_265 = 265 - H_T;
    const x2_265 = 265 + H_T;
    walls.push({
      top: polyStr([toIso(x1_265, T, H), toIso(x2_265, T, H), toIso(x2_265, 150, H), toIso(x1_265, 150, H)]),
      left: polyStr([toIso(x1_265, T, H), toIso(x1_265, 150, H), toIso(x1_265, 150, 0), toIso(x1_265, T, 0)]),
      front: polyStr([toIso(x1_265, 150, H), toIso(x2_265, 150, H), toIso(x2_265, 150, 0), toIso(x1_265, 150, 0)]),
      sortKey: 415,
    });

    const x1_355 = 355 - H_T;
    const x2_355 = 355 + H_T;
    walls.push({
      top: polyStr([toIso(x1_355, T, H), toIso(x2_355, T, H), toIso(x2_355, 150, H), toIso(x1_355, 150, H)]),
      left: polyStr([toIso(x1_355, T, H), toIso(x1_355, 150, H), toIso(x1_355, 150, 0), toIso(x1_355, T, 0)]),
      front: polyStr([toIso(x1_355, 150, H), toIso(x2_355, 150, H), toIso(x2_355, 150, 0), toIso(x1_355, 150, 0)]),
      sortKey: 505,
    });
  }

  // 7. Dividing wall between Classrooms and Right Service Core (x_b = 445)
  {
    const x1 = 445 - H_T;
    const x2 = 445 + H_T;
    walls.push({
      top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
      left: polyStr([toIso(x1, T, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, T, 0)]),
      front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
      sortKey: 595,
    });
  }

  // 8. Dividing wall between Right Service Core and Right Wing (x_b = 510)
  {
    const x1 = 510 - H_T;
    const x2 = 510 + H_T;
    if (floorNum > 1) {
      // Floors 2-4: Split left face around the bathroom partition wall at y = 75
      const yPart1 = 75 - H_T;
      const yPart2 = 75 + H_T;
      walls.push({
        top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
        lefts: [
          // Segment 1 (inside Bathroom)
          polyStr([toIso(x1, T, H), toIso(x1, yPart1, H), toIso(x1, yPart1, 0), toIso(x1, T, 0)]),
          // Segment 2 (inside Staircase)
          polyStr([toIso(x1, yPart2, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, yPart2, 0)]),
        ],
        front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
        sortKey: 660,
      });
    } else {
      walls.push({
        top: polyStr([toIso(x1, T, H), toIso(x2, T, H), toIso(x2, 150, H), toIso(x1, 150, H)]),
        left: polyStr([toIso(x1, T, H), toIso(x1, 150, H), toIso(x1, 150, 0), toIso(x1, T, 0)]),
        front: polyStr([toIso(x1, 150, H), toIso(x2, 150, H), toIso(x2, 150, 0), toIso(x1, 150, 0)]),
        sortKey: 660,
      });
    }
  }

  // 9. Horizontal partition wall between WC and STAIR in Floors 2–4 (height 14px at y = 75, matching all walls!)
  if (floorNum > 1) {
    const y1 = 75 - H_T;
    const y2 = 75 + H_T;

    // Left Core partition wall: from inner edge of Wall 4 (110 + H_T) to inner edge of Wall 5 (175 - H_T)
    const xL_start = 110 + H_T;
    const xL_end = 175 - H_T;
    walls.push({
      top: polyStr([toIso(xL_start, y1, H), toIso(xL_end, y1, H), toIso(xL_end, y2, H), toIso(xL_start, y2, H)]),
      front: polyStr([toIso(xL_start, y2, H), toIso(xL_end, y2, H), toIso(xL_end, y2, 0), toIso(xL_start, y2, 0)]),
      sortKey: 250,
    });

    // Right Core partition wall: from inner edge of Wall 7 (445 + H_T) to inner edge of Wall 8 (510 - H_T)
    const xR_start = 445 + H_T;
    const xR_end = 510 - H_T;
    walls.push({
      top: polyStr([toIso(xR_start, y1, H), toIso(xR_end, y1, H), toIso(xR_end, y2, H), toIso(xR_start, y2, H)]),
      front: polyStr([toIso(xR_start, y2, H), toIso(xR_end, y2, H), toIso(xR_end, y2, 0), toIso(xR_start, y2, 0)]),
      sortKey: 585,
    });
  }

  // Sort back to front
  walls.sort((a, b) => a.sortKey - b.sortKey);
  return walls;
}

// =====================================================================
// Component: Architectural Room Flat Floor (z = 0) + Details
// =====================================================================
interface ArchitecturalRoomSvgProps {
  room: BuildingRoomPlan;
  currentFloor: number;
  displayTickets: TicketSummary[];
  activeTickets: TicketSummary[];
  currentUserRole?: string;
  technicianFilter?: string;
  selectedRoom: BuildingRoomPlan | null;
  hoveredRoomId: string | null;
  setHoveredRoomId: (id: string | null) => void;
  handleRoomClick: (room: BuildingRoomPlan) => void;
  roomMaintenanceMap: Record<string, boolean>;
  superAdminMode: "active" | "heatmap";
  heatmapMap: Record<string, RoomHeatmapStat>;
}

function ArchitecturalRoomSvg({
  room,
  currentFloor,
  displayTickets,
  activeTickets,
  currentUserRole,
  technicianFilter,
  selectedRoom,
  hoveredRoomId,
  setHoveredRoomId,
  handleRoomClick,
  roomMaintenanceMap,
  superAdminMode,
  heatmapMap,
}: ArchitecturalRoomSvgProps) {
  const pool =
    currentUserRole === "TECHNICIAN" && technicianFilter === "my-tasks"
      ? displayTickets
      : activeTickets;
  const roomTickets = pool.filter((t) => isTicketInRoom(t, room));
  const hasActiveIssue = roomTickets.length > 0;
  const hasCriticalIssue = roomTickets.some(
    (t) => t.priority === "CRITICAL" || t.priority === "URGENT" || t.isUrgent
  );
  const isSelected = selectedRoom?.id === room.id;
  const isHovered = hoveredRoomId === room.id;
  const isMaintenance = Boolean(
    roomMaintenanceMap[room.code] || roomMaintenanceMap[room.id]
  );

  const isStair = room.id.includes("STAIR");
  const isWC = room.id.includes("WC");
  const isOffice = room.type === "office";
  const isLargeLab = room.id.endsWith("343");

  const stat = heatmapMap[room.id] || heatmapMap[room.code];
  const totalHistorical = stat?.totalIssues || roomTickets.length;

  const spec = getRoomGridSpec(room.id, room.code);
  const { x, y, w, d } = spec;

  // Flat Floor Polygon at z = 0
  const floorPolygon = polyStr([
    toIso(x, y, 0),
    toIso(x + w, y, 0),
    toIso(x + w, y + d, 0),
    toIso(x, y + d, 0),
  ]);

  // Status Floor Colors (Mappedin Crisp Cool Architectural Palette)
  let floorFill = "#ffffff";
  let floorStroke = "#cbd5e1";
  let strokeW = 1;
  let roomAnimation: string | undefined = undefined;

  if (isMaintenance) {
    floorFill = "#f1f5f9";
    floorStroke = "#94a3b8";
    strokeW = 1;
  } else if (currentUserRole === "SUPER_ADMIN" && superAdminMode === "heatmap") {
    if (totalHistorical >= 4) {
      floorFill = "#fee2e2";
      floorStroke = "#ef4444";
      strokeW = 2.5;
      roomAnimation = "urgentRoomPulse 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite";
    } else if (totalHistorical >= 2) {
      floorFill = "#fefce8";
      floorStroke = "#f59e0b";
      strokeW = 2;
      roomAnimation = "warningRoomPulse 1.8s ease-in-out infinite";
    } else {
      floorFill = "#ecfdf5";
      floorStroke = "#10b981";
      strokeW = 1.2;
    }
  } else if (isSelected) {
    // Selected Room State: Emerald Isometric Border, Brighter Floor, Smooth Transition
    floorFill = "#ecfdf5";
    floorStroke = "#10b981";
    strokeW = 2.5;
    roomAnimation = undefined;
  } else if (hasCriticalIssue) {
    // Urgent / Critical Alert: Fast pulse (1.1s)
    floorFill = "#fee2e2";
    floorStroke = "#ef4444";
    strokeW = 2.5;
    roomAnimation = "urgentRoomPulse 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite";
  } else if (hasActiveIssue) {
    // Warning Alert: Slower warning rhythm (1.8s)
    floorFill = "#fefce8";
    floorStroke = "#f59e0b";
    strokeW = 2;
    roomAnimation = "warningRoomPulse 1.8s ease-in-out infinite";
  } else if (isHovered) {
    floorFill = "#f8fafc";
    floorStroke = "#3b82f6";
    strokeW = 1.8;
  } else if (isWC) {
    floorFill = "#f0f9ff"; // Ice blue clean & airy
    floorStroke = "#7dd3fc"; // Sky blue crisp border
    strokeW = 1.5;
  } else if (isStair) {
    floorFill = "#f1f5f9"; // Cool slate staircase base
    floorStroke = "#cbd5e1";
    strokeW = 1;
  }

  const isWing = d >= 200;

  // Architectural 3D Extruded Furniture Blocks (Workstations, Lab Benches, Class Desks)
  const desks = useMemo((): DeskBlock3D[] => {
    if (isStair || isWC) return [];

    if (isWing) {
      // Teacher Office / Wing Pod (311, 315, 321, 325, etc.):
      // 6 compact workstation desk blocks in 3 symmetrical pairs + Front Collaboration Table
      return [
        // Workstation Cluster (6 desks in 3 pairs)
        makeDeskBlock(x + 18, y + 36, 26, 16, 4.5),
        makeDeskBlock(x + 66, y + 36, 26, 16, 4.5),
        makeDeskBlock(x + 18, y + 70, 26, 16, 4.5),
        makeDeskBlock(x + 66, y + 70, 26, 16, 4.5),
        makeDeskBlock(x + 18, y + 104, 26, 16, 4.5),
        makeDeskBlock(x + 66, y + 104, 26, 16, 4.5),

        // Front Collaboration / Conference Table (50x24)
        makeDeskBlock(x + 30, y + 210, 50, 24, 4.5),
      ];
    }

    if (isLargeLab) {
      // Double-wide computer lab 343: 4 double lab benches + teacher presentation podium
      return [
        makeDeskBlock(x + 30, y + 36, 48, 16, 4.5),
        makeDeskBlock(x + 102, y + 36, 48, 16, 4.5),
        makeDeskBlock(x + 30, y + 80, 48, 16, 4.5),
        makeDeskBlock(x + 102, y + 80, 48, 16, 4.5),
        // Teacher presentation bench
        makeDeskBlock(x + 70, y + 120, 40, 12, 4.5),
      ];
    }

    // Standard Classrooms (312, 313, 314, etc.):
    // 2 paired rows with center aisle + teacher desk podium
    return [
      makeDeskBlock(x + 14, y + 36, 26, 16, 4.5),
      makeDeskBlock(x + 50, y + 36, 26, 16, 4.5),
      makeDeskBlock(x + 14, y + 72, 26, 16, 4.5),
      makeDeskBlock(x + 50, y + 72, 26, 16, 4.5),
      // Teacher desk podium
      makeDeskBlock(x + 32, y + 118, 26, 12, 4.5),
    ];
  }, [isStair, isWC, isWing, isLargeLab, x, y, w, d]);

  // Architectural Doorway Swing Indicator
  const doorway = useMemo(() => {
    if (isStair || isWC) return null;
    if (isWing) {
      // Wing entrance at the corridor threshold
      const doorX = x === 0 ? 110 : 510;
      const doorY = 165;
      const p1 = toIso(doorX, doorY, 0);
      const p2 = toIso(x === 0 ? 94 : 526, doorY + 12, 0);
      const arcEnd = toIso(doorX, doorY + 16, 0);
      return { p1, p2, arcEnd };
    }
    // Standard classroom entrance at corridor threshold (y = 150)
    const doorX = x + 14;
    const doorY = 150;
    const p1 = toIso(doorX, doorY, 0);
    const p2 = toIso(doorX + 12, doorY - 14, 0);
    const arcEnd = toIso(doorX + 16, doorY, 0);
    return { p1, p2, arcEnd };
  }, [isStair, isWC, isWing, x]);

  // Subtle Ambient Occlusion Contact Shadow along back wall (y = 0..6)
  const ambientShadow = useMemo(() => {
    if (y !== 0) return null;
    return polyStr([
      toIso(x + 2, 2, 0),
      toIso(x + w - 2, 2, 0),
      toIso(x + w - 2, 7, 0),
      toIso(x + 2, 7, 0),
    ]);
  }, [x, y, w]);

  // Distinctive 6-step staircase tread lines
  const stairSteps = useMemo(() => {
    if (!isStair) return [];
    const lines = [];
    const steps = 6;
    // On floor 1, steps are concentrated at y: 60..150
    const startY = currentFloor === 1 ? 60 : y;
    const totalD = currentFloor === 1 ? 90 : d;
    const stepDist = totalD / (steps + 1);
    for (let s = 1; s <= steps; s++) {
      const p1 = toIso(x + 6, startY + s * stepDist, 0);
      const p2 = toIso(x + w - 6, startY + s * stepDist, 0);
      lines.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    }
    return lines;
  }, [isStair, currentFloor, x, y, w, d]);

  return (
    <g
      className="cursor-pointer select-none outline-none focus:outline-none focus-visible:outline-none"
      style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
      onClick={(e) => {
        e.stopPropagation();
        handleRoomClick(room);
      }}
      onMouseEnter={() => setHoveredRoomId(room.id)}
      onMouseLeave={() => setHoveredRoomId(null)}
      role="button"
      tabIndex={0}
      aria-label={`${room.code} ${room.name}`}
    >
      {/* 1. Flat Room Floor Surface (z = 0) */}
      <polygon
        points={floorPolygon}
        fill={floorFill}
        stroke={floorStroke}
        strokeWidth={strokeW}
        strokeDasharray={isMaintenance ? "4 2" : undefined}
        className="transition-all duration-300 ease-out outline-none focus:outline-none focus-visible:outline-none select-none"
        style={{
          outline: "none",
          WebkitTapHighlightColor: "transparent",
          animation: roomAnimation,
        }}
      />

      {/* 2. Ambient Occlusion Contact Shadow along back wall */}
      {ambientShadow && (
        <polygon
          points={ambientShadow}
          fill="rgba(15, 23, 42, 0.03)"
          className="pointer-events-none"
        />
      )}

      {/* 3. 3D Isometric Extruded Desk Furniture Blocks (Low-Poly Architectural Stencils) */}
      <g id={`desks-${room.id}`} className="pointer-events-none select-none">
        {desks.map((block, idx) => (
          <g key={idx} className="desk-block">
            {/* ด้านหน้า-ซ้าย (Left Face): fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" */}
            <polygon
              points={block.left}
              fill="#e2e8f0"
              stroke="#cbd5e1"
              strokeWidth="0.8"
              strokeLinejoin="round"
              className="outline-none select-none"
            />
            {/* ด้านหน้า-ขวา (Right Face): fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" */}
            <polygon
              points={block.right}
              fill="#cbd5e1"
              stroke="#94a3b8"
              strokeWidth="0.8"
              strokeLinejoin="round"
              className="outline-none select-none"
            />
            {/* ด้านบน (Top Face): fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" */}
            <polygon
              points={block.top}
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="0.8"
              strokeLinejoin="round"
              className="outline-none select-none"
            />
          </g>
        ))}
      </g>

      {/* 4. Architectural Doorway Indicator (Door Leaf & Swing Arc) */}
      {doorway && (
        <g className="pointer-events-none opacity-50">
          <line
            x1={doorway.p1.x}
            y1={doorway.p1.y}
            x2={doorway.p2.x}
            y2={doorway.p2.y}
            stroke="#94a3b8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d={`M ${doorway.p2.x} ${doorway.p2.y} Q ${doorway.p1.x + (doorway.arcEnd.x - doorway.p1.x) * 0.8} ${doorway.p1.y + (doorway.arcEnd.y - doorway.p1.y) * 0.8} ${doorway.arcEnd.x} ${doorway.arcEnd.y}`}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            strokeDasharray="2 2"
          />
        </g>
      )}

      {/* 5. Distinctive Isometric Staircase Steps (Mappedin Crisp Slate) */}
      {isStair &&
        stairSteps.map((line, idx) => (
          <line
            key={idx}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#64748b"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="pointer-events-none"
          />
        ))}
    </g>
  );
}

// =====================================================================
// Component: Signature Dark Pill UI & Floating Pins Layer
// =====================================================================
interface RoomPillLayerProps {
  room: BuildingRoomPlan;
  currentFloor: number;
  displayTickets: TicketSummary[];
  activeTickets: TicketSummary[];
  currentUserRole?: string;
  technicianFilter?: string;
  selectedRoom: BuildingRoomPlan | null;
  hoveredRoomId: string | null;
  setHoveredRoomId: (id: string | null) => void;
  handleRoomClick: (room: BuildingRoomPlan) => void;
  roomMaintenanceMap: Record<string, boolean>;
  superAdminMode: "active" | "heatmap";
  heatmapMap: Record<string, RoomHeatmapStat>;
}

function RoomPillLayer({
  room,
  currentFloor,
  displayTickets,
  activeTickets,
  currentUserRole,
  technicianFilter,
  selectedRoom,
  hoveredRoomId,
  setHoveredRoomId,
  handleRoomClick,
  roomMaintenanceMap,
  superAdminMode,
  heatmapMap,
}: RoomPillLayerProps) {
  const pool =
    currentUserRole === "TECHNICIAN" && technicianFilter === "my-tasks"
      ? displayTickets
      : activeTickets;
  const roomTickets = pool.filter((t) => isTicketInRoom(t, room));
  const hasActiveIssue = roomTickets.length > 0;
  const hasCriticalIssue = roomTickets.some(
    (t) => t.priority === "CRITICAL" || t.priority === "URGENT" || t.isUrgent
  );
  const isSelected = selectedRoom?.id === room.id;
  const isHovered = hoveredRoomId === room.id;
  const isMaintenance = Boolean(
    roomMaintenanceMap[room.code] || roomMaintenanceMap[room.id]
  );

  const isStair = room.id.includes("STAIR");
  const isWC = room.id.includes("WC");
  const isLeftWing = room.id.endsWith("311") || room.id.endsWith("321") || room.id.endsWith("331") || room.id.endsWith("341");
  const isRightWing = room.id.endsWith("315") || room.id.endsWith("325") || room.id.endsWith("335") || room.id.endsWith("344");

  const stat = heatmapMap[room.id] || heatmapMap[room.code];
  const totalHistorical = stat?.totalIssues || roomTickets.length;
  const isHeatmapMode = currentUserRole === "SUPER_ADMIN" && superAdminMode === "heatmap";

  const spec = getRoomGridSpec(room.id, room.code);

  // Precision center placement to prevent any label collision
  let cx = spec.x + spec.w * 0.5;
  let cy = spec.y + spec.d * 0.5;

  if (isLeftWing || isRightWing) {
    cy = spec.y + spec.d * 0.58; // Pull down to front of wing
  } else if (isWC) {
    cy = spec.y + spec.d * 0.48; // Centered inside WC (y: 0..75)
  } else if (isStair) {
    cy = spec.y + (currentFloor === 1 ? spec.d * 0.65 : spec.d * 0.62); // Centered inside Stair (y: 75..150)
  }

  const center = toIso(cx, cy, 0);
  if (isStair) {
    // ขยับพิกัดวางป้ายแคปซูลของโถงบันไดลงมาด้านหน้าอีก 14px เพื่อไม่ให้ตัวป้ายไปทับกับป้าย WC ด้านหลัง
    center.y += 14;
  }
  if (room.id.includes("322") || room.code.includes("322")) {
    // ขยับตำแหน่งป้ายและหมุดแจ้งเตือนของห้อง 322 ลงมาทางด้านล่าง (แนวระเบียง) อีก 16px เพื่อไม่ให้หมุดประแจซ้อนเบียดกับป้ายห้องน้ำหญิง
    center.y += 16;
  }

  // Clean room number without floor prefix (e.g., "04-341" -> "341")
  const cleanNumber = room.code.replace(/^0\d-/, "");
  const thaiName = getShortThaiName(room);
  const thaiSubtitle = getCleanRoomSubtitle(room);

  // Mappedin compact pill sizing
  let pillW: number;
  const pillH = 22;
  const pillRx = 11;

  if (isStair) {
    pillW = Math.max(76, thaiName.length * 6 + 28);
  } else if (isWC) {
    pillW = Math.max(82, thaiName.length * 6 + 30);
  } else {
    pillW = Math.max(54, cleanNumber.length * 8 + 26);
  }

  const pillX = Math.round(center.x - pillW / 2);
  const pillY = Math.round(center.y - 10 - pillH / 2);

  // Status Colors for Pill Border and Dot
  let strokeColor = isWC ? "#7dd3fc" : "#cbd5e1";
  let dotColor = "#10b981";

  if (isMaintenance) {
    strokeColor = "#94a3b8";
    dotColor = "#94a3b8";
  } else if (hasCriticalIssue || (isHeatmapMode && totalHistorical >= 4)) {
    strokeColor = "#ef4444";
    dotColor = "#dc2626";
  } else if (hasActiveIssue || (isHeatmapMode && totalHistorical >= 2)) {
    strokeColor = "#f59e0b";
    dotColor = "#ea580c";
  } else if (isSelected) {
    strokeColor = "#10b981";
    dotColor = "#10b981";
  } else if (isHovered) {
    strokeColor = "#3b82f6";
  }

  const ticketCount = isHeatmapMode ? totalHistorical : roomTickets.length;
  const showPin = hasActiveIssue && !isHeatmapMode;
  const showCountBadge = ticketCount > 0;

  return (
    <g
      className="cursor-pointer select-none transition-transform duration-150 outline-none focus:outline-none focus-visible:outline-none"
      style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
      onClick={(e) => {
        e.stopPropagation();
        handleRoomClick(room);
      }}
      onMouseEnter={() => setHoveredRoomId(room.id)}
      onMouseLeave={() => setHoveredRoomId(null)}
    >
      {/* 1. Mappedin White Capsule Container */}
      <rect
        x={pillX}
        y={pillY}
        width={pillW}
        height={pillH}
        rx={pillRx}
        fill="#ffffff"
        stroke={strokeColor}
        strokeWidth={hasCriticalIssue || isSelected ? 2 : hasActiveIssue ? 1.6 : 1.2}
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
        className="outline-none focus:outline-none focus-visible:outline-none select-none"
        style={{
          outline: "none",
          WebkitTapHighlightColor: "transparent",
          animation:
            hasCriticalIssue && !isSelected
              ? "urgentBorderPulse 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              : hasActiveIssue && !isSelected
              ? "warningBorderPulse 1.8s ease-in-out infinite"
              : undefined,
        }}
      />

      {/* 2. Badge Content */}
      {isStair ? (
        <g className="pointer-events-none select-none">
          <g transform={`translate(${pillX + 9}, ${pillY + 6})`}>
            <path
              d="M1 9.5 L3.5 9.5 L3.5 6.5 L6 6.5 L6 3.5 L8.5 3.5 L8.5 1 L11 1"
              fill="none"
              stroke="#475569"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <text
            x={pillX + 24}
            y={pillY + pillH / 2 + 0.5}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={10}
            fontWeight="600"
            fill="#334155"
          >
            {thaiName}
          </text>
        </g>
      ) : isWC ? (
        <g className="pointer-events-none select-none">
          <text
            x={pillX + 9}
            y={pillY + pillH / 2 + 0.5}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={11}
          >
            🚻
          </text>
          <text
            x={pillX + 24}
            y={pillY + pillH / 2 + 0.5}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={10}
            fontWeight="600"
            fill="#0284c7"
          >
            {thaiName}
          </text>
        </g>
      ) : (
        <g className="pointer-events-none select-none">
          {/* Status Dot */}
          <circle
            cx={pillX + 10}
            cy={pillY + pillH / 2}
            r={3}
            fill={dotColor}
            style={{
              animation:
                hasCriticalIssue && !isSelected
                  ? "urgentDotPulse 1.1s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                  : hasActiveIssue && !isSelected
                  ? "warningDotPulse 1.8s ease-in-out infinite"
                  : undefined,
              transformOrigin: "center",
              transformBox: "fill-box",
            }}
          />
          {/* Room Number */}
          <text
            x={pillX + 17}
            y={pillY + pillH / 2 + 0.5}
            textAnchor="start"
            dominantBaseline="central"
            fontSize={11}
            fontWeight="700"
            fill="#0f172a"
            letterSpacing="-0.02em"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          >
            {cleanNumber}
          </text>
        </g>
      )}

      {/* 3. Concise Thai Room Name Below Badge (Classrooms / Labs / Offices) */}
      {!isStair && !isWC && (
        <text
          x={center.x}
          y={pillY + pillH + 11}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          fontWeight={isSelected || isHovered ? "600" : "500"}
          fill={isSelected ? "#047857" : hasCriticalIssue ? "#dc2626" : hasActiveIssue ? "#ea580c" : "#64748b"}
          letterSpacing="-0.01em"
          className="pointer-events-none select-none"
        >
          {thaiSubtitle}
        </text>
      )}

      {/* 4. Count Badge at Top Right Corner of Pill */}
      {showCountBadge && (
        <g transform={`translate(${pillX + pillW - 2}, ${pillY + 2})`} className="pointer-events-none select-none">
          <circle
            cx={0}
            cy={0}
            r={7.5}
            fill={hasCriticalIssue || (isHeatmapMode && totalHistorical >= 4) ? "#dc2626" : isHeatmapMode ? "#9333ea" : "#ea580c"}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={0.5}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={9}
            fontWeight="900"
            fill="#ffffff"
            fontFamily="monospace"
            className="pointer-events-none select-none"
          >
            {ticketCount}
          </text>
        </g>
      )}

      {/* 5. Floating Action Icon (Anchored at center.x, pillY - 24) */}
      {showPin && (
        <g transform={`translate(${center.x}, ${pillY - 24})`} className="select-none pointer-events-none">
          {/* Inner group with bounce animation relative to parent translation */}
          <g style={{ animation: hasCriticalIssue ? "pinBounce 1.2s ease-in-out infinite" : undefined }}>
            {/* Stem connecting floating pin to pill */}
            <line
              x1={0}
              y1={12}
              x2={0}
              y2={22}
              stroke={hasCriticalIssue ? "#dc2626" : "#ea580c"}
              strokeWidth={2}
              strokeLinecap="round"
            />

            {/* Radar Ping wave circle behind pin */}
            <circle
              cx={0}
              cy={0}
              r={12}
              fill={hasCriticalIssue ? "#ef4444" : "#f59e0b"}
              className="pointer-events-none"
              style={{
                animation: hasCriticalIssue
                  ? "radarPing 1.2s cubic-bezier(0, 0, 0.2, 1) infinite"
                  : "radarPing 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
                transformOrigin: "center",
                transformBox: "fill-box",
              }}
            />

            {/* Action Circle */}
            <circle
              cx={0}
              cy={0}
              r={12}
              fill={hasCriticalIssue ? "#dc2626" : "#ea580c"}
              stroke="#ffffff"
              strokeWidth={2}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            <text
              x={0}
              y={hasCriticalIssue ? 0.5 : 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={hasCriticalIssue ? 13 : 11}
              fontWeight="900"
              fill="#ffffff"
              className="pointer-events-none select-none"
            >
              {hasCriticalIssue ? "!" : "🔧"}
            </text>
          </g>
        </g>
      )}
    </g>
  );
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

  // Sorted rooms and thin cutaway walls for current floor
  const sortedFloorRooms = useMemo(() => {
    return [...currentFloorData.rooms].sort((a, b) => {
      const specA = getRoomGridSpec(a.id, a.code);
      const specB = getRoomGridSpec(b.id, b.code);
      return (specA.x + specA.w + (specA.y + specA.d)) - (specB.x + specB.w + (specB.y + specB.d));
    });
  }, [currentFloorData]);

  const floorCutawayWalls = useMemo(() => {
    return getThinWallsForFloor(currentFloor);
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
        <div className="relative flex-1 w-full h-[640px] md:h-[680px] rounded-2xl border border-slate-200/90 bg-slate-50/70 overflow-hidden shadow-sm">
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
            initialScale={1.15}
            minScale={0.7}
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
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  {/* Warm Stone Architectural Cutaway Floorplan */}
                  <div className="relative w-full h-full flex items-center justify-center select-none">
                    <svg
                      viewBox="195 55 860 570"
                      preserveAspectRatio="xMidYMid meet"
                      className="w-full h-full select-none outline-none focus:outline-none focus-visible:outline-none"
                      style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                      onClick={() => {
                        setSelectedRoom(null);
                        setSelectedSubPin(null);
                        setResolvingTicketId(null);
                      }}
                    >
                      <defs>
                        <style>{`
                          svg, svg *, g, polygon, rect, path, circle, text {
                            outline: none !important;
                            -webkit-tap-highlight-color: transparent !important;
                          }
                          *:focus, *:focus-visible {
                            outline: none !important;
                          }
                          @keyframes urgentRoomPulse {
                            0%, 100% { fill-opacity: 0.9; stroke-width: 2.8px; stroke-opacity: 1; }
                            50% { fill-opacity: 0.35; stroke-width: 4px; stroke-opacity: 0.45; }
                          }
                          @keyframes warningRoomPulse {
                            0%, 100% { fill-opacity: 0.9; stroke-width: 2.2px; stroke-opacity: 1; }
                            50% { fill-opacity: 0.45; stroke-width: 3.2px; stroke-opacity: 0.55; }
                          }
                          @keyframes radarPing {
                            0% { transform: scale(1); opacity: 0.85; }
                            80%, 100% { transform: scale(2.4); opacity: 0; }
                          }
                          @keyframes pinBounce {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-4px); }
                          }
                          @keyframes urgentDotPulse {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.25; transform: scale(0.65); }
                          }
                          @keyframes warningDotPulse {
                            0%, 100% { opacity: 1; transform: scale(1); }
                            50% { opacity: 0.35; transform: scale(0.75); }
                          }
                          @keyframes urgentBorderPulse {
                            0%, 100% { stroke: #ef4444; stroke-width: 2px; stroke-opacity: 1; }
                            50% { stroke: #ef4444; stroke-width: 3.2px; stroke-opacity: 0.35; }
                          }
                          @keyframes warningBorderPulse {
                            0%, 100% { stroke: #f59e0b; stroke-width: 1.6px; stroke-opacity: 1; }
                            50% { stroke: #f59e0b; stroke-width: 2.6px; stroke-opacity: 0.4; }
                          }
                        `}</style>
                        {/* Soft Architectural Drop Shadow for Base Slab */}
                        <filter id="slabShadow" x="-10%" y="-10%" width="130%" height="130%">
                          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0f172a" floodOpacity="0.08" />
                        </filter>
                        {/* Architectural Blueprint Micro Dot Grid */}
                        <pattern id="archDotGrid" width="28" height="28" patternUnits="userSpaceOnUse">
                          <circle cx="14" cy="14" r="1.1" fill="#cbd5e1" opacity="0.45" />
                        </pattern>
                      </defs>

                      {/* Studio Background Grid */}
                      <rect x="180" y="40" width="890" height="600" fill="url(#archDotGrid)" rx="16" className="pointer-events-none" />

                      {/* 1. Base Ground Foundation Slab (Unified U-Shape with 6 Precise Extrusion Faces) */}
                      <g
                        id="base-foundation-slab"
                        filter="url(#slabShadow)"
                        className="outline-none focus:outline-none focus-visible:outline-none select-none"
                        style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                      >
                        {/* 6 Thickness Edges (z = 0 down to z = -14) */}
                        {/* ขอบด้านนอกฝั่งซ้ายสุด (#e2e8f0) */}
                        <polygon points={SLAB_LEFT_OUTER} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />
                        {/* ขอบหน้าปีกซ้าย (#cbd5e1) */}
                        <polygon points={SLAB_LEFT_FRONT} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />
                        {/* ขอบด้านในของปีกซ้าย หันเข้าหาลานกลางตัว U (#e2e8f0) */}
                        <polygon points={SLAB_LEFT_INNER} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="0.8" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />
                        {/* ขอบหน้าระเบียงทางเดินโถงกลาง (#cbd5e1) */}
                        <polygon points={SLAB_CENTER_FRONT} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />
                        {/* ขอบหน้าปีกขวา (#cbd5e1) */}
                        <polygon points={SLAB_RIGHT_FRONT} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />
                        {/* ขอบด้านนอกฝั่งขวาสุด (#cbd5e1) */}
                        <polygon points={SLAB_RIGHT_OUTER} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />

                        {/* Top Slab Surface (#f8fafc) */}
                        <polygon points={SLAB_TOP_POLYGON} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />

                        {/* Walkway Corridor Surface (#f1f5f9) */}
                        <polygon points={WALKWAY_POLYGON} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" className="outline-none focus:outline-none focus-visible:outline-none select-none" style={{ outline: "none", WebkitTapHighlightColor: "transparent" }} />

                        {/* Corridor Threshold Line at y = 150 */}
                        <line
                          x1={WALKWAY_THRESHOLD.p1.x}
                          y1={WALKWAY_THRESHOLD.p1.y}
                          x2={WALKWAY_THRESHOLD.p2.x}
                          y2={WALKWAY_THRESHOLD.p2.y}
                          stroke="#cbd5e1"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {/* Walkway Dashed Guide Line at y = 167.5 */}
                        <line
                          x1={WALKWAY_GUIDE_LINE.p1.x}
                          y1={WALKWAY_GUIDE_LINE.p1.y}
                          x2={WALKWAY_GUIDE_LINE.p2.x}
                          y2={WALKWAY_GUIDE_LINE.p2.y}
                          stroke="#cbd5e1"
                          strokeWidth="1.5"
                          strokeDasharray="6 4"
                          strokeLinecap="round"
                        />
                      </g>

                      {/* 2. Flat Room Floors Layer (z = 0) with Miniature Desks, Stairs, & Target Nodes */}
                      <g
                        id="room-floors-layer"
                        className="outline-none focus:outline-none focus-visible:outline-none select-none"
                        style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                      >
                        {sortedFloorRooms.map((room) => (
                          <ArchitecturalRoomSvg
                            key={room.id}
                            room={room}
                            currentFloor={currentFloor}
                            displayTickets={displayTickets}
                            activeTickets={activeTickets}
                            currentUserRole={currentUserRole}
                            technicianFilter={technicianFilter}
                            selectedRoom={selectedRoom}
                            hoveredRoomId={hoveredRoomId}
                            setHoveredRoomId={setHoveredRoomId}
                            handleRoomClick={handleRoomClick}
                            roomMaintenanceMap={roomMaintenanceMap}
                            superAdminMode={superAdminMode}
                            heatmapMap={heatmapMap}
                          />
                        ))}
                      </g>

                      {/* 3. Thin 3D Cutaway Walls (Thickness ~3.6px, Height ~14px Mappedin Crisp Cool Architecture) */}
                      <g
                        id="thin-cutaway-walls-layer"
                        className="pointer-events-none outline-none focus:outline-none focus-visible:outline-none select-none"
                        style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                      >
                        {floorCutawayWalls.map((wall, idx) => (
                          <g
                            key={idx}
                            className="wall-segment outline-none focus:outline-none focus-visible:outline-none select-none"
                            style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                          >
                            {wall.left && (
                              <polygon
                                points={wall.left}
                                fill="#e2e8f0"
                                stroke="#cbd5e1"
                                strokeWidth="0.6"
                                className="outline-none focus:outline-none focus-visible:outline-none select-none"
                                style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                              />
                            )}
                            {wall.lefts &&
                              wall.lefts.map((pts, lIdx) => (
                                <polygon
                                  key={lIdx}
                                  points={pts}
                                  fill="#e2e8f0"
                                  stroke="#cbd5e1"
                                  strokeWidth="0.6"
                                  className="outline-none focus:outline-none focus-visible:outline-none select-none"
                                  style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                                />
                              ))}
                            {wall.front && (
                              <polygon
                                points={wall.front}
                                fill="#cbd5e1"
                                stroke="#94a3b8"
                                strokeWidth="0.6"
                                className="outline-none focus:outline-none focus-visible:outline-none select-none"
                                style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                              />
                            )}
                            <polygon
                              points={wall.top}
                              fill="#ffffff"
                              stroke="#475569"
                              strokeWidth="1.2"
                              className="outline-none focus:outline-none focus-visible:outline-none select-none"
                              style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                            />
                          </g>
                        ))}
                      </g>

                      {/* 4. Mappedin Minimalist Labels & Floating Pins */}
                      <g
                        id="signature-pills-and-pins-layer"
                        className="outline-none focus:outline-none focus-visible:outline-none select-none"
                        style={{ outline: "none", WebkitTapHighlightColor: "transparent" }}
                      >
                        {sortedFloorRooms.map((room) => (
                          <RoomPillLayer
                            key={room.id}
                            room={room}
                            currentFloor={currentFloor}
                            displayTickets={displayTickets}
                            activeTickets={activeTickets}
                            currentUserRole={currentUserRole}
                            technicianFilter={technicianFilter}
                            selectedRoom={selectedRoom}
                            hoveredRoomId={hoveredRoomId}
                            setHoveredRoomId={setHoveredRoomId}
                            handleRoomClick={handleRoomClick}
                            roomMaintenanceMap={roomMaintenanceMap}
                            superAdminMode={superAdminMode}
                            heatmapMap={heatmapMap}
                          />
                        ))}
                      </g>
                    </svg>
                  </div>
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
