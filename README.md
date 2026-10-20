# ระบบแจ้งซ่อมและรายงานปัญหาในสถานศึกษา
### Smart Campus Issue & Facility Repair Tracker (CampusOps)

โปรเจกต์ระบบแจ้งซ่อมและบริหารจัดการอาคารสถานที่สำหรับสถานศึกษา พัฒนาด้วย **Next.js 14 (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, และ **Zod** โดยอ้างอิงดีไซน์ตาม Figma Mockup ทั้ง 3 หน้าจอ

---

## 🚀 เริ่มต้นใช้งานอย่างรวดเร็ว (Quick Start)

### 1. ติดตั้ง Dependencies และตั้งค่า Environment
```bash
# ติดตั้ง Packages (หากยังไม่ได้ติดตั้ง)
npm install

# ตรวจสอบการตั้งค่าฐานข้อมูลในไฟล์ .env
DATABASE_URL="postgresql://postgres:admin1234@localhost:5432/campus_maintenance?schema=public"
```

### 2. รัน Migration และสร้างตารางในฐานข้อมูล
```bash
npx prisma migrate dev --name init_campus_maintenance
```

### 3. ใส่ข้อมูลตัวอย่าง (Seed Mock Data ตรงตาม Figma)
```bash
npx prisma db seed
```

### 4. รันเซิร์ฟเวอร์ทดสอบระบบ (Dev Server)
```bash
npm run dev
# หรือหากติดสิทธิ์บน Windows: npm.cmd run dev
```
เปิดเบราว์เซอร์ที่: **[http://localhost:3000](http://localhost:3000)**

npx prisma studio

---

## 📖 คู่มือการใช้งานและเอกสารระบบฉบับสมบูรณ์

กรุณาอ่านคู่มือการใช้งาน, กฎการ Validate (Zod), ER Diagram ฐานข้อมูล และคำสั่ง Terminal ฉบับเต็มได้ที่:
👉 **[คู่มือการใช้งานและพัฒนาโปรเจกต์ (MANUAL.md)](file:///c:/Campus%20Facility%20Maintenance%20and%20Issue%20Tracking%20System/MANUAL.md)**

---

## 📱 หน้าจอหลักของระบบแยกตาม 4 บทบาท (Distinct Role Architecture)
1. **หน้าพอร์ทัลหลักระดับสถาบัน (Institutional Service Portal):** `/`
2. **นักศึกษา / บุคลากร (`USER`):**
   - แดชบอร์ดนักศึกษา & ประวัติแจ้งซ่อม: `/student/dashboard`
   - แบบฟอร์มแจ้งซ่อม (Mobile-First): `/report`
   - ติดตามสถานะเรียลไทม์ (Timeline Stepper): `/tracking/REP-089`
3. **ช่างเทคนิคภาคสนาม (`TECHNICIAN`):**
   - แดชบอร์ดงานของฉัน & บันทึกปิดงาน: `/technician/dashboard`
   - กระดานคันบันงานช่าง: `/technician/kanban`
   - ประวัติงานที่ซ่อมเสร็จ & รูปหลังซ่อม: `/technician/history`
4. **หัวหน้างานอาคารสถานที่ (`ADMIN`):**
   - ศูนย์ปฏิบัติการบริหารอาคาร (Operations Dashboard): `/admin/dashboard`
   - คิวคัดกรองและจ่ายงานช่าง (Triage Queue): `/admin/triage`
   - ตั๋วแจ้งซ่อมทั้งหมดในระบบ: `/admin/tickets`
   - สถิติและรายงาน SLA: `/admin/reports`
5. **ผู้ดูแลระบบสูงสุด / IT (`SUPER_ADMIN`):**
   - ศูนย์ควบคุมระบบ (System & Governance Hub): `/super-admin/dashboard`
   - จัดการผู้ใช้งานและปรับเปลี่ยนสิทธิ์ (RBAC Table): `/super-admin/users`
   - ตั้งค่าอาคารและหมวดหมู่อาการ (Master Data): `/super-admin/settings`
   - บันทึกความปลอดภัยระบบ (Audit Logs): `/super-admin/audit`
6. **ระบบความปลอดภัยและการเข้าถึง:**
   - หน้าเข้าสู่ระบบ & Demo Switcher: `/login`
   - หน้าลงทะเบียนนักศึกษาใหม่: `/register`

---

## 🔑 บัญชีทดสอบสำหรับ Demo (รหัสผ่านเริ่มต้น: `123456`)
- 👑 **Super Admin:** `superadmin@campus.ac.th` -> `/super-admin/dashboard`
- 🏢 **Admin อาคาร:** `admin@campus.ac.th` -> `/admin/dashboard`
- 🔧 **Technician ช่าง:** `tech.alex@campus.ac.th` -> `/technician/dashboard`
- 🎓 **Student นักศึกษา:** `student.supawit@campus.ac.th` -> `/student/dashboard`
- 🎓 **Student นักศึกษา:** `student.supawit@campus.ac.th` (ศุภวิชญ์ #65-0482)
*(ที่หน้า `/login` มีปุ่มกดคลิกเดียวสลับบัญชีและกรอกรหัสผ่านให้อัตโนมัติ)*
