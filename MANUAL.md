# คู่มือการใช้งานและพัฒนาโปรเจกต์ (System Manual & Developer Guide)
## ระบบแจ้งซ่อมและรายงานปัญหาในสถานศึกษา (Smart Campus Issue & Repair Tracker)

เอกสารฉบับนี้จัดทำขึ้นเพื่อเป็นคู่มือมาตรฐาน (Standard Operational & Developer Manual) สำหรับนักศึกษา ผู้พัฒนา และอาจารย์ที่ปรึกษา ครอบคลุมการตั้งค่า, การรันระบบ, การทดสอบ (Testing), โครงสร้างการตรวจสอบข้อมูล (Data Validation), และการทำงานของทุกหน้าจอตาม Figma Mockup

---

## สารบัญ (Table of Contents)
1. [ข้อมูลสถาปัตยกรรมและเทคโนโลยี (Tech Stack)](#1-ข้อมูลสถาปัตยกรรมและเทคโนโลยี-tech-stack)
2. [ระบบยืนยันตัวตนและจัดการสิทธิ์ (Authentication & RBAC)](#2-ระบบยืนยันตัวตนและจัดการสิทธิ์-authentication--rbac)
3. [คำสั่ง Terminal สำหรับการรันและทดสอบระบบ (Terminal Commands)](#3-คำสั่ง-terminal-สำหรับการรันและทดสอบระบบ-terminal-commands)
4. [กฎการตรวจสอบข้อมูล (Data Validation Schemas - Zod)](#4-กฎการตรวจสอบข้อมูล-data-validation-schemas---zod)
5. [โครงสร้างฐานข้อมูล (Database Entities & Enums)](#5-โครงสร้างฐานข้อมูล-database-entities--enums)
6. [คู่มือการใช้งานแต่ละหน้าจอ (Page Usage Guides)](#6-คู่มือการใช้งานแต่ละหน้าจอ-page-usage-guides)
7. [การแก้ปัญหาที่พบบ่อย (Troubleshooting & Tips)](#7-การแก้ปัญหาที่พบบ่อย-troubleshooting--tips)

---

## 1. ข้อมูลสถาปัตยกรรมและเทคโนโลยี (Tech Stack)

| ส่วนของระบบ | เทคโนโลยีที่ใช้ | รายละเอียดการทำงาน |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14 (App Router)** | รองรับทั้ง Server Components และ Client Components |
| **Language** | **TypeScript** | Strict Type Safety ตรวจจับข้อผิดพลาดตั้งแต่ตอนเขียนโค้ด |
| **Authentication & RBAC** | **jose (JWT) + bcryptjs** | จัดเก็บ Session ใน HTTP-only Cookie พร้อม Middleware ตรวจสอบสิทธิ์ |
| **Styling & Icons** | **Tailwind CSS + Lucide React** | ดีไซน์สะอาดตา สไตล์ Clean Enterprise พร้อมฟอนต์ภาษาไทย (Prompt) |
| **Database & ORM** | **PostgreSQL 17 + Prisma ORM** | จัดการตาราง คีย์นอก (Foreign Keys) และ Index อย่างมีประสิทธิภาพ |
| **Data Validation** | **Zod** | ตรวจสอบความถูกต้องของ Input ทั้ง Client-side และ Server Actions |
| **Architecture** | **Clean Layered Architecture** | แยกโฟลเดอร์ `app/`, `components/`, `actions/`, `lib/`, `prisma/` |

---

## 2. ระบบยืนยันตัวตนและจัดการสิทธิ์ (Authentication & RBAC)

ระบบกำหนดระดับสิทธิ์ของผู้ใช้งานออกเป็น **4 ระดับ (Role-Based Access Control)**:

| ระดับสิทธิ์ (Role) | คำอธิบายสิทธิ์การใช้งาน | สิทธิ์เข้าถึงหน้าเว็บ |
| :--- | :--- | :--- |
| 👑 **SUPER_ADMIN** | สิทธิ์สูงสุดในระบบ จัดการผู้ใช้และเปลี่ยนสิทธิ์ทุกคนได้ | เข้าได้ทุกหน้า รวมถึง `/admin/users` |
| 🏢 **ADMIN** | ผู้ดูแลอาคารสถานที่ ดูแลภาพรวม มอบหมายช่าง | เข้าใช้งาน `/admin/kanban` และจัดการตั๋วได้ |
| 🔧 **TECHNICIAN** | ช่างเทคนิค/ซ่อมบำรุง เข้าใช้งานกระดานคันบัน อัปเดตงาน | เข้าใช้งาน `/admin/kanban` และอัปเดตสถานะงาน |
| 🎓 **USER** | นักศึกษา/บุคลากรทั่วไป แจ้งซ่อมและติดตามงานของตนเอง | เข้าใช้งาน `/report`, `/tracking/[id]` |

### บัญชีทดสอบเริ่มต้น (รหัสผ่านเริ่มต้นของทุกคน: `123456`)
มีปุ่มลัด **Demo Switcher** ที่หน้า `/login` ให้คลิกสลับบัญชีได้ทันที:
1. **Super Admin:** `superadmin@campus.ac.th`
2. **Admin อาคาร:** `admin@campus.ac.th`
3. **Technician (ช่าง):** `tech.alex@campus.ac.th`
4. **Student (นักศึกษา):** `student.supawit@campus.ac.th`

### กฎการป้องกันเส้นทาง (Middleware Route Protection)
- **`/admin/*`**: ต้องล็อกอิน และต้องมี Role เป็น `SUPER_ADMIN`, `ADMIN`, หรือ `TECHNICIAN` เท่านั้น (หากยังไม่ล็อกอินจะถูก Redirect ไป `/login?callbackUrl=...`)
- **`/admin/users`**: เฉพาะ `SUPER_ADMIN` เท่านั้นที่เข้าถึงได้ (หาก Role อื่นพยายามเข้า จะถูกส่งกลับไป `/admin/kanban`)

---

## 2. คำสั่ง Terminal สำหรับการรันและทดสอบระบบ (Terminal Commands)

### 2.1 การรันเซิร์ฟเวอร์เพื่อทดสอบการใช้งานจริง (Development Server)
```bash
# สำหรับ PowerShell หรือ Command Prompt ทั่วไป
npm run dev

# หากติดข้อความเตือนเรื่อง ExecutionPolicy บน Windows ให้ใช้คำสั่ง:
npm.cmd run dev
```
- **หน้าหลัก (Portal Hub):** [http://localhost:3000](http://localhost:3000)
- **หน้าฟอร์มแจ้งซ่อม (Mobile):** [http://localhost:3000/report](http://localhost:3000/report)
- **หน้าติดตามสถานะเรียลไทม์:** [http://localhost:3000/tracking/REP-089](http://localhost:3000/tracking/REP-089)
- **หน้ากระดาน Kanban จัดการงานช่าง:** [http://localhost:3000/admin/kanban](http://localhost:3000/admin/kanban)

---

### 2.2 การเปิดดูและจัดการฐานข้อมูลผ่าน GUI (Prisma Studio)
ใช้เปิดหน้าต่างดูและแก้ไขข้อมูลในตาราง `Ticket`, `User`, `Attachment`, `TicketHistory`:
```bash
npx prisma studio
```
- เปิดเบราว์เซอร์ไปที่: [http://localhost:5555](http://localhost:5555)

---

### 2.3 การทดสอบความถูกต้องของโค้ด (Type Safety Check)
ใช้ตรวจหาข้อผิดพลาดของโค้ด TypeScript และ Schema Validation โดยไม่ต้องรันเซิร์ฟเวอร์:
```bash
npx tsc --noEmit
```
*(หากไม่มีข้อความ Error แสดงขึ้นมา แสดงว่าโค้ดถูกต้อง ปลอดภัย 100%)*

---

### 2.4 การรีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น (Database Re-seed)
หากต้องการคืนค่าข้อมูลตั้งต้นตาม Figma Mockup ทั้ง 9 ตั๋ว และ 8 ผู้ใช้งาน:
```bash
npx prisma db seed
```

---

### 2.5 การปรับโครงสร้างฐานข้อมูลเมื่อแก้ไข Schema (Prisma Migration)
```bash
# เมื่อมีการเพิ่ม/แก้ไขฟิลด์ใน prisma/schema.prisma
npx prisma migrate dev --name <ชื่อการเปลี่ยนแปลง>

# อัปเดต Prisma Client ใน node_modules
npx prisma generate
```

---

## 3. กฎการตรวจสอบข้อมูล (Data Validation Schemas - Zod)

อ้างอิงจากไฟล์ [`lib/validations/ticket.ts`](file:///c:/Campus%20Facility%20Maintenance%20and%20Issue%20Tracking%20System/lib/validations/ticket.ts):

### 3.1 ฟอร์มส่งคำร้องแจ้งซ่อม (`createTicketSchema`)
| ฟิลด์ข้อมูล | ชนิดข้อมูล | เงื่อนไขการตรวจสอบ (Validation Rules) |
| :--- | :--- | :--- |
| `category` | Enum | ต้องเป็นหนึ่งใน: `AIR_CONDITIONING`, `ELECTRICAL`, `PLUMBING`, `IT_EQUIPMENT`, `FURNITURE`, `OTHER` |
| `building` | String | ต้องระบุ (ห้ามปล่อยว่าง) |
| `room` | String | ต้องระบุห้องหรือจุดเกิดเหตุที่ชัดเจน (ห้ามปล่อยว่าง) |
| `specificLocation` | String (Optional) | จุดสังเกตเฉพาะเจาะจง เช่น *"แร็คเซิร์ฟเวอร์ตู้ที่ #04"* |
| `latitude` | Number (Optional) | ละติจูดพิกัด GPS เช่น `15.2284` |
| `longitude` | Number (Optional) | ลองจิจูดพิกัด GPS เช่น `104.8592` |
| `gpsAccuracy` | Number (Optional) | ความแม่นยำของพิกัด เช่น `±2` เมตร |
| `description` | String | **ต้องมีความยาวอย่างน้อย 10 ตัวอักษร** เพื่อให้ช่างมีข้อมูลเพียงพอ |
| `isUrgent` | Boolean | ค่าเริ่มต้นเป็น `false` (หากเลือกเป็น `true` จะถูกกำหนดระดับความเร่งด่วนเป็น `CRITICAL`) |
| `attachments` | Array (Optional) | อาร์เรย์ของรูปภาพ `{ fileName, fileSize, fileType, url }` |

### 3.2 การอัปเดตสถานะตั๋ว (`updateTicketStatusSchema`)
- `ticketId`: รหัสไอดีของตั๋วในฐานข้อมูล
- `status`: สถานะใหม่ (`PENDING`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`, `CANCELLED`)
- `note`: บันทึกการเปลี่ยนแปลงสถานะหรือความคืบหน้าของงาน
- `etaMinutes`: เวลาคาดการณ์ที่ช่างจะถึงหน้างาน (นาที)

### 3.3 การประเมินความพึงพอใจและปิดงาน (`rateTicketSchema`)
- `ticketId`: รหัสไอดีของตั๋ว
- `rating`: ตัวเลขคะแนนดาวตั้งแต่ `1` ถึง `5`
- `feedback`: ข้อคิดเห็นและคำติชมเพิ่มเติมจากผู้แจ้ง

---

## 4. โครงสร้างฐานข้อมูล (Database Entities & Enums)

อ้างอิงจากไฟล์ [`prisma/schema.prisma`](file:///c:/Campus%20Facility%20Maintenance%20and%20Issue%20Tracking%20System/prisma/schema.prisma):

```mermaid
erDiagram
    User ||--o{ Ticket : "reportedTickets"
    User ||--o{ Ticket : "assignedTickets"
    User ||--o{ TicketHistory : "changedHistories"
    Ticket ||--o{ Attachment : "attachments"
    Ticket ||--o{ TicketHistory : "histories"

    User {
        string id PK
        string name
        string email UK
        enum role "USER | TECHNICIAN | ADMIN"
        string phone
        string studentId
        string technicianCode
        string position
    }

    Ticket {
        string id PK
        string ticketNumber UK
        string incidentCode
        string title
        string description
        enum category
        string building
        string room
        float latitude
        float longitude
        boolean isUrgent
        enum priority
        enum status
        int currentStep
    }

    Attachment {
        string id PK
        string fileName
        string fileSize
        string url
        enum type "BEFORE | AFTER"
        string ticketId FK
    }

    TicketHistory {
        string id PK
        enum status
        int step
        string title
        string note
        datetime timestamp
        string ticketId FK
        string changedById FK
    }
```

---

## 5. คู่มือการใช้งานแต่ละหน้าจอ (Page Usage Guides)

### 5.1 หน้าแบบฟอร์มแจ้งซ่อม (`/report` - ตาม Figma Mockup 1)
1. **เลือกหมวดหมู่ปัญหา:** คลิกปุ่มชิป เช่น *"เครื่องปรับอากาศและการระบายอากาศ"*
2. **แนบรูปถ่ายหลักฐาน:** คลิกที่กล่องถ่ายภาพเพื่อเลือกไฟล์หรือถ่ายภาพจากกล้องมือถือ (จะปรากฏภาพพรีวิวพร้อมชื่อไฟล์และขนาด)
3. **ตรวจสอบพิกัด GPS:** ระบบจะล็อกพิกัดอัตโนมัติ พร้อมแสดงป้ายสีเขียว *"ล็อกพิกัด GPS แล้ว"*
4. **เลือกสถานที่:** เลือกอาคารจากดรอปดาวน์ และระบุเลขห้องหรือจุดเกิดเหตุ
5. **กรอกรายละเอียด:** ระบุอาการชำรุดอย่างละเอียด
6. **สวิตช์ความเร่งด่วน:** เปิดสวิตช์หากเป็นเหตุฉุกเฉินที่มีความเสี่ยงต่อชีวิตหรือทรัพย์สิน
7. **ส่งคำร้อง:** กดปุ่ม **"ส่งคำขอแจ้งซ่อม"** ระบบจะบันทึกลงฐานข้อมูล ออกรหัสตั๋วอัตโนมัติ (เช่น `#REP-090`) และนำทางไปยังหน้าติดตามสถานะทันที

---

### 5.2 หน้าติดตามสถานะการซ่อมแบบเรียลไทม์ (`/tracking/[id]` - ตาม Figma Mockup 2)
1. **ข้อมูลสรุป:** ดูรหัสตั๋ว วันเวลา สถานที่ และพิกัดตู้แร็ค
2. **ไทม์ไลน์ 4 ขั้นตอน:**
   - ขั้นที่ 1: รับเรื่องและตรวจสอบข้อมูลแล้ว
   - ขั้นที่ 2: มอบหมายช่างแล้ว • กำลังเดินทาง (แสดงเวลาคาดการณ์ถึงหน้างาน)
   - ขั้นที่ 3: ตรวจสอบหน้างานและดำเนินการซ่อมแซม
   - ขั้นที่ 4: ซ่อมแซมเสร็จสิ้นและตรวจรับงาน
3. **การ์ดช่างเทคนิค:** แสดงรูป ชื่อช่าง **Alex Morgan (#04)** พร้อมปุ่มกดโทรศัพท์หรือส่งข้อความหาช่าง
4. **ตรวจรับงาน / ประเมินความพึงพอใจ:** เมื่อช่างดำเนินการเสร็จสิ้น ผู้แจ้งสามารถกดปุ่มให้คะแนนดาว 1-5 และบันทึกปิดตั๋วได้

---

### 5.3 หน้ากระดาน Kanban จัดการงานช่าง (`/admin/kanban` - ตาม Figma Mockup 3)
1. **แถบสถิติ SLA & งานวิกฤต:** แสดงจำนวนใบงานเปิดอยู่, รอบการทำงาน, และการแจ้งเตือนงานด่วน
2. **การค้นหาและตัวกรอง:** ช่องค้นหาด่วน (Ctrl+K), ตัวกรองแยกตามอาคาร, และตัวกรองเฉพาะงานเร่งด่วน
3. **กระดาน 3 คอลัมน์:**
   - **คอลัมน์ 1 (รอดำเนินการ):** งานที่เพิ่งแจ้งเข้ามาหรือมอบหมายแล้ว
   - **คอลัมน์ 2 (กำลังดำเนินการ):** งานที่ช่างกำลังตรวจซ่อมอยู่หน้างาน
   - **คอลัมน์ 3 (เสร็จสิ้น / ซ่อมเสร็จแล้ว):** งานที่ช่างซ่อมแซมและแนบหลักฐานเรียบร้อยแล้ว (การรีวิวคะแนนดาวของผู้แจ้งเป็นทางเลือกเสริม ไม่ใช่เงื่อนไขปิดงาน)
4. **การลากย้าย (Drag & Drop):** ช่างสามารถคลิกลากการ์ดงานข้ามคอลัมน์เพื่ออัปเดตสถานะและบันทึกลง PostgreSQL ทันที

---

## 6. การแก้ปัญหาที่พบบ่อย (Troubleshooting & Tips)

### กรณีพอร์ต 3000 ขึ้นว่าถูกใช้งานอยู่ (Port 3000 already in use)
หากพบปัญหาพอร์ต 3000 ติดค้าง สามารถรันคำสั่งใน PowerShell เพื่อเคลียร์พอร์ต:
```powershell
# ค้นหา Process ID ที่ใช้งาน Port 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

# สั่งปิด Process นั้น (แทนที่ <PID> ด้วยตัวเลขที่พบ)
Stop-Process -Id <PID> -Force
```

### กรณีฐานข้อมูลเชื่อมต่อไม่ได้ (PostgreSQL Connection Error)
ตรวจสอบไฟล์ `.env` ที่โฟลเดอร์รากของโปรเจกต์ ว่าข้อมูล User, Password และ Port ถูกต้องหรือไม่:
```env
DATABASE_URL="postgresql://postgres:admin1234@localhost:5432/campus_maintenance?schema=public"
```
และตรวจสอบว่า Service `postgresql-x64-17` ใน Windows กำลังรันอยู่:
```powershell
Get-Service *postgres*
```

---
*เอกสารนี้ได้รับการปรับปรุงให้ตรงกับเวอร์ชันปัจจุบันของระบบ Smart Campus Issue & Facility Repair Tracker*
