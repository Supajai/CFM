// prisma/seed.ts - Database Seeder for Single Department Scope
import { PrismaClient, Role, Category, Priority, TicketStatus, AttachmentType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { DEPARTMENT_BUILDING_NAME, DEPARTMENT_FLOORS_DATA, getAllDepartmentRooms } from '../lib/constants/department-locations'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed for อาคารแผนกวิชาช่างเทคนิคคอมพิวเตอร์ (Single Department Scope)...')

  // ล้างข้อมูลเก่า
  await prisma.attachment.deleteMany()
  await prisma.ticketHistory.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.departmentRoom.deleteMany()
  await prisma.building.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing records.')

  // แฮชรหัสผ่านมาตรฐาน "123456" สำหรับบัญชีทดสอบทุกคน
  const defaultPasswordHash = await bcrypt.hash('123456', 10)

  // 1. สร้างบัญชีผู้ใช้ RBAC 4 บทบาท
  
  // 1.1 SUPER_ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      name: 'ดร. ธีรภัทร นรินทร์เดช (Super Admin)',
      email: 'superadmin@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
      phone: '02-555-1001',
      position: 'หัวหน้างานบริหารเทคโนโลยีสารสนเทศและอาคาร',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
    },
  })

  // 1.2 ADMIN (หัวหน้างานอาคารสถานที่และห้องแล็บประจำแผนก)
  const departmentAdmin = await prisma.user.create({
    data: {
      name: 'สมศักดิ์ บริหารทรัพย์ (Admin ประจำแผนก)',
      email: 'admin@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.ADMIN,
      phone: '02-555-1044',
      position: 'หัวหน้างานอาคารสถานที่และห้องปฏิบัติการประจำแผนก',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
    },
  })

  // 1.3 TECHNICIANS ประจำแผนก (แบ่งตามสายงานความเชี่ยวชาญ)
  const techAlex = await prisma.user.create({
    data: {
      name: 'Alex Morgan (อเล็กซ์ มอร์แกน)',
      email: 'tech.alex@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.TECHNICIAN,
      phone: '081-555-4921 (ต่อ 101)',
      technicianCode: 'TECH-01',
      position: 'ช่างเทคนิคประจำห้องปฏิบัติการคอมพิวเตอร์และฮาร์ดแวร์',
      specialty: 'ระบบคอมพิวเตอร์ ฮาร์ดแวร์ และห้องปฏิบัติการ',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
    },
  })

  const techPrasert = await prisma.user.create({
    data: {
      name: 'ก. ประเสริฐ (ช่างเน็ตเวิร์ก)',
      email: 'tech.prasert@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.TECHNICIAN,
      phone: '082-333-7890 (ต่อ 401)',
      technicianCode: 'TECH-02',
      position: 'ช่างเทคนิคระบบเครือข่ายและศูนย์ข้อมูลเซิร์ฟเวอร์',
      specialty: 'ระบบเครือข่าย อินเทอร์เน็ต และเซิร์ฟเวอร์',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
    },
  })

  const techWichai = await prisma.user.create({
    data: {
      name: 'วิชัย ช่างไฟและแอร์',
      email: 'tech.wichai@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.TECHNICIAN,
      phone: '083-777-1234 (ต่อ 102)',
      technicianCode: 'TECH-03',
      position: 'นายช่างเทคนิคระบบไฟฟ้าและปรับอากาศประจำอาคาร',
      specialty: 'ระบบเครื่องปรับอากาศและการทำความเย็น',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
    },
  })

  // 1.4 USER (นักศึกษา และ คณาจารย์ ประจำแผนก)
  const studentSupawit = await prisma.user.create({
    data: {
      name: 'ศุภวิชญ์ ไตรภาคี (นักศึกษา)',
      email: 'student.supawit@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '081-987-4921',
      studentId: '65-0482',
      classLevel: 'ปวส. 2',
      major: 'สาขาวิชาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  })

  const profSomchai = await prisma.user.create({
    data: {
      name: 'อ.สมชาย วงศ์วิชา (อาจารย์ประจำแผนก)',
      email: 'somchai.t@faculty.campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '089-112-2334',
      position: 'อาจารย์ผู้ดูแลห้องปฏิบัติการคอมพิวเตอร์กราฟิก',
      department: 'แผนกวิชาช่างเทคนิคคอมพิวเตอร์',
    },
  })

  console.log('✅ Created RBAC Users for single department scope.')

  // 2. สร้าง Master Data ห้องและพื้นที่ 4 ชั้น ในฐานข้อมูล DepartmentRoom ตามแปลนจริงอาคาร 3 แผนกคอมพิวเตอร์
  const departmentRoomsSeedData = [
    // ชั้น 1
    { code: "01-311", name: "ห้องพักครู 311", floor: 1, type: "TEACHER_ROOM", description: "ห้องพักครูและอาจารย์ประจำแผนก ปีกซ้าย" },
    { code: "01-312", name: "ห้องเรียน 312", floor: 1, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 312" },
    { code: "01-313", name: "ห้องเรียน 313", floor: 1, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 313" },
    { code: "01-314", name: "ห้องเรียน 314", floor: 1, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 314" },
    { code: "01-315", name: "ห้องพักครู 315", floor: 1, type: "TEACHER_ROOM", description: "ห้องพักครูและอาจารย์ประจำแผนก ปีกขวา" },
    { code: "01-STAIR-L", name: "โถงบันได 1 (ปีกซ้าย ชั้น 1)", floor: 1, type: "STAIR", description: "โถงบันไดหลักปีกซ้าย อาคาร 3" },
    { code: "01-STAIR-R", name: "โถงบันได 2 (ปีกขวา ชั้น 1)", floor: 1, type: "STAIR", description: "โถงบันไดหลักปีกขวา อาคาร 3" },

    // ชั้น 2
    { code: "02-321", name: "ห้องเรียน 321", floor: 2, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 321 ปีกซ้าย" },
    { code: "02-WC-F", name: "ห้องน้ำหญิง (ชั้น 2)", floor: 2, type: "RESTROOM", description: "ห้องสุขาหญิงประจำชั้น 2 ปีกซ้าย" },
    { code: "02-STAIR-L", name: "โถงบันได 1 (ปีกซ้าย ชั้น 2)", floor: 2, type: "STAIR", description: "โถงบันไดเชื่อมชั้น 1-3 ปีกซ้าย" },
    { code: "02-322", name: "ห้องเรียน 322", floor: 2, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 322" },
    { code: "02-323", name: "ห้องเรียน 323", floor: 2, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 323" },
    { code: "02-324", name: "ห้องเรียน 324", floor: 2, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 324" },
    { code: "02-WC-TCH", name: "ห้องน้ำอาจารย์ (ชั้น 2)", floor: 2, type: "RESTROOM", description: "ห้องสุขาอาจารย์และบุคลากร ชั้น 2 ปีกขวา" },
    { code: "02-STAIR-R", name: "โถงบันได 2 (ปีกขวา ชั้น 2)", floor: 2, type: "STAIR", description: "โถงบันไดเชื่อมชั้น 1-3 ปีกขวา" },
    { code: "02-325", name: "ห้องเรียน 325", floor: 2, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 325 ปีกขวา" },

    // ชั้น 3
    { code: "03-331", name: "ห้องเรียน 331", floor: 3, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 331 ปีกซ้าย" },
    { code: "03-WC-M1", name: "ห้องน้ำชาย 1 (ปีกซ้าย ชั้น 3)", floor: 3, type: "RESTROOM", description: "ห้องสุขาชาย 1 ประจำชั้น 3 ปีกซ้าย" },
    { code: "03-STAIR-L", name: "โถงบันได 1 (ปีกซ้าย ชั้น 3)", floor: 3, type: "STAIR", description: "โถงบันไดเชื่อมชั้น 2-4 ปีกซ้าย" },
    { code: "03-332", name: "ห้องเรียน 332", floor: 3, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 332" },
    { code: "03-333", name: "ห้องเรียน 333", floor: 3, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 333" },
    { code: "03-334", name: "ห้องเรียน 334", floor: 3, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 334" },
    { code: "03-WC-M2", name: "ห้องน้ำชาย 2 (ปีกขวา ชั้น 3)", floor: 3, type: "RESTROOM", description: "ห้องสุขาชาย 2 ประจำชั้น 3 ปีกขวา" },
    { code: "03-STAIR-R", name: "โถงบันได 2 (ปีกขวา ชั้น 3)", floor: 3, type: "STAIR", description: "โถงบันไดเชื่อมชั้น 2-4 ปีกขวา" },
    { code: "03-335", name: "ห้องเรียน 335", floor: 3, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 335 ปีกขวา" },

    // ชั้น 4
    { code: "04-341", name: "ห้องเรียน 341", floor: 4, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 341 ปีกซ้าย" },
    { code: "04-WC-GEN", name: "ห้องน้ำทั่วไป (ชั้น 4)", floor: 4, type: "RESTROOM", description: "ห้องสุขาทั่วไป ประจำชั้น 4 ปีกซ้าย" },
    { code: "04-STAIR-L", name: "โถงบันได 1 (ปีกซ้าย ชั้น 4)", floor: 4, type: "STAIR", description: "โถงบันไดชั้น 4 ปีกซ้าย" },
    { code: "04-342", name: "ห้องเรียน 342", floor: 4, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 342" },
    { code: "04-343", name: "ห้องเรียน 343", floor: 4, type: "CLASSROOM", description: "ห้องปฏิบัติการรวมใหญ่ 2 ช่วงเสา" },
    { code: "04-WC-TCH", name: "ห้องน้ำอาจารย์ (ชั้น 4)", floor: 4, type: "RESTROOM", description: "ห้องสุขาอาจารย์และบุคลากร ชั้น 4 ปีกขวา" },
    { code: "04-STAIR-R", name: "โถงบันได 2 (ปีกขวา ชั้น 4)", floor: 4, type: "STAIR", description: "โถงบันไดชั้น 4 ปีกขวา" },
    { code: "04-344", name: "ห้องเรียน 344", floor: 4, type: "CLASSROOM", description: "ห้องเรียนทฤษฎีและปฏิบัติการ 344 ปีกขวา" },
  ];

  for (const r of departmentRoomsSeedData) {
    await prisma.departmentRoom.create({
      data: {
        code: r.code,
        name: r.name,
        floor: r.floor,
        type: r.type,
        description: r.description || null,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${departmentRoomsSeedData.length} department rooms across 4 floors.`);

  // 3. ผูกข้อมูลอาคารเดี่ยว
  const deptBuilding = await prisma.building.create({
    data: {
      code: 'BLD-COMPTECH',
      name: DEPARTMENT_BUILDING_NAME,
      zone: 'โซนวิชาชีพช่างเทคนิค',
      totalFloors: 4,
      latitude: 15.2284,
      longitude: 104.8592,
      adminId: departmentAdmin.id,
    },
  })

  // 4. สร้างตั๋วตัวอย่างครอบคลุม 7 หมวดหมู่ และ 4 ชั้น (ผูกกับห้องชุดใหม่ 4 ชั้น อาคาร 3)

  // ตั๋ว 1: ชั้น 4 (ห้อง 343) - หมวด AIR_CONDITIONING (ด่วนวิกฤต)
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-089',
      incidentCode: 'INC-2024-001',
      title: 'ระบบเครื่องปรับอากาศมีน้ำรั่วซึมหยดลงบนโต๊ะคอมพิวเตอร์ - ห้องเรียน 343',
      description: 'เครื่องปรับอากาศเครื่องที่ #AC-04 มีน้ำหยดลงมาอย่างต่อเนื่องบริเวณโต๊ะคอมพิวเตอร์และสวิตช์เครือข่าย เสี่ยงต่อการลัดวงจร',
      category: Category.AIR_CONDITIONING,
      building: DEPARTMENT_BUILDING_NAME,
      buildingId: deptBuilding.id,
      floor: 4,
      room: '04-343',
      roomName: 'ห้องเรียน 343',
      specificPoint: 'โต๊ะคอมพิวเตอร์แถวที่ #04',
      specificLocation: 'ห้องเรียน 343 ชั้น 4 • โต๊ะคอมพิวเตอร์แถวที่ #04',
      latitude: 15.2284,
      longitude: 104.8592,
      gpsAccuracy: 2.0,
      isUrgent: true,
      priority: Priority.CRITICAL,
      slaTargetMinutes: 15,
      status: TicketStatus.ASSIGNED,
      currentStep: 2,
      stepNote: 'ช่างวิชัย กำลังเดินทางขึ้นชั้น 4 พร้อมอุปกรณ์ซ่อมท่อระบายน้ำแอร์',
      etaMinutes: 10,
      reporterId: studentSupawit.id,
      technicianId: techWichai.id,
      beforeImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
  })

  await prisma.attachment.create({
    data: {
      fileName: 'น้ำแอร์รั่วห้องเรียน343.jpg',
      fileSize: '1.8 MB',
      fileType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      type: AttachmentType.BEFORE,
      ticketId: ticket1.id,
    },
  })

  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: ticket1.id,
        status: TicketStatus.PENDING,
        step: 1,
        title: 'รับเรื่องและตรวจสอบข้อมูลแล้ว',
        note: 'ระบบตรวจพบตำแหน่งห้องเรียน 343 ชั้น 4 ตั้งค่าเป็นงานเร่งด่วนระดับ 1 ทันที',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
      },
      {
        ticketId: ticket1.id,
        status: TicketStatus.ASSIGNED,
        step: 2,
        title: 'มอบหมายช่างแล้ว: วิชัย ช่างไฟและแอร์',
        note: 'หัวหน้างานอาคารจ่ายงานให้ช่างวิชัยเข้าตัดไฟชั่วคราวและซ่อมท่อระบายน้ำทิ้ง',
        changedById: departmentAdmin.id,
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
    ],
  })

  // ตั๋ว 2: ชั้น 3 (ห้อง 332) - หมวด PC_HARDWARE (กำลังซ่อมแซม)
  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-090',
      incidentCode: 'INC-2024-002',
      title: 'อุปกรณ์คอมพิวเตอร์และฮาร์ดแวร์ประจำแล็บ - ห้องเรียน 332 (เครื่องที่ 12 เปิดไม่ติด)',
      description: 'คอมพิวเตอร์โต๊ะที่ 12 เปิดเครื่องไม่ติด พาวเวอร์ซัพพลายมีเสียงดังและมีกลิ่นไหม้ขณะนักศึกษากำลังทำปฏิบัติการ',
      category: Category.PC_HARDWARE,
      building: DEPARTMENT_BUILDING_NAME,
      buildingId: deptBuilding.id,
      floor: 3,
      room: '03-332',
      roomName: 'ห้องเรียน 332',
      specificPoint: 'โต๊ะคอมเครื่องที่ 12',
      specificLocation: 'ห้องเรียน 332 ชั้น 3 • โต๊ะคอมเครื่องที่ 12',
      isUrgent: false,
      priority: Priority.NORMAL,
      slaTargetMinutes: 60,
      status: TicketStatus.IN_PROGRESS,
      currentStep: 3,
      stepNote: 'ช่างอเล็กซ์ กำลังเปลี่ยน Power Supply ขนาด 650W ตัวใหม่',
      reporterId: studentSupawit.id,
      technicianId: techAlex.id,
      beforeImageUrl: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
    },
  })

  await prisma.attachment.create({
    data: {
      fileName: 'คอมเครื่องที่12ดับ.jpg',
      fileSize: '1.4 MB',
      fileType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=800&auto=format&fit=crop&q=80',
      type: AttachmentType.BEFORE,
      ticketId: ticket2.id,
    },
  })

  // ตั๋ว 3: ชั้น 4 (ห้อง 342) - หมวด NETWORK (ซ่อมเสร็จแล้ว มี Proof of Work)
  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-091',
      incidentCode: 'INC-2024-003',
      title: 'ระบบเครือข่ายและอินเทอร์เน็ต - ห้องเรียน 342 (สวิตช์ฮับพอร์ต 1-8 สัญญาณหลุด)',
      description: 'Managed Switch ประจำแถวหน้าห้องหลุดการเชื่อมต่อ ทำให้นักศึกษา 8 เครื่องไม่สามารถดึง IP Address จาก DHCP ได้',
      category: Category.NETWORK,
      building: DEPARTMENT_BUILDING_NAME,
      buildingId: deptBuilding.id,
      floor: 4,
      room: '04-342',
      roomName: 'ห้องเรียน 342',
      specificPoint: 'Cisco Switch Rack A แถวหน้าห้อง',
      specificLocation: 'ห้องเรียน 342 ชั้น 4 • Cisco Switch Rack A',
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.RESOLVED,
      currentStep: 4,
      stepNote: 'เข้าหัวสาย Uplink Cat6 ใหม่ และทดสอบ Link Speed 1Gbps ผ่านทุกพอร์ต',
      resolutionDetail: 'ตรวจสอบพบสาย Patch Cord หักงอ ทำการเปลี่ยนสาย Cat6 ใหม่ความยาว 2 เมตร ทดสอบ Ping Gateway และ DHCP ได้รับ IP ครบ 8 เครื่อง',
      afterImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      resolvedAt: new Date(Date.now() - 10 * 60 * 1000),
      reporterId: profSomchai.id,
      technicianId: techPrasert.id,
      createdAt: new Date(Date.now() - 120 * 60 * 1000),
    },
  })

  await prisma.attachment.create({
    data: {
      fileName: 'ผลการซ่อมสวิตช์และสายแล็บ.jpg',
      fileSize: '1.5 MB',
      fileType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      type: AttachmentType.AFTER,
      ticketId: ticket3.id,
    },
  })

  // ตั๋ว 4: ชั้น 1 (ห้อง 312) - หมวด ELECTRICAL (รอมอบหมาย Triage)
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-092',
      incidentCode: 'INC-2024-004',
      title: 'ระบบไฟฟ้า แสงสว่าง และปลั๊กไฟ - ห้องเรียน 312 (ปลั๊กไฟโต๊ะประกอบคอมมีรอยอาร์ก)',
      description: 'เต้ารับปลั๊กไฟใต้โต๊ะปฏิบัติการแถวที่ 3 มีประกายไฟและรอยอาร์กไหม้ ขอให้ช่างเข้าตรวจสอบเพื่อความปลอดภัย',
      category: Category.ELECTRICAL,
      building: DEPARTMENT_BUILDING_NAME,
      buildingId: deptBuilding.id,
      floor: 1,
      room: '01-312',
      roomName: 'ห้องเรียน 312',
      specificPoint: 'เต้ารับแถวที่ 3 ใต้โต๊ะ',
      isUrgent: true,
      priority: Priority.CRITICAL,
      slaTargetMinutes: 15,
      status: TicketStatus.PENDING,
      currentStep: 1,
      stepNote: 'รับเรื่องแล้ว รอมอบหมายช่างไฟฟ้าเข้าตัดระบบ',
      reporterId: studentSupawit.id,
      createdAt: new Date(Date.now() - 8 * 60 * 1000),
    },
  })

  // ตั๋ว 5: ชั้น 2 (ห้อง 322) - หมวด AV_EQUIPMENT (รอมอบหมาย Triage)
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-093',
      incidentCode: 'INC-2024-005',
      title: 'โสตทัศนูปกรณ์และสื่อการสอน - ห้องเรียน 322 (โปรเจกเตอร์สีเพี้ยนและภาพสั่น)',
      description: 'สายต่อ HDMI เพดานหลวม ภาพขึ้นหน้าจอโปรเจกเตอร์เป็นสีชมพูและกระพริบขณะอาจารย์กำลังสอนบรรยาย',
      category: Category.AV_EQUIPMENT,
      building: DEPARTMENT_BUILDING_NAME,
      buildingId: deptBuilding.id,
      floor: 2,
      room: '02-322',
      roomName: 'ห้องเรียน 322',
      specificPoint: 'สายต่อโปรเจกเตอร์หน้าห้อง',
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.PENDING,
      currentStep: 1,
      stepNote: 'รับเรื่องแล้ว รอจ่ายงานช่างโสตทัศนูปกรณ์',
      reporterId: profSomchai.id,
      createdAt: new Date(Date.now() - 18 * 60 * 1000),
    },
  })

  // ตั๋ว 6: ชั้น 2 (ห้องน้ำหญิง 02-WC-F) - หมวด PLUMBING (ปิดงานและตรวจรับแล้ว)
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-094',
      incidentCode: 'INC-2024-006',
      title: 'ระบบประปา สุขภัณฑ์ และห้องน้ำ - ห้องน้ำหญิง ชั้น 2 (ก๊อกน้ำอ่างล้างมือรั่วซึม)',
      description: 'ก๊อกน้ำอ่างล้างมืออ่างที่ 2 น้ำไหลไม่หยุด ปิดไม่สนิท',
      category: Category.PLUMBING,
      building: DEPARTMENT_BUILDING_NAME,
      buildingId: deptBuilding.id,
      floor: 2,
      room: '02-WC-F',
      roomName: 'ห้องน้ำหญิง (ชั้น 2)',
      specificPoint: 'อ่างล้างมืออ่างที่ 2',
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.CLOSED,
      currentStep: 4,
      stepNote: 'เปลี่ยนซีลยางวาล์วก๊อกน้ำใหม่เรียบร้อยแล้ว',
      resolutionDetail: 'เปลี่ยนวาล์วเปิด-ปิดและซีลยางกันซึม ทดสอบเปิด-ปิด 10 ครั้ง ไม่พบน้ำรั่ว',
      resolvedAt: new Date(Date.now() - 300 * 60 * 1000),
      closedAt: new Date(Date.now() - 240 * 60 * 1000),
      rating: 5,
      feedback: 'ช่างมาไวมาก ซ่อมเสร็จเรียบร้อยและสะอาด ขอบคุณครับ',
      reporterId: studentSupawit.id,
      technicianId: techWichai.id,
      createdAt: new Date(Date.now() - 360 * 60 * 1000),
    },
  })

  console.log('✅ Seeded sample tickets covering all 7 categories and 4 floors!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
