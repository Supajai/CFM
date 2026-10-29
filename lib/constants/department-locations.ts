// lib/constants/department-locations.ts
// Master Data: ข้อมูลสถานที่ ชั้น และห้อง/พื้นที่ ประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (Single Department Scope)

export const DEPARTMENT_NAME = "แผนกวิชาช่างเทคนิคคอมพิวเตอร์";
export const DEPARTMENT_BUILDING_NAME = "อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์";
export const DEPARTMENT_BUILDING_CODE = "BLD-COMPTECH";
export const TOTAL_FLOORS = 4;

export interface DepartmentRoom {
  id: string; // รหัสห้อง/คีย์สำหรับ URL Param เช่น "Lab101", "Lab301", "ServerRoom"
  name: string; // ชื่อห้องแสดงผล
  floor: number; // ชั้น 1-4
  type: "lab" | "office" | "classroom" | "facility" | "common";
  badge?: string;
  description?: string;
}

export interface FloorInfo {
  floor: number;
  label: string;
  description: string;
  rooms: DepartmentRoom[];
}

export const DEPARTMENT_FLOORS_DATA: FloorInfo[] = [
  {
    floor: 1,
    label: "ชั้น 1",
    description: "ปฏิบัติการฮาร์ดแวร์ ซ่อมบำรุง และโถงกิจกรรม",
    rooms: [
      {
        id: "Lab101",
        name: "ห้องปฏิบัติการฮาร์ดแวร์และซ่อมบำรุงคอมพิวเตอร์ (Lab 101)",
        floor: 1,
        type: "lab",
        badge: "ห้องแล็บฮาร์ดแวร์",
        description: "ปฏิบัติการประกอบ ซ่อมแซม ติดตั้ง และทดสอบอุปกรณ์คอมพิวเตอร์",
      },
      {
        id: "StaffRoom102",
        name: "ห้องพักเจ้าหน้าที่และศูนย์ซ่อมบำรุงเครื่องมือช่าง",
        floor: 1,
        type: "office",
        badge: "ศูนย์ช่างเทคนิค",
        description: "จุดประจำการช่างเทคนิคและคลังเก็บอะไหล่ประจำแผนก",
      },
      {
        id: "Restroom103",
        name: "ห้องน้ำรวม ชั้น 1",
        floor: 1,
        type: "facility",
        badge: "สุขภัณฑ์",
        description: "ห้องสุขาชาย-หญิง ประจำชั้น 1",
      },
      {
        id: "Hall104",
        name: "ลานกิจกรรมและโถงอเนกประสงค์ชั้นล่าง",
        floor: 1,
        type: "common",
        badge: "พื้นที่ส่วนกลาง",
        description: "โถงกิจกรรมกลาง ประชาสัมพันธ์ และพื้นที่กิจกรรมนักศึกษา",
      },
    ],
  },
  {
    floor: 2,
    label: "ชั้น 2",
    description: "ห้องเรียนบรรยายทฤษฎี และสำนักงานแผนกวิชา",
    rooms: [
      {
        id: "Room201",
        name: "ห้อง 201 ห้องเรียนบรรยายทฤษฎี",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี",
        description: "ห้องเรียนบรรยายทั่วไป พร้อมโปรเจกเตอร์และเครื่องเสียง",
      },
      {
        id: "Room202",
        name: "ห้อง 202 ห้องเรียนบรรยายทฤษฎี",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี",
        description: "ห้องเรียนบรรยายทั่วไป รองรับ 40 ที่นั่ง",
      },
      {
        id: "Office203",
        name: "ห้องพักครูและสำนักงานแผนกวิชา",
        floor: 2,
        type: "office",
        badge: "สำนักงาน",
        description: "ห้องพักคณาจารย์และธุรการประจำแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
      },
      {
        id: "Restroom204",
        name: "ห้องน้ำรวม ชั้น 2",
        floor: 2,
        type: "facility",
        badge: "สุขภัณฑ์",
        description: "ห้องสุขาชาย-หญิง ประจำชั้น 2",
      },
    ],
  },
  {
    floor: 3,
    label: "ชั้น 3",
    description: "ห้องปฏิบัติการซอฟต์แวร์ มัลติมีเดีย และพื้นที่อ่านหนังสือ",
    rooms: [
      {
        id: "Lab301",
        name: "ห้องปฏิบัติการพัฒนาซอฟต์แวร์และแอปพลิเคชัน (Lab 301)",
        floor: 3,
        type: "lab",
        badge: "ห้องแล็บซอฟต์แวร์",
        description: "เวิร์กสเตชันพัฒนาซอฟต์แวร์ เว็บ และ Mobile Application",
      },
      {
        id: "Lab302",
        name: "ห้องปฏิบัติการคอมพิวเตอร์กราฟิกและมัลติมีเดีย (Lab 302)",
        floor: 3,
        type: "lab",
        badge: "ห้องแล็บกราฟิก",
        description: "คอมพิวเตอร์ประมวลผลสูง สำหรับงานออกแบบ 3D และสื่อมัลติมีเดีย",
      },
      {
        id: "Restroom303",
        name: "ห้องน้ำรวม ชั้น 3",
        floor: 3,
        type: "facility",
        badge: "สุขภัณฑ์",
        description: "ห้องสุขาชาย-หญิง ประจำชั้น 3",
      },
      {
        id: "ReadingArea304",
        name: "ทางเดินและพื้นที่นั่งอ่านหนังสือ ชั้น 3",
        floor: 3,
        type: "common",
        badge: "พื้นที่พักผ่อน",
        description: "โต๊ะอ่านหนังสือ พื้นที่ Co-Working Space นักศึกษา",
      },
    ],
  },
  {
    floor: 4,
    label: "ชั้น 4",
    description: "ศูนย์ควบคุมเซิร์ฟเวอร์ และห้องปฏิบัติการระบบเครือข่าย",
    rooms: [
      {
        id: "Lab401",
        name: "ห้องปฏิบัติการระบบเครือข่ายและความปลอดภัย Network Lab (Lab 401)",
        floor: 4,
        type: "lab",
        badge: "Network Lab",
        description: "อุปกรณ์ Cisco Routers, Managed Switches, Firewall Rack",
      },
      {
        id: "ServerRoom",
        name: "ห้องศูนย์ควบคุมเซิร์ฟเวอร์ประจำแผนก (Server Room)",
        floor: 4,
        type: "facility",
        badge: "Data Center",
        description: "เซิร์ฟเวอร์หลักของแผนก ระบบแอร์ควบคุมความเย็น 24 ชม. และ UPS",
      },
      {
        id: "Restroom403",
        name: "ห้องน้ำรวม ชั้น 4",
        floor: 4,
        type: "facility",
        badge: "สุขภัณฑ์",
        description: "ห้องสุขาชาย-หญิง ประจำชั้น 4",
      },
    ],
  },
];

/**
 * ดึงรายการห้องทั้งหมดในอาคาร
 */
export function getAllDepartmentRooms(): DepartmentRoom[] {
  return DEPARTMENT_FLOORS_DATA.flatMap((f) => f.rooms);
}

/**
 * ดึงรายการห้องตามชั้น (Floor: 1 - 4)
 */
export function getRoomsByFloor(floor: number): DepartmentRoom[] {
  const floorData = DEPARTMENT_FLOORS_DATA.find((f) => f.floor === floor);
  return floorData ? floorData.rooms : [];
}

/**
 * ค้นหาห้องจาก ID, Code หรือชื่อห้อง (รองรับทั้ง /report?room=Lab301 หรือ /report?room=Lab 301)
 */
export function findDepartmentRoom(query?: string | null): DepartmentRoom | undefined {
  if (!query) return undefined;
  const cleanQ = query.trim().toLowerCase().replace(/[\s\-_]/g, "");

  const allRooms = getAllDepartmentRooms();
  return allRooms.find((r) => {
    const cleanId = r.id.toLowerCase().replace(/[\s\-_]/g, "");
    const cleanName = r.name.toLowerCase().replace(/[\s\-_]/g, "");
    return cleanId === cleanQ || cleanName.includes(cleanQ) || cleanQ.includes(cleanId);
  });
}
