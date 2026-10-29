// lib/constants/building-plan.ts
// Master Data สำหรับแผนผังอาคาร 4 ชั้น สไตล์ 2.5D Isometric Architectural Map (Mappedin Style)
// อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (BLD-COMPTECH)

export interface IsometricPoint {
  x: number;
  y: number;
}

export interface IsometricWall {
  top: string;   // SVG polygon points for top surface
  front?: string; // SVG polygon points for front face
  side?: string;  // SVG polygon points for side face
}

export interface SubPin {
  id: string;
  code: string;
  name: string;
  type: "desk" | "power" | "hardware" | "network" | "ac" | "restroom" | "av";
  x: number;
  y: number;
  description?: string;
}

export interface BuildingRoomPlan {
  id: string; // Matches Room ID or code in system e.g. "Lab101"
  code: string; // e.g. "01-LAB-101"
  name: string;
  shortName: string;
  floor: number;
  type: "lab" | "office" | "classroom" | "facility" | "common" | "server";
  badge: string;
  supervisor: string;
  supervisorRole: string;
  supervisorPhone?: string;
  description: string;
  capacity?: string;
  primaryCategory: string; // Default Category for quick report
  centerPoint: IsometricPoint; // Point for main floating room pin/badge
  floorPolygon: string; // SVG polygon points for floor plane
  walls: IsometricWall[]; // 3D extruded walls
  desks?: string[]; // Mini interior desk/furniture polygons
  subPins: SubPin[]; // Sub-location pins within the room
  equipmentList?: string[];
}

export interface FloorPlanData {
  floor: number;
  label: string;
  shortLabel: string;
  nameTh: string;
  description: string;
  accentColor: string;
  slabPolygon: string; // Ground slab top
  slabFront: string;   // Ground slab front bevel
  slabSide: string;    // Ground slab side bevel
  corridorPolygon?: string; // Walkway polygon
  rooms: BuildingRoomPlan[];
}

/**
 * ข้อมูลผังอาคาร 2.5D Isometric ทั้ง 4 ชั้น
 * อ้างอิงขนาด Canvas มาตรฐาน viewBox="0 0 960 620"
 */
export const BUILDING_FLOORS_PLAN: FloorPlanData[] = [
  // ==========================================
  // FLOOR 1: Hardware Lab & Common Facility
  // ==========================================
  {
    floor: 1,
    label: "ชั้น 1",
    shortLabel: "1F",
    nameTh: "ปฏิบัติการฮาร์ดแวร์ ซ่อมบำรุง และโถงกิจกรรม",
    description: "จุดบริการซ่อมบำรุงคอมพิวเตอร์ คลังอะไหล่ช่าง ห้องน้ำส่วนกลาง และลานกิจกรรมประชาสัมพันธ์",
    accentColor: "#10b981", // Emerald
    slabPolygon: "120,290 530,90 890,270 480,480",
    slabFront: "480,480 890,270 890,290 480,500",
    slabSide: "120,290 480,480 480,500 120,310",
    corridorPolygon: "290,280 490,180 670,270 470,370",
    rooms: [
      {
        id: "Lab101",
        code: "01-LAB-101",
        name: "ห้องปฏิบัติการฮาร์ดแวร์และซ่อมบำรุงคอมพิวเตอร์ (Lab 101)",
        shortName: "Lab 101 ฮาร์ดแวร์",
        floor: 1,
        type: "lab",
        badge: "ห้องแล็บฮาร์ดแวร์",
        supervisor: "ครูสมชาย รัตนวิจิตร",
        supervisorRole: "ครูผู้ควบคุมห้องปฏิบัติการฮาร์ดแวร์",
        supervisorPhone: "081-555-4921 (ต่อ 101)",
        description: "ปฏิบัติการประกอบเครื่องคอมพิวเตอร์ ตรวจเช็คเมนบอร์ด ซ่อมบำรุง และทดสอบพาวเวอร์ซัพพลาย",
        capacity: "35 ที่นั่งปฏิบัติการ",
        primaryCategory: "PC_HARDWARE",
        centerPoint: { x: 280, y: 220 },
        floorPolygon: "180,260 360,170 470,225 290,315",
        walls: [
          {
            top: "180,240 360,150 364,152 184,242",
            front: "184,242 364,152 364,170 184,260",
            side: "180,240 184,242 184,260 180,258",
          },
          {
            top: "360,150 470,205 470,209 360,154",
            front: "360,154 470,209 470,225 360,170",
          },
        ],
        desks: [
          "230,245 280,220 310,235 260,260",
          "270,225 320,200 350,215 300,240",
          "310,205 360,180 390,195 340,220",
        ],
        subPins: [
          { id: "p-101-1", code: "01-D-01", name: "โต๊ะประกอบคอมพิวเตอร์แถว 1", type: "hardware", x: 270, y: 235 },
          { id: "p-101-2", code: "01-D-02", name: "โต๊ะซ่อมบำรุงและบัดกรี", type: "power", x: 310, y: 215, description: "มีปลั๊กไฟ 220V และเครื่องดูดควันตะกั่ว" },
          { id: "p-101-3", code: "01-AC-01", name: "แอร์แขวนผนัง Lab 101", type: "ac", x: 230, y: 200 },
        ],
        equipmentList: ["เวิร์กสเตชันประกอบคอม 25 ชุด", "เครื่องวัดสัญญาณ Oscilloscope", "สถานีบัดกรี Soldering Station", "ชุดเทสเตอร์พาวเวอร์ซัพพลาย"],
      },
      {
        id: "StaffRoom102",
        code: "01-TOOL-RM",
        name: "ห้องพักเจ้าหน้าที่และศูนย์ซ่อมบำรุงเครื่องมือช่าง",
        shortName: "ศูนย์ช่างเทคนิค 1F",
        floor: 1,
        type: "office",
        badge: "ศูนย์ช่างเทคนิค",
        supervisor: "Alex Morgan (อเล็กซ์ มอร์แกน)",
        supervisorRole: "หัวหน้าทีมช่างเทคนิคประจำอาคาร",
        supervisorPhone: "081-555-4921 (ต่อ 102)",
        description: "ศูนย์รับแจ้งเหตุเบื้องต้น คลังสำรองอะไหล่คอมพิวเตอร์ และจุดประจำการช่างเทคนิคประจำอาคาร",
        capacity: "เจ้าหน้าที่ 6 นาย",
        primaryCategory: "ELECTRICAL",
        centerPoint: { x: 580, y: 175 },
        floorPolygon: "490,110 690,210 590,260 390,160",
        walls: [
          {
            top: "490,90 690,190 694,192 494,92",
            front: "494,92 694,192 694,210 494,110",
            side: "490,90 494,92 494,110 490,108",
          },
          {
            top: "690,190 590,240 590,244 690,194",
            front: "690,194 590,244 590,260 690,210",
          },
        ],
        desks: [
          "480,145 540,115 570,130 510,160",
          "530,170 590,140 620,155 560,185",
        ],
        subPins: [
          { id: "p-102-1", code: "01-D-10", name: "โต๊ะจ่ายงานช่างภาคสนาม", type: "desk", x: 535, y: 145 },
          { id: "p-102-2", code: "01-PWR-BOX", name: "ตู้ควบคุมไฟฟ้าหลักชั้น 1 (MDB-1)", type: "power", x: 610, y: 165 },
        ],
        equipmentList: ["กล่องเครื่องมือช่างช่างไฟฟ้า", "สายแล็บทดสอบ LAN Fluke Tester", "อะไหล่สำรอง PSU/RAM/SSD", "บันไดช่างและเครื่องเป่าลม"],
      },
      {
        id: "Restroom103",
        code: "01-WC-01",
        name: "ห้องน้ำรวม ชั้น 1",
        shortName: "ห้องน้ำ 1F",
        floor: 1,
        type: "facility",
        badge: "สุขภัณฑ์",
        supervisor: "งานอาคารสถานที่และสิ่งแวดล้อม",
        supervisorRole: "ผู้ดูแลสุขาภิบาล",
        description: "ห้องสุขาชาย 4 ห้อง ห้องสุขาหญิง 4 ห้อง และโถปัสสาวะอัตโนมัติประจำชั้น 1",
        capacity: "8 ห้องสุขา",
        primaryCategory: "PLUMBING",
        centerPoint: { x: 670, y: 290 },
        floorPolygon: "580,245 740,325 670,360 510,280",
        walls: [
          {
            top: "580,225 740,305 744,307 584,227",
            front: "584,227 744,307 744,325 584,245",
          },
        ],
        subPins: [
          { id: "p-103-1", code: "01-WC-M", name: "ห้องสุขาชายและโถปัสสาวะ", type: "restroom", x: 620, y: 285 },
          { id: "p-103-2", code: "01-WC-F", name: "ห้องสุขาหญิงและอ่างล้างมือ", type: "restroom", x: 680, y: 315 },
        ],
        equipmentList: ["ปั๊มน้ำเพิ่มแรงดัน", "เซนเซอร์ก๊อกน้ำอัตโนมัติ", "ระบบระบายอากาศ"],
      },
      {
        id: "Hall104",
        code: "01-ACT-HALL",
        name: "ลานกิจกรรมและโถงอเนกประสงค์ชั้นล่าง",
        shortName: "โถงกิจกรรม 1F",
        floor: 1,
        type: "common",
        badge: "พื้นที่ส่วนกลาง",
        supervisor: "ฝ่ายกิจกรรมและพัฒนานักศึกษา",
        supervisorRole: "ผู้ดูแลพื้นที่ส่วนกลาง",
        description: "ลานกิจกรรมกว้างขวาง บอร์ดนิทรรศการ ซุ้มบริการนักศึกษา และจุดพักผ่อน",
        capacity: "120 คน",
        primaryCategory: "FURNITURE",
        centerPoint: { x: 380, y: 390 },
        floorPolygon: "260,330 450,235 560,290 370,385",
        walls: [],
        desks: [
          "340,320 380,300 400,310 360,330",
          "410,285 450,265 470,275 430,295",
        ],
        subPins: [
          { id: "p-104-1", code: "01-INF-01", name: "จุดประชาสัมพันธ์และตู้คีออสก์", type: "desk", x: 370, y: 330 },
          { id: "p-104-2", code: "01-WIFI-01", name: "Wi-Fi Access Point โถงกลาง", type: "network", x: 440, y: 280 },
        ],
        equipmentList: ["หน้าจอ Digital Signage 65 นิ้ว", "ตู้กดน้ำดื่มระบบ Reverse Osmosis", "ชุดโซฟารับรอง"],
      },
    ],
  },

  // ==========================================
  // FLOOR 2: Theory Classrooms & Faculty Office
  // ==========================================
  {
    floor: 2,
    label: "ชั้น 2",
    shortLabel: "2F",
    nameTh: "ห้องเรียนบรรยายทฤษฎี และสำนักงานแผนกวิชา",
    description: "ห้องเรียนบรรยายทฤษฎี 201 และ 202 พร้อมห้องพักคณาจารย์และสำนักงานธุรการแผนก",
    accentColor: "#3b82f6", // Blue
    slabPolygon: "120,290 530,90 890,270 480,480",
    slabFront: "480,480 890,270 890,290 480,500",
    slabSide: "120,290 480,480 480,500 120,310",
    corridorPolygon: "290,280 490,180 670,270 470,370",
    rooms: [
      {
        id: "Room201",
        code: "02-RM-201",
        name: "ห้อง 201 ห้องเรียนบรรยายทฤษฎี (Room 201)",
        shortName: "ห้อง 201 บรรยาย",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี",
        supervisor: "อ.วิชัย แสงทอง",
        supervisorRole: "ครูประจำชั้น ปวช.2",
        description: "ห้องเรียนบรรยายทฤษฎี โต๊ะเลกเชอร์เดี่ยว พร้อมเครื่องปรับอากาศและโปรเจกเตอร์",
        capacity: "45 ที่นั่ง",
        primaryCategory: "AV_EQUIPMENT",
        centerPoint: { x: 260, y: 220 },
        floorPolygon: "180,260 320,190 410,235 270,305",
        walls: [
          {
            top: "180,240 320,170 324,172 184,242",
            front: "184,242 324,172 324,190 184,260",
          },
        ],
        desks: [
          "240,240 270,225 285,232 255,247",
          "270,225 300,210 315,217 285,232",
        ],
        subPins: [
          { id: "p-201-1", code: "02-PRJ-01", name: "โปรเจกเตอร์ Epson Full HD", type: "av", x: 285, y: 215 },
          { id: "p-201-2", code: "02-AC-201", name: "เครื่องปรับอากาศ Inverter 36,000 BTU", type: "ac", x: 230, y: 210 },
        ],
        equipmentList: ["โปรเจกเตอร์ฉายภาพเพดาน", "จอรับภาพมอเตอร์ไฟฟ้า 120 นิ้ว", "ชุดไมโครโฟนไร้สาย"],
      },
      {
        id: "Room202",
        code: "02-RM-202",
        name: "ห้อง 202 ห้องเรียนบรรยายทฤษฎี (Room 202)",
        shortName: "ห้อง 202 บรรยาย",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี",
        supervisor: "อ.ณัฐพร เกียรติสกุล",
        supervisorRole: "ครูประจำชั้น ปวช.3",
        description: "ห้องเรียนทฤษฎีระบบดิจิทัลและการเขียนโปรแกรม รองรับ 40 ที่นั่ง",
        capacity: "40 ที่นั่ง",
        primaryCategory: "AV_EQUIPMENT",
        centerPoint: { x: 380, y: 175 },
        floorPolygon: "320,190 460,120 550,165 410,235",
        walls: [
          {
            top: "320,170 460,100 464,102 324,172",
            front: "324,172 464,102 464,120 324,190",
          },
        ],
        desks: [
          "380,180 410,165 425,172 395,187",
          "410,165 440,150 455,157 425,172",
        ],
        subPins: [
          { id: "p-202-1", code: "02-PRJ-02", name: "Smart TV และระบบสื่อการสอน", type: "av", x: 420, y: 165 },
          { id: "p-202-2", code: "02-AC-202", name: "เครื่องปรับอากาศห้อง 202", type: "ac", x: 360, y: 155 },
        ],
        equipmentList: ["Smart TV 75 นิ้ว", "ระบบเสียงสเตอริโอห้องเรียน", "กระดานไวท์บอร์ดกระจก"],
      },
      {
        id: "Office203",
        code: "02-OFF-FACULTY",
        name: "ห้องพักครูและสำนักงานแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
        shortName: "ห้องพักครู & สำนักงาน",
        floor: 2,
        type: "office",
        badge: "สำนักงาน",
        supervisor: "ดร.ธีรภัทร นรินทร์เดช",
        supervisorRole: "หัวหน้าแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
        supervisorPhone: "02-555-1200 (ต่อ 200)",
        description: "สำนักงานประสานงานหลักของแผนกวิชา ห้องทำงานคณาจารย์ 12 ท่าน และจุดติดต่อเอกสารนักศึกษา",
        capacity: "คณาจารย์ 12 ท่าน",
        primaryCategory: "AIR_CONDITIONING",
        centerPoint: { x: 640, y: 220 },
        floorPolygon: "510,140 760,265 650,320 400,195",
        walls: [
          {
            top: "510,120 760,245 764,247 514,122",
            front: "514,122 764,247 764,265 514,140",
          },
          {
            top: "760,245 650,300 650,304 760,249",
            front: "760,249 650,304 650,320 760,265",
          },
        ],
        desks: [
          "520,180 580,150 600,160 540,190",
          "570,205 630,175 650,185 590,215",
          "620,230 680,200 700,210 640,240",
        ],
        subPins: [
          { id: "p-203-1", code: "02-HEAD-01", name: "โต๊ะทำงานหัวหน้าแผนกวิชา", type: "desk", x: 570, y: 175 },
          { id: "p-203-2", code: "02-PRN-01", name: "เครื่องพิมพ์เครือข่าย Fuji Xerox", type: "hardware", x: 670, y: 225 },
        ],
        equipmentList: ["เครื่องมัลติฟังก์ชันเน็ตเวิร์ก", "ตู้เอกสารนิรภัย", "ชุดประชุมคณาจารย์"],
      },
      {
        id: "Restroom204",
        code: "02-WC-02",
        name: "ห้องน้ำรวม ชั้น 2",
        shortName: "ห้องน้ำ 2F",
        floor: 2,
        type: "facility",
        badge: "สุขภัณฑ์",
        supervisor: "งานอาคารสถานที่และสิ่งแวดล้อม",
        supervisorRole: "ผู้ดูแลสุขาภิบาล",
        description: "ห้องน้ำสำหรับคณาจารย์และนักศึกษาประจำชั้น 2",
        capacity: "6 ห้องสุขา",
        primaryCategory: "PLUMBING",
        centerPoint: { x: 340, y: 350 },
        floorPolygon: "240,320 400,240 470,275 310,355",
        walls: [],
        subPins: [
          { id: "p-204-1", code: "02-WC-M", name: "ห้องน้ำชาย ชั้น 2", type: "restroom", x: 310, y: 310 },
          { id: "p-204-2", code: "02-WC-F", name: "ห้องน้ำหญิง ชั้น 2", type: "restroom", x: 370, y: 285 },
        ],
        equipmentList: ["ระบบชำระล้างอัตโนมัติ", "เครื่องเป่ามือแห้งพลังลม"],
      },
    ],
  },

  // ==========================================
  // FLOOR 3: Software & Multimedia Labs
  // ==========================================
  {
    floor: 3,
    label: "ชั้น 3",
    shortLabel: "3F",
    nameTh: "ห้องปฏิบัติการซอฟต์แวร์ มัลติมีเดีย และพื้นที่อ่านหนังสือ",
    description: "ห้องปฏิบัติการพัฒนาซอฟต์แวร์ Lab 301, มัลติมีเดีย Lab 302 และ Co-Working Space นักศึกษา",
    accentColor: "#8b5cf6", // Purple
    slabPolygon: "120,290 530,90 890,270 480,480",
    slabFront: "480,480 890,270 890,290 480,500",
    slabSide: "120,290 480,480 480,500 120,310",
    corridorPolygon: "290,280 490,180 670,270 470,370",
    rooms: [
      {
        id: "Lab301",
        code: "03-LAB-301",
        name: "ห้องปฏิบัติการพัฒนาซอฟต์แวร์และแอปพลิเคชัน (Lab 301)",
        shortName: "Lab 301 พัฒนาซอฟต์แวร์",
        floor: 3,
        type: "lab",
        badge: "ห้องแล็บซอฟต์แวร์",
        supervisor: "อ.ปิยะ บุญเลิศ",
        supervisorRole: "ครูผู้ควบคุมแล็บซอฟต์แวร์",
        supervisorPhone: "081-555-4921 (ต่อ 301)",
        description: "คอมพิวเตอร์ Core i7 RAM 32GB พร้อมชุดเครื่องมือ Visual Studio Code, Docker, Android Studio",
        capacity: "40 เครื่องคอมพิวเตอร์",
        primaryCategory: "PC_HARDWARE",
        centerPoint: { x: 280, y: 215 },
        floorPolygon: "180,260 360,170 470,225 290,315",
        walls: [
          {
            top: "180,240 360,150 364,152 184,242",
            front: "184,242 364,152 364,170 184,260",
          },
        ],
        desks: [
          "230,245 280,220 310,235 260,260",
          "270,225 320,200 350,215 300,240",
          "310,205 360,180 390,195 340,220",
        ],
        subPins: [
          { id: "p-301-1", code: "03-PC-12", name: "เครื่องคอมพิวเตอร์หมายเลข 12 (Core i7)", type: "hardware", x: 310, y: 225 },
          { id: "p-301-2", code: "03-SW-01", name: "สวิตช์ฮับ Cisco 24-Port ประจำแล็บ 301", type: "network", x: 350, y: 200 },
          { id: "p-301-3", code: "03-AC-301", name: "แอร์ตั้งพื้น Carrier 40,000 BTU", type: "ac", x: 240, y: 230 },
        ],
        equipmentList: ["เวิร์กสเตชันพัฒนาโปรแกรม 40 เครื่อง", "Cisco Catalyst Switch", "UPS สำรองไฟประจำโต๊ะอาจารย์"],
      },
      {
        id: "Lab302",
        code: "03-LAB-302",
        name: "ห้องปฏิบัติการคอมพิวเตอร์กราฟิกและมัลติมีเดีย (Lab 302)",
        shortName: "Lab 302 กราฟิก & 3D",
        floor: 3,
        type: "lab",
        badge: "ห้องแล็บกราฟิก",
        supervisor: "อ.กมลวรรณ สุขเกษม",
        supervisorRole: "ครูผู้ควบคุมแล็บมัลติมีเดีย",
        supervisorPhone: "081-555-4921 (ต่อ 302)",
        description: "เวิร์กสเตชันการ์ดจอ RTX 4070 หน้าจอแสดงผลขอบเขตสี sRGB 99% สำหรับงานกราฟิก 3D แอนิเมชัน และตัดต่อวิดีโอ",
        capacity: "35 เครื่องคอมพิวเตอร์",
        primaryCategory: "PC_HARDWARE",
        centerPoint: { x: 570, y: 175 },
        floorPolygon: "490,110 690,210 590,260 390,160",
        walls: [
          {
            top: "490,90 690,190 694,192 494,92",
            front: "494,92 694,192 694,210 494,110",
          },
        ],
        desks: [
          "480,145 540,115 570,130 510,160",
          "530,170 590,140 620,155 560,185",
        ],
        subPins: [
          { id: "p-302-1", code: "03-GPU-01", name: "Render Workstation GPU RTX 4070", type: "hardware", x: 535, y: 145 },
          { id: "p-302-2", code: "03-AV-302", name: "ระบบสตรีมมิ่งและชุดจัดแสงถ่ายทำ", type: "av", x: 605, y: 180 },
        ],
        equipmentList: ["จอภาพ Dell UltraSharp Color Accurate", "เมาส์ปากกา Wacom Intuos Pro", "ชุดกรีนสกรีนสตูดิโอ"],
      },
      {
        id: "Restroom303",
        code: "03-WC-03",
        name: "ห้องน้ำรวม ชั้น 3",
        shortName: "ห้องน้ำ 3F",
        floor: 3,
        type: "facility",
        badge: "สุขภัณฑ์",
        supervisor: "งานอาคารสถานที่และสิ่งแวดล้อม",
        supervisorRole: "ผู้ดูแลสุขาภิบาล",
        description: "ห้องสุขาชายและหญิงประจำชั้น 3",
        capacity: "6 ห้องสุขา",
        primaryCategory: "PLUMBING",
        centerPoint: { x: 670, y: 290 },
        floorPolygon: "580,245 740,325 670,360 510,280",
        walls: [],
        subPins: [
          { id: "p-303-1", code: "03-WC-M", name: "ห้องสุขาชาย ชั้น 3", type: "restroom", x: 620, y: 285 },
          { id: "p-303-2", code: "03-WC-F", name: "ห้องสุขาหญิง ชั้น 3", type: "restroom", x: 680, y: 315 },
        ],
        equipmentList: ["ระบบบำบัดน้ำเสีย", "ก๊อกน้ำประหยัดน้ำ"],
      },
      {
        id: "ReadingArea304",
        code: "03-CO-WORK",
        name: "ทางเดินและพื้นที่นั่งอ่านหนังสือ ชั้น 3",
        shortName: "Co-Working Space 3F",
        floor: 3,
        type: "common",
        badge: "พื้นที่พักผ่อน",
        supervisor: "งานบริหารอาคารสถานที่",
        supervisorRole: "ผู้ดูแลพื้นที่ส่วนกลาง",
        description: "พื้นที่อ่านหนังสือริมระเบียง บรรยากาศปลอดโปร่ง พร้อมรางปลั๊กไฟชาร์จโน้ตบุ๊กและ Wi-Fi 6 ความเร็วสูง",
        capacity: "30 ที่นั่ง",
        primaryCategory: "FURNITURE",
        centerPoint: { x: 380, y: 380 },
        floorPolygon: "260,330 450,235 560,290 370,385",
        walls: [],
        desks: [
          "340,320 380,300 400,310 360,330",
          "410,285 450,265 470,275 430,295",
        ],
        subPins: [
          { id: "p-304-1", code: "03-PWR-TABLE", name: "รางปลั๊กไฟตั้งโต๊ะ Co-Working", type: "power", x: 370, y: 330 },
          { id: "p-304-2", code: "03-AP-WIFI", name: "Aruba Wi-Fi 6 Access Point", type: "network", x: 440, y: 280 },
        ],
        equipmentList: ["โต๊ะไม้ยาวพร้อมปลั๊ก USB-C PD", "เก้าอี้ Ergonomic เบาะผ้า", "ชุดไฟส่องสว่าง LED Warm White"],
      },
    ],
  },

  // ==========================================
  // FLOOR 4: Network Lab & Data Center Hub
  // ==========================================
  {
    floor: 4,
    label: "ชั้น 4",
    shortLabel: "4F",
    nameTh: "ศูนย์ควบคุมเซิร์ฟเวอร์ และห้องปฏิบัติการระบบเครือข่าย",
    description: "ห้องศูนย์ควบคุมดาต้าเซ็นเตอร์ Server Room, Network Lab 401 และระเบียงติดตั้งคอมเพรสเซอร์แอร์",
    accentColor: "#ef4444", // Red/Rose (High Security Zone)
    slabPolygon: "120,290 530,90 890,270 480,480",
    slabFront: "480,480 890,270 890,290 480,500",
    slabSide: "120,290 480,480 480,500 120,310",
    corridorPolygon: "290,280 490,180 670,270 470,370",
    rooms: [
      {
        id: "Lab401",
        code: "04-LAB-401",
        name: "ห้องปฏิบัติการระบบเครือข่ายและความปลอดภัย (Lab 401)",
        shortName: "Lab 401 Network & Cyber",
        floor: 4,
        type: "lab",
        badge: "Network Lab",
        supervisor: "ดร.ธีรภัทร นรินทร์เดช",
        supervisorRole: "หัวหน้าผู้รับผิดชอบเครือข่าย",
        supervisorPhone: "081-555-4921 (ต่อ 401)",
        description: "ห้องปฏิบัติการทดสอบระบบเครือข่ายและไซเบอร์ซีเคียวริตี้ พร้อมตู้แร็ค Cisco 2960, 3850 และไฟร์วอลล์จำลอง",
        capacity: "30 ที่นั่งปฏิบัติการ",
        primaryCategory: "NETWORK",
        centerPoint: { x: 280, y: 220 },
        floorPolygon: "180,260 360,170 470,225 290,315",
        walls: [
          {
            top: "180,240 360,150 364,152 184,242",
            front: "184,242 364,152 364,170 184,260",
          },
        ],
        desks: [
          "230,245 280,220 310,235 260,260",
          "270,225 320,200 350,215 300,240",
          "310,205 360,180 390,195 340,220",
        ],
        subPins: [
          { id: "p-401-1", code: "04-RACK-01", name: "ตู้แร็ค Cisco Routers/Switches 42U", type: "network", x: 310, y: 225 },
          { id: "p-401-2", code: "04-FW-01", name: "FortiGate Firewall Appliance", type: "network", x: 350, y: 200 },
          { id: "p-401-3", code: "04-AC-401", name: "แอร์ Daikin Inverter 38,000 BTU", type: "ac", x: 240, y: 230 },
        ],
        equipmentList: ["ตู้แร็คขนาด 42U 6 ตู้", "Cisco Router 2900 Series", "Managed Switch PoE+", "เครื่องมือเข้าหัว Patch Cord & Fluke Cable Tester"],
      },
      {
        id: "ServerRoom",
        code: "04-SRV-ROOM",
        name: "ห้องศูนย์ควบคุมเซิร์ฟเวอร์ประจำแผนก (Server Room)",
        shortName: "ศูนย์เซิร์ฟเวอร์ (Server Room)",
        floor: 4,
        type: "server",
        badge: "ห้องเซิร์ฟเวอร์",
        supervisor: "ดร.ธีรภัทร นรินทร์เดช",
        supervisorRole: "ผู้ดูแลระบบดาต้าเซ็นเตอร์",
        supervisorPhone: "081-555-4921 (ต่อ 400)",
        description: "ศูนย์ดาต้าเซ็นเตอร์หลัก พื้นที่ควบคุมความปลอดภัยระดับสูงสุด (Biometric Access) ควบคุมอุณหภูมิ 20-22°C ตลอด 24 ชม.",
        capacity: "ตู้เซิร์ฟเวอร์ 8 Racks",
        primaryCategory: "AIR_CONDITIONING",
        centerPoint: { x: 580, y: 175 },
        floorPolygon: "490,110 690,210 590,260 390,160",
        walls: [
          {
            top: "490,85 690,185 694,187 494,87",
            front: "494,87 694,187 694,210 494,110",
            side: "490,85 494,87 494,110 490,108",
          },
          {
            top: "690,185 590,235 590,239 690,189",
            front: "690,189 590,239 590,260 690,210",
          },
        ],
        desks: [
          "480,145 540,115 570,130 510,160",
          "530,170 590,140 620,155 560,185",
        ],
        subPins: [
          { id: "p-srv-1", code: "04-RACK-MAIN", name: "ตู้เซิร์ฟเวอร์ Dell PowerEdge Blade", type: "hardware", x: 530, y: 145 },
          { id: "p-srv-2", code: "04-UPS-20K", name: "ระบบไฟสำรองฉุกเฉิน UPS 20kVA", type: "power", x: 600, y: 165 },
          { id: "p-srv-3", code: "04-PAC-01", name: "แอร์ควบคุมความเย็นแม่นยำ Precision AC", type: "ac", x: 560, y: 190 },
        ],
        equipmentList: ["Dell PowerEdge R750 Servers", "SAN Storage Synology Rackmount", "Schneider Electric 20kVA UPS", "ระบบดับเพลิงอัตโนมัติ FM-200"],
      },
      {
        id: "Restroom403",
        code: "04-WC-04",
        name: "ห้องน้ำรวม ชั้น 4",
        shortName: "ห้องน้ำ 4F",
        floor: 4,
        type: "facility",
        badge: "สุขภัณฑ์",
        supervisor: "งานอาคารสถานที่และสิ่งแวดล้อม",
        supervisorRole: "ผู้ดูแลสุขาภิบาล",
        description: "ห้องสุขาชาย-หญิง ประจำชั้น 4",
        capacity: "4 ห้องสุขา",
        primaryCategory: "PLUMBING",
        centerPoint: { x: 670, y: 290 },
        floorPolygon: "580,245 740,325 670,360 510,280",
        walls: [],
        subPins: [
          { id: "p-403-1", code: "04-WC-M", name: "ห้องน้ำชาย ชั้น 4", type: "restroom", x: 620, y: 285 },
          { id: "p-403-2", code: "04-WC-F", name: "ห้องน้ำหญิง ชั้น 4", type: "restroom", x: 680, y: 315 },
        ],
        equipmentList: ["ระบบตรวจจับน้ำรั่วซึม", "พัดลมดูดอากาศเพดาน"],
      },
      {
        id: "Terrace404",
        code: "04-TECH-TERRACE",
        name: "ระเบียงเทคนิคและพื้นที่ติดตั้งคอมเพรสเซอร์แอร์",
        shortName: "ระเบียงแอร์คอมเพรสเซอร์ 4F",
        floor: 4,
        type: "common",
        badge: "พื้นที่ช่าง",
        supervisor: "ทีมงานช่างกายภาพอาคาร",
        supervisorRole: "ผู้ดูแลระบบปรับอากาศอาคาร",
        description: "พื้นที่กลางแจ้งระบายอากาศ ติดตั้งชุดคอนเดนซิ่งยูนิต (CDU) และบันไดหนีไฟด้านหลังอาคาร",
        capacity: "พื้นที่ปฏิบัติงานช่าง",
        primaryCategory: "AIR_CONDITIONING",
        centerPoint: { x: 380, y: 380 },
        floorPolygon: "260,330 450,235 560,290 370,385",
        walls: [],
        subPins: [
          { id: "p-404-1", code: "04-CDU-01", name: "ชุดคอมเพรสเซอร์แอร์ห้องเซิร์ฟเวอร์", type: "ac", x: 370, y: 330 },
          { id: "p-404-2", code: "04-FIRE-STAIRS", name: "ทางหนีไฟและบันไดฉุกเฉิน", type: "restroom", x: 440, y: 280 },
        ],
        equipmentList: ["Condensing Units 12 ชุด", "ถังดับเพลิง CO2 ชนิดเคมี", "ไฟฉุกเฉิน Emergency Light"],
      },
    ],
  },
];
