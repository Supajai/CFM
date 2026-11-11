// lib/constants/department-locations.ts
// Master Data: ข้อมูลสถานที่ ชั้น และห้อง/พื้นที่ ประจำอาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (Single Department Scope)
// Single Source of Truth ที่ซิงก์ตรงกับผังอาคาร 2.5D (BuildingFloorMap)

export const DEPARTMENT_NAME = "แผนกวิชาช่างเทคนิคคอมพิวเตอร์";
export const DEPARTMENT_BUILDING_NAME = "อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์";
export const DEPARTMENT_BUILDING_CODE = "BLD-COMPTECH";
export const TOTAL_FLOORS = 4;

export interface DepartmentRoom {
  id: string; // รหัสห้อง/คีย์สำหรับ URL Param เช่น "311", "312", "322"
  code: string; // รหัสห้อง เช่น "311", "312", "02-WC-F" (ใช้จับคู่กับผัง 2.5D แบบ 100% Exact Match)
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
    description: "ปฏิบัติการฮาร์ดแวร์ ซ่อมบำรุง ห้องพักครู และห้องเรียน",
    rooms: [
      {
        id: "311",
        code: "311",
        name: "ห้องพักครู 311",
        floor: 1,
        type: "office",
        badge: "ห้องพักครู",
        description: "ห้องพักครูและอาจารย์ประจำแผนก ปีกซ้าย อาคาร 3",
      },
      {
        id: "312",
        code: "312",
        name: "ห้องปฏิบัติการฮาร์ดแวร์และซ่อมบำรุงคอมพิวเตอร์ 312",
        floor: 1,
        type: "lab",
        badge: "ห้องแล็บฮาร์ดแวร์",
        description: "ปฏิบัติการประกอบ ซ่อมแซม ติดตั้ง และทดสอบอุปกรณ์คอมพิวเตอร์",
      },
      {
        id: "313",
        code: "313",
        name: "ห้องเรียน 313",
        floor: 1,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 313 โถงกลาง อาคาร 3",
      },
      {
        id: "314",
        code: "314",
        name: "ห้องเรียน 314",
        floor: 1,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 314 อาคาร 3",
      },
      {
        id: "315",
        code: "315",
        name: "ห้องพักครู 315",
        floor: 1,
        type: "office",
        badge: "ห้องพักครู",
        description: "ห้องพักครูและอาจารย์ประจำแผนก ปีกขวา อาคาร 3",
      },
    ],
  },
  {
    floor: 2,
    label: "ชั้น 2",
    description: "ห้องปฏิบัติการคอมพิวเตอร์ ห้องเรียนทฤษฎี และสุขภัณฑ์",
    rooms: [
      {
        id: "321",
        code: "321",
        name: "ห้องเรียน 321",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 321 ปีกซ้าย อาคาร 3",
      },
      {
        id: "322",
        code: "322",
        name: "ห้องปฏิบัติการคอมพิวเตอร์ 322",
        floor: 2,
        type: "lab",
        badge: "ห้องแล็บคอมพิวเตอร์",
        description: "ห้องปฏิบัติการคอมพิวเตอร์ 40 ที่นั่ง พร้อมจออัจฉริยะและโปรเจกเตอร์",
      },
      {
        id: "323",
        code: "323",
        name: "ห้องเรียน 323",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 323 อาคาร 3",
      },
      {
        id: "324",
        code: "324",
        name: "ห้องเรียน 324",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 324 อาคาร 3",
      },
      {
        id: "325",
        code: "325",
        name: "ห้องเรียน 325",
        floor: 2,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 325 ปีกขวา อาคาร 3",
      },
      {
        id: "02-toilet-female",
        code: "02-toilet-female",
        name: "ห้องน้ำหญิง (ชั้น 2)",
        floor: 2,
        type: "facility",
        badge: "ห้องสุขาหญิง",
        description: "ห้องน้ำหญิงและอ่างล้างมือ ประจำชั้น 2",
      },
      {
        id: "02-toilet-teacher",
        code: "02-toilet-teacher",
        name: "ห้องน้ำอาจารย์ (ชั้น 2)",
        floor: 2,
        type: "facility",
        badge: "ห้องสุขาอาจารย์",
        description: "ห้องสุขาคณาจารย์และเจ้าหน้าที่ ประจำชั้น 2",
      },
    ],
  },
  {
    floor: 3,
    label: "ชั้น 3",
    description: "ห้องปฏิบัติการพัฒนาซอฟต์แวร์ ห้องเรียน และสุขภัณฑ์",
    rooms: [
      {
        id: "331",
        code: "331",
        name: "ห้องเรียน 331",
        floor: 3,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 331 ปีกซ้าย อาคาร 3",
      },
      {
        id: "332",
        code: "332",
        name: "ห้องปฏิบัติการพัฒนาซอฟต์แวร์ 332",
        floor: 3,
        type: "lab",
        badge: "ห้องแล็บซอฟต์แวร์",
        description: "ปฏิบัติการพัฒนาซอฟต์แวร์ เว็บไซต์ และโมบายแอปพลิเคชัน",
      },
      {
        id: "333",
        code: "333",
        name: "ห้องเรียน 333",
        floor: 3,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 333 อาคาร 3",
      },
      {
        id: "334",
        code: "334",
        name: "ห้องเรียน 334",
        floor: 3,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 334 อาคาร 3",
      },
      {
        id: "335",
        code: "335",
        name: "ห้องเรียน 335",
        floor: 3,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 335 ปีกขวา อาคาร 3",
      },
      {
        id: "03-WC-M1",
        code: "03-WC-M1",
        name: "ห้องน้ำชาย 1 (ปีกซ้าย ชั้น 3)",
        floor: 3,
        type: "facility",
        badge: "ห้องสุขาชาย 1",
        description: "ห้องสุขาชาย ประจำชั้น 3 ปีกซ้าย",
      },
      {
        id: "03-WC-M2",
        code: "03-WC-M2",
        name: "ห้องน้ำชาย 2 (ปีกขวา ชั้น 3)",
        floor: 3,
        type: "facility",
        badge: "ห้องสุขาชาย 2",
        description: "ห้องสุขาชาย ประจำชั้น 3 ปีกขวา",
      },
    ],
  },
  {
    floor: 4,
    label: "ชั้น 4",
    description: "ศูนย์ควบคุมเซิร์ฟเวอร์ ห้องปฏิบัติการเครือข่าย และห้องพักครู",
    rooms: [
      {
        id: "341",
        code: "341",
        name: "ห้องเรียน 341",
        floor: 4,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 341 ปีกซ้าย อาคาร 3",
      },
      {
        id: "342",
        code: "342",
        name: "ห้องปฏิบัติการระบบเครือข่าย 342",
        floor: 4,
        type: "lab",
        badge: "Network Lab",
        description: "ห้องปฏิบัติการระบบเครือข่ายและความปลอดภัย Network Lab 342",
      },
      {
        id: "343",
        code: "343",
        name: "ห้องศูนย์ควบคุมเซิร์ฟเวอร์และแล็บรวม 343",
        floor: 4,
        type: "lab",
        badge: "Data Center & Lab",
        description: "ศูนย์ควบคุมเซิร์ฟเวอร์กลาง และแล็บรวมขนาดใหญ่ 2 ช่วงเสา",
      },
      {
        id: "344",
        code: "344",
        name: "ห้องเรียน 344",
        floor: 4,
        type: "classroom",
        badge: "ห้องเรียนทฤษฎี/ปฏิบัติ",
        description: "ห้องเรียนทฤษฎีและปฏิบัติการ 344 อาคาร 3",
      },
      {
        id: "345",
        code: "345",
        name: "ห้องพักครู 345",
        floor: 4,
        type: "office",
        badge: "ห้องพักครู",
        description: "ห้องพักอาจารย์และศูนย์วิจัยโครงงาน ปีกขวา อาคาร 3",
      },
      {
        id: "04-WC-GEN",
        code: "04-WC-GEN",
        name: "ห้องน้ำทั่วไป (ชั้น 4)",
        floor: 4,
        type: "facility",
        badge: "ห้องสุขาทั่วไป",
        description: "ห้องสุขาทั่วไป ประจำชั้น 4",
      },
      {
        id: "04-WC-TCH",
        code: "04-WC-TCH",
        name: "ห้องน้ำอาจารย์ (ชั้น 4)",
        floor: 4,
        type: "facility",
        badge: "ห้องสุขาอาจารย์",
        description: "ห้องสุขาคณาจารย์และเจ้าหน้าที่ ประจำชั้น 4",
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
 * ค้นหาห้องจาก ID, Code หรือชื่อห้อง (รองรับทั้ง /report?room=312, /report?room=01-312, หรือ Legacy Query)
 */
export function findDepartmentRoom(query?: string | null): DepartmentRoom | undefined {
  if (!query) return undefined;
  const rawQ = query.trim();
  // Strip floor prefix (e.g. "03-335" -> "335", "01-311" -> "311")
  const strippedQ = rawQ.replace(/^0[1-4]-?/, "");
  const cleanQ = strippedQ.toLowerCase().replace(/[\s\-_]/g, "");
  const originalCleanQ = rawQ.toLowerCase().replace(/[\s\-_]/g, "");

  // Legacy mappings for backwards compatibility with old links/QR codes
  const legacyAliases: Record<string, string> = {
    lab101: "312",
    staffroom102: "311",
    restroom103: "315",
    hall104: "313",
    room201: "321",
    room202: "322",
    office203: "321",
    restroom204: "02-toilet-female",
    "02-wc-f": "02-toilet-female",
    "02-wc-tch": "02-toilet-teacher",
    wcf: "02-toilet-female",
    wctch: "02-toilet-teacher",
    lab301: "332",
    lab302: "333",
    restroom303: "03-WC-M1",
    readingarea304: "331",
    lab401: "342",
    serverroom: "343",
    restroom403: "04-WC-GEN",
  };

  const targetCode = legacyAliases[cleanQ] || legacyAliases[originalCleanQ] || cleanQ;
  const targetOriginal = legacyAliases[originalCleanQ] || originalCleanQ;

  const allRooms = getAllDepartmentRooms();

  // 1. Exact match by normalized code or id (without floor prefix)
  const exactMatch = allRooms.find((r) => {
    const cleanId = r.id.toLowerCase().replace(/[\s\-_]/g, "");
    const cleanIdStripped = cleanId.replace(/^0[1-4]-?/, "");
    const cleanCode = (r.code || "").toLowerCase().replace(/[\s\-_]/g, "");
    const cleanCodeStripped = cleanCode.replace(/^0[1-4]-?/, "");

    return (
      cleanCode === targetCode ||
      cleanId === targetCode ||
      cleanCodeStripped === targetCode ||
      cleanIdStripped === targetCode ||
      cleanCode === targetOriginal ||
      cleanId === targetOriginal ||
      cleanCode === cleanQ ||
      cleanId === cleanQ
    );
  });
  if (exactMatch) return exactMatch;

  // 2. Exact match by name
  const nameMatch = allRooms.find((r) => {
    const cleanName = r.name.toLowerCase().replace(/[\s\-_]/g, "");
    return cleanName === cleanQ || cleanName === originalCleanQ;
  });
  if (nameMatch) return nameMatch;

  // 3. Fallback: Name includes query (only if cleanQ has meaningful length >= 3)
  if (cleanQ.length >= 3) {
    const partialNameMatch = allRooms.find((r) => {
      const cleanName = r.name.toLowerCase().replace(/[\s\-_]/g, "");
      return cleanName.includes(cleanQ);
    });
    if (partialNameMatch) return partialNameMatch;
  }

  return undefined;
}
