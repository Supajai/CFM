import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanTickets() {
  console.log("=================================================");
  console.log("🧹 กำลังเริ่มต้นล้างข้อมูลตั๋วงานซ่อมและประวัติทั้งหมด...");
  console.log("=================================================\n");

  try {
    // 0. ตรวจสอบจำนวนข้อมูลก่อนลบ
    const [ticketCountBefore, historyCountBefore, attachmentCountBefore, userCountBefore, roomCountBefore] =
      await Promise.all([
        prisma.ticket.count(),
        prisma.ticketHistory.count(),
        prisma.attachment.count(),
        prisma.user.count(),
        prisma.departmentRoom.count(),
      ]);

    console.log(`📊 ข้อมูลปัจจุบันในระบบก่อนดำเนินการ:`);
    console.log(`   - ตั๋วแจ้งซ่อม (Tickets): ${ticketCountBefore} รายการ`);
    console.log(`   - ประวัติการดำเนินงาน (TicketHistory): ${historyCountBefore} รายการ`);
    console.log(`   - ไฟล์แนบ/รูปถ่าย (Attachments): ${attachmentCountBefore} รายการ`);
    console.log(`   - ผู้ใช้งาน (Users - Master Data): ${userCountBefore} บัญชี (คงเดิม)`);
    console.log(`   - ห้องปฏิบัติการ (DepartmentRooms - Master Data): ${roomCountBefore} ห้อง (คงเดิม)\n`);

    // 1. ลบข้อมูลหลักฐานรูปถ่าย/ไฟล์แนบที่ผูกกับตั๋ว (Attachments)
    const deletedAttachments = await prisma.attachment.deleteMany({});
    console.log(`✅ [1/3] ลบไฟล์แนบ (Attachments) เรียบร้อย: ${deletedAttachments.count} รายการ`);

    // 2. ลบประวัติการดำเนินงานตั๋ว (TicketHistory / Audit Trails)
    const deletedHistory = await prisma.ticketHistory.deleteMany({});
    console.log(`✅ [2/3] ลบประวัติตั๋ว (TicketHistory) เรียบร้อย: ${deletedHistory.count} รายการ`);

    // 3. ลบรายการตั๋วแจ้งซ่อมทั้งหมด (Tickets)
    const deletedTickets = await prisma.ticket.deleteMany({});
    console.log(`✅ [3/3] ลบตั๋วแจ้งซ่อม (Tickets) ทั้งหมดเรียบร้อย: ${deletedTickets.count} รายการ`);

    // ตรวจสอบความถูกต้องหลังลบ
    const ticketCountAfter = await prisma.ticket.count();
    const userCountAfter = await prisma.user.count();

    console.log("\n-------------------------------------------------");
    console.log(`🎉 ล้างข้อมูลสำเร็จ 100%!`);
    console.log(`   - งานซ่อมคงค้างในระบบ = ${ticketCountAfter} รายการ`);
    console.log(`   - ข้อมูล Master Data (Users: ${userCountAfter}) ยังคงอยู่ครบถ้วน ปลอดภัย`);
    console.log("   - ระบบพร้อมสำหรับการทดสอบส่งงานแจ้งซ่อมใหม่จาก 0 แล้วครับ");
    console.log("-------------------------------------------------");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการล้างข้อมูลตั๋ว:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanTickets();
