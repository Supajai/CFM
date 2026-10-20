// prisma/seed.ts - Database Seeder with Auth & RBAC
import { PrismaClient, Role, Category, Priority, TicketStatus, AttachmentType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed with Auth & RBAC...')

  // ล้างข้อมูลเก่า
  await prisma.attachment.deleteMany()
  await prisma.ticketHistory.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 Cleaned existing records.')

  // แฮชรหัสผ่านมาตรฐาน "123456" สำหรับบัญชีทดสอบทุกคน
  const defaultPasswordHash = await bcrypt.hash('123456', 10)

  // 1. สร้างบัญชีหลักตามโจทย์ RBAC 4 ระดับ (รหัสผ่าน: 123456)
  
  // 1.1 SUPER_ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      name: 'ดร. ธีรภัทร นรินทร์เดช (Super Admin)',
      email: 'superadmin@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.SUPER_ADMIN,
      phone: '02-555-1001',
      position: 'ผู้อำนวยการสำนักบริหารอาคารและเทคโนโลยี',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      department: 'สำนักอธิการบดี',
    },
  })

  // 1.2 ADMIN
  const facilityAdmin = await prisma.user.create({
    data: {
      name: 'สมศักดิ์ บริหารทรัพย์ (Admin งานอาคาร)',
      email: 'admin@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.ADMIN,
      phone: '02-555-1044',
      position: 'หัวหน้างานซ่อมบำรุงและกายภาพ',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      department: 'ฝ่ายอาคารและสถานที่ วิทยาเขตหลัก',
    },
  })

  // 1.3 TECHNICIAN (ช่างหลัก Alex Morgan #04)
  const alexTechnician = await prisma.user.create({
    data: {
      name: 'Alex Morgan (อเล็กซ์ มอร์แกน)',
      email: 'tech.alex@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.TECHNICIAN,
      phone: '(+66) 81-555-4921 (ต่อ 248)',
      technicianCode: '#04',
      position: 'หัวหน้าทีมช่างเทคนิค • ระบบปรับอากาศและความเย็น',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      department: 'ฝ่ายอาคารและสถานที่ วิทยาเขตฝั่งตะวันออก',
    },
  })

  // 1.4 USER (นักศึกษา ศุภวิชญ์ #65-0482)
  const supawitStudent = await prisma.user.create({
    data: {
      name: 'ศุภวิชญ์ ไตรภาคี',
      email: 'student.supawit@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '(+66) 81-987-4921',
      studentId: '#65-0482',
      department: 'สาขาวิชาช่างเทคนิคคอมพิวเตอร์',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
  })

  // ช่างเทคนิคคนที่ 2 (ก. ประเสริฐ #07)
  const prasertTechnician = await prisma.user.create({
    data: {
      name: 'ก. ประเสริฐ',
      email: 'tech.prasert@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.TECHNICIAN,
      phone: '082-333-7890 (ต่อ 250)',
      technicianCode: '#07',
      position: 'ช่างเทคนิคไฟฟ้าและโสตทัศนูปกรณ์',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      department: 'ฝ่ายอาคารและสถานที่',
    },
  })

  // บุคลากร / อาจารย์ / นักศึกษาเพิ่มเติม
  const somchaiProf = await prisma.user.create({
    data: {
      name: 'อ.สมชาย (อาจารย์)',
      email: 'somchai.t@faculty.campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '089-112-2334',
      department: 'ภาควิชาวิศวกรรมคอมพิวเตอร์',
    },
  })

  const libraryStaff = await prisma.user.create({
    data: {
      name: 'เจ้าหน้าที่เคาน์เตอร์หอสมุด',
      email: 'library.staff@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '02-555-1200',
      department: 'หอสมุดกลาง',
    },
  })

  const kittisakTA = await prisma.user.create({
    data: {
      name: 'ผู้ช่วยสอน กิตติศักดิ์',
      email: 'kittisak.ta@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '084-556-7891',
      department: 'งานบริการการสอนและโสตทัศนูปกรณ์',
    },
  })

  const securityStaff = await prisma.user.create({
    data: {
      name: 'รปภ. ประจำวิทยาเขต',
      email: 'security.east@campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '02-555-1999',
      department: 'งานรักษาความปลอดภัย',
    },
  })

  const nattapornStudent = await prisma.user.create({
    data: {
      name: 'ณัฐพร (นักศึกษา)',
      email: 'nattaporn.k@student.campus.ac.th',
      password: defaultPasswordHash,
      role: Role.USER,
      phone: '083-445-6677',
      studentId: '#66-1029',
      department: 'สาขามัลติมีเดียและแอนิเมชัน',
    },
  })

  console.log('✅ Created 10 mock users with bcrypt-hashed passwords.')

  // 2. สร้างตั๋วตัวอย่างตาม Mockup ทั้ง 3 หน้า

  // ตั๋วหลัก #REP-089
  const rep089 = await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-089',
      incidentCode: 'INC-2024-E',
      title: 'เครื่องปรับอากาศมีน้ำรั่วซึมหยดลงบนตู้เซิร์ฟเวอร์โดยตรง',
      description:
        'เครื่องปรับอากาศเครื่องที่ #AC-04 มีน้ำหยดลงมาอย่างต่อเนื่องบริเวณโต๊ะเซิร์ฟเวอร์สำรองและโต๊ะปฏิบัติการนักศึกษาโต๊ะที่ 6 เสี่ยงต่อการลัดวงจร',
      category: Category.AIR_CONDITIONING,
      building: 'อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์',
      room: 'ห้องปฏิบัติการ 402 ชั้น 4 (ฝั่งทิศตะวันตก)',
      specificLocation: 'แร็คเซิร์ฟเวอร์ตู้ที่ #04 (ห้องเซิร์ฟเวอร์และเครือข่าย)',
      latitude: 15.2284,
      longitude: 104.8592,
      gpsAccuracy: 2.0,
      isUrgent: true,
      priority: Priority.CRITICAL,
      slaTargetMinutes: 15,
      status: TicketStatus.ASSIGNED,
      currentStep: 2,
      stepNote:
        'ช่างเทคนิคอาวุโส อเล็กซ์ มอร์แกน กำลังเดินทางจากศูนย์ซ่อมบำรุง อาคาร 1 คาดว่าจะถึงในอีก ~12 นาที',
      etaMinutes: 12,
      reporterId: supawitStudent.id,
      technicianId: alexTechnician.id,
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 นาทีที่แล้ว
    },
  })

  await prisma.attachment.createMany({
    data: [
      {
        fileName: 'vent_leak.jpg',
        fileSize: '1.8 MB',
        fileType: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
        type: AttachmentType.BEFORE,
        ticketId: rep089.id,
      },
      {
        fileName: 'floor_puddle.jpg',
        fileSize: '2.4 MB',
        fileType: 'image/jpeg',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        type: AttachmentType.BEFORE,
        ticketId: rep089.id,
      },
    ],
  })

  await prisma.ticketHistory.createMany({
    data: [
      {
        ticketId: rep089.id,
        status: TicketStatus.PENDING,
        step: 1,
        title: 'รับเรื่องและตรวจสอบข้อมูลแล้ว',
        note: 'ระบบคัดกรองอัตโนมัติตรวจพบอุปกรณ์รหัส (#SRV-R04) กำหนดเป็นงานเร่งด่วนระดับ 1 (ระบบปรับอากาศ)',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
      },
      {
        ticketId: rep089.id,
        status: TicketStatus.ASSIGNED,
        step: 2,
        title: 'มอบหมายช่างแล้ว • กำลังเดินทาง',
        note: 'ช่างเทคนิคอาวุโส อเล็กซ์ มอร์แกน กำลังเดินทางจากศูนย์ซ่อมบำรุง อาคาร 1 คาดว่าจะถึงในอีก ~12 นาที',
        changedById: alexTechnician.id,
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
      },
    ],
  })

  // #REP-088
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-088',
      incidentCode: 'INC-2024-F',
      title: 'หลอดฟลูออเรสเซนต์กระพริบต่อเนื่องในห้องเขียนแบบ',
      description: 'หลอดไฟแถวกลางกระพริบตลอดเวลา ทำให้ปวดตาขณะเรียนวิชาดรอว์อิ้ง',
      category: Category.ELECTRICAL,
      building: 'อาคาร 1 - อาคารเรียนรวมและปฏิบัติการวิศวกรรม',
      room: 'ห้อง 204 ชั้น 2',
      latitude: 15.2291,
      longitude: 104.8585,
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.ASSIGNED,
      currentStep: 2,
      stepNote: 'จัดคิวช่างเข้าตรวจสอบรอบบ่าย',
      reporterId: somchaiProf.id,
      technicianId: prasertTechnician.id,
      createdAt: new Date(Date.now() - 42 * 60 * 1000),
    },
  })

  // #REP-085
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-085',
      incidentCode: 'INC-2024-G',
      title: 'โช้คอัพประตูปิดไม่สนิททำใหแอร์รั่วไหลสูญเสียความเย็น',
      description: 'ประตูกระจกทางเข้าด้านหน้าไม่สวิงกลับตำแหน่งเดิม แอร์ออกตลอดเวลา',
      category: Category.FURNITURE,
      building: 'หอสมุดกลาง วิทยาเขตหลัก',
      room: 'ทางเข้าหอสมุดกลาง (ทิศเหนือ)',
      latitude: 15.2275,
      longitude: 104.8598,
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.ASSIGNED,
      currentStep: 2,
      stepNote: 'เตรียมอุปกรณ์ไขควงและน้ำมันหล่อลื่นไฮดรอลิก',
      reporterId: libraryStaff.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  })

  // #REP-082
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-082',
      incidentCode: 'INC-2024-H',
      title: 'เต้ารับพอร์ต HDMI ติดผนังหลวม สัญญาณภาพหลุดระหว่างสอน',
      description: 'เมื่อขยับสายสัญญาณภาพบนโปรเจกเตอร์จะดับ ขั้วเต้ารับด้านในน่าจะหลวมหรือชำรุด',
      category: Category.IT_EQUIPMENT,
      building: 'อาคาร 2 - อาคารบรรยายรวม',
      room: 'ห้องบรรยาย B',
      latitude: 15.228,
      longitude: 104.86,
      isUrgent: false,
      priority: Priority.LOW,
      status: TicketStatus.ASSIGNED,
      currentStep: 2,
      stepNote: 'รอบำรุงรักษาตามรอบอาคาร',
      reporterId: kittisakTA.id,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  })

  // Column 2: In Progress
  const rep076 = await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-076',
      incidentCode: 'INC-2024-D',
      title: 'วาล์วท่อส่งน้ำหลักแรงดันตกและมีน้ำซึมเล็กน้อย',
      description: 'พบน้ำซึมบริเวณข้อต่อเกลียววาล์วหลักห้องใต้ดิน เกจวัดแรงดันลดลงต่ำกว่า 2 บาร์',
      category: Category.PLUMBING,
      building: 'เวิร์กช็อป 4 - อาคารซ่อมบำรุงกลาง',
      room: 'อุโมงค์ชั้นใต้ดิน ช่องงานระบบท่อ',
      latitude: 15.2268,
      longitude: 104.8579,
      isUrgent: true,
      priority: Priority.URGENT,
      status: TicketStatus.IN_PROGRESS,
      currentStep: 3,
      stepNote: 'เบิกอะไหล่จากคลังเรียบร้อย • กำหนดเสร็จ ~30 นาที',
      partsOrdered: true,
      etaMinutes: 30,
      reporterId: securityStaff.id,
      technicianId: alexTechnician.id,
      createdAt: new Date(Date.now() - 80 * 60 * 1000),
    },
  })

  await prisma.attachment.create({
    data: {
      fileName: 'valve_leak.jpg',
      fileSize: '3.1 MB',
      fileType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&auto=format&fit=crop&q=80',
      type: AttachmentType.BEFORE,
      ticketId: rep076.id,
    },
  })

  // #REP-074
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-074',
      incidentCode: 'INC-2024-C',
      title: 'บัลลาสต์โปรเจกเตอร์เพดานเสียและทำความสะอาดแผ่นกรอง',
      description: 'โปรเจกเตอร์เพดานห้องแล็บตัดดับหลังเปิด 5 นาที ไฟสถานะขึ้นสีส้มกระพริบ',
      category: Category.IT_EQUIPMENT,
      building: 'อาคาร 3 - สาขาวิชาช่างเทคนิคคอมพิวเตอร์',
      room: 'ห้องมัลติมีเดีย 101 ชั้น 1',
      latitude: 15.2284,
      longitude: 104.8592,
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.IN_PROGRESS,
      currentStep: 3,
      stepNote: 'แยกชิ้นส่วนทดสอบบนโต๊ะช่าง • กำลังวัดแรงดันไฟ 240V',
      reporterId: nattapornStudent.id,
      technicianId: prasertTechnician.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  })

  // Column 3: Resolved / Closed
  const rep071 = await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-071',
      incidentCode: 'INC-2024-B',
      title: 'ปรับจูนเซ็นเซอร์โถสุขภัณฑ์อัตโนมัติและเคลียร์สิ่งอุดตัน',
      description: 'เซ็นเซอร์อินฟราเรดไม่สั่งฟลัชน้ำ และมีน้ำเอ่อระบายช้า',
      category: Category.PLUMBING,
      building: 'อาคาร 5 - อาคารเรียนและวิทยบริการ',
      room: 'ห้องน้ำชั้น 2 (ฝั่งตะวันตก)',
      latitude: 15.23,
      longitude: 104.861,
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.RESOLVED,
      currentStep: 4,
      stepNote: 'รอนักศึกษาลงนามตรวจรับงานผ่านระบบดิจิทัล',
      reporterId: nattapornStudent.id,
      technicianId: alexTechnician.id,
      resolvedAt: new Date(Date.now() - 25 * 60 * 1000),
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  })

  await prisma.attachment.create({
    data: {
      fileName: 'toilet_sensor_fixed.jpg',
      fileSize: '1.5 MB',
      fileType: 'image/jpeg',
      url: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800&auto=format&fit=crop&q=80',
      type: AttachmentType.AFTER,
      ticketId: rep071.id,
    },
  })

  // #REP-068
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-068',
      incidentCode: 'INC-2024-A',
      title: 'เปลี่ยนแบตเตอรี่ไฟฉุกเฉินทางหนีไฟเสร็จสมบูรณ์',
      description: 'ไฟสัญญาณเตือนแบตเตอรี่เสื่อมสภาพบริเวณทางออกบันไดหนีไฟฝั่งใต้',
      category: Category.ELECTRICAL,
      building: 'อาคาร 2 - อาคารบรรยายรวม',
      room: 'ประตูทางออกโรงอาหารทิศใต้',
      latitude: 15.2282,
      longitude: 104.8601,
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.CLOSED,
      currentStep: 4,
      stepNote: 'ตรวจสอบและปิดงานแล้ว',
      technicianId: prasertTechnician.id,
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  })

  // #REP-065
  await prisma.ticket.create({
    data: {
      ticketNumber: '#REP-065',
      incidentCode: 'INC-2023-Z',
      title: 'ติดตั้งโครงยึดกระดานไวท์บอร์ดห้อง 302 ใหม่ให้แน่นหนา',
      description: 'มุมขวาบนของกระดานเริ่มหลุดจากพุกพลาสติก เสี่ยงต่อการตกลงมาทับนักศึกษา',
      category: Category.FURNITURE,
      building: 'อาคาร 1 - อาคารเรียนรวมและปฏิบัติการวิศวกรรม',
      room: 'อาคาร 1, ชั้น 3 ห้อง 302',
      latitude: 15.2291,
      longitude: 104.8585,
      isUrgent: false,
      priority: Priority.NORMAL,
      status: TicketStatus.CLOSED,
      currentStep: 4,
      stepNote: 'ปิดงานแล้ว',
      technicianId: alexTechnician.id,
      resolvedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    },
  })

  console.log('✅ Seeded tickets and attachments successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
