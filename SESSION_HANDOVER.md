# 📋 Session Handover: CampusOps 2.5D & Issue Tracking System

เอกสารสรุปสถานะการพัฒนา ข้อกำหนด และบริบทสำคัญ สำหรับนำไปเริ่มต้น New Chat หรือส่งต่องานในเซสชันถัดไป

---

## 1. สถานะปัจจุบันของโปรเจกต์ (Completed Milestones)

- **แก้ไข Restroom ID Collision (Floor 2):**
  - แยก ID ห้องน้ำหญิง (`02-toilet-female`, code: `toilet-female`) และห้องน้ำอาจารย์ (`02-toilet-teacher`, code: `toilet-teacher`) ชัดเจนใน `lib/constants/department-locations.ts` และ `components/building/BuildingFloorMap.tsx`
  - ปัญหาสถานะแจ้งซ่อมติดขัดลามข้ามห้องถูกแก้ไขแล้ว 100%

- **แก้ไข Room Prefill Bug (ห้อง 335 vs 333):**
  - ปรับปรุง Logic การค้นหาใน `findDepartmentRoom` ให้ใช้ exact match แทน substring match ป้องกันการสับสนระหว่างห้อง 335 และ 333 ใน `components/report/ReportForm.tsx`

- **Smooth Mouse Wheel Zoom Dampening:**
  - ปรับ Event Handler ซูมล้อเมาส์ให้เคลื่อนไหวได้อย่างนุ่มนวลและไม่กระตุก ด้วย `step: 0.045`, `minScale: 0.7`, `maxScale: 3.0` และ `smooth: false`

- **Vector Sharpness Fix บนมือถือ (GPU Texture Fix):**
  - ลบ `willChange: "transform"` และ `translateZ(0)` ที่ทำให้ GPU Rasterize แผนผังจนภาพแตกเบลอ
  - เพิ่ม `vectorEffect="non-scaling-stroke"` ให้เส้นโครงสร้างตึกและป้ายแคปซูลคงความคมชัดสูงสุดทุกระดับการซูม

- **ปรับสัดส่วน Canvas และตัด Dead White Space:**
  - ปรับความสูงกล่องแผนผัง 2.5D เป็น `h-[340px] sm:h-[550px] md:h-[620px]`
  - ปรับระยะ Padding ท้ายหน้าเป็น `pb-18 pb-[72px] sm:pb-8` ไม่ให้แผนผังถูก Bottom Navigation บัง

- **UI Refinement (Clean Enterprise Lucide Icons):**
  - กวาดล้าง Emoji ทั้งหมด (🚻, 🎓, ⚠️, 🚨, 🔧, ⚡, ✋, ⏸️, 🚀, ✅, 📋) ออกจากโค้ด UI 100%
  - แทนที่ด้วยเวกเตอร์ไอคอน Stroke จาก `lucide-react`:
    - ป้ายห้องน้ำ: `<Users className="text-sky-700" strokeWidth={2} />`
    - หมุดลอยแจ้งเตือน: `<AlertTriangle stroke="#ffffff" strokeWidth={2.5} />` (วิกฤต) / `<Wrench stroke="#ffffff" strokeWidth={2.5} />` (งานซ่อมทั่วไป)
    - Drawer รายละเอียดห้อง: `<AlertTriangle>`, `<Wrench>`, `<Zap>`, `<UserCheck>`, `<PauseCircle>`, `<ArrowRightCircle>`, `<CheckCircle2>`, `<ClipboardList>`
    - Navigation: Main Navbar (`<Layers>`, `<GraduationCap>`) และ Mobile Bottom Nav (`<LayoutDashboard>`, `<Plus>`, `<ClipboardList>`, `<User>`)

- **การตรวจสอบคุณภาพโค้ด:**
  - ตรวจสอบ Regex ไม่มีตัวอักขระ Emoji หลงเหลือใน UI
  - รัน `npx tsc --noEmit` ผ่านฉลุย **0 Errors**

---

## 2. รายชื่อไฟล์หลักที่กำลังทำงานอยู่ (Active Files)

| ไฟล์ | หน้าที่และความรับผิดชอบ |
| :--- | :--- |
| `components/building/BuildingFloorMap.tsx` | แผนผัง 2.5D Isometric SVG, การคำนวณตำแหน่งห้อง, ป้ายแคปซูล, หมุดแจ้งเตือนลอย, Zoom/Pan Controller และ Drawer รายละเอียดห้อง |
| `lib/constants/department-locations.ts` | Master Data ของห้องประจำชั้น (Floor 1–4), พิกัดเรขาคณิต, รหัสห้อง และฟังก์ชันค้นหาตำแหน่งห้อง |
| `components/navigation/MobileBottomNav.tsx` | แถบนำทางด้านล่างบนจอมือถือ (Bottom Navigation Bar) 4 แท็บหลัก |
| `components/navigation/MainNavbar.tsx` | แถบ Navigation ด้านบน แสดงโลโก้, แผนกวิชา, ข้อมูลผู้ใช้ และปุ่มออกจากระบบ |
| `app/student/dashboard/page.tsx` | หน้า Dashboard หลักของนักศึกษา/บุคลากร สำหรับดูผังอาคารและประวัติงานแจ้งซ่อม |
| `components/report/ReportForm.tsx` | แบบฟอร์มส่งคำร้องแจ้งซ่อม รองรับการ Auto-fill ข้อมูลห้องจากการคลิกบนแผนผัง 2.5D |

---

## 3. กฎเหล็กและข้อห้าม (Strict Guardrails)

1. ⛔ **ห้ามขยับหรือแก้ไขพิกัดเรขาคณิต SVG อาคาร:**
   - ห้ามแตะต้องพิกัดเส้นตึก, เสา, กำแพง, พื้น Slab, ทางเดิน และ viewBox `195 55 860 570` ของโครงสร้างตัวตึกเดิมโดยเด็ดขาด
2. ⛔ **ห้ามแตะต้อง Logic ตั๋วและรหัสห้องที่ถูกต้องแล้ว:**
   - ห้ามเปลี่ยน Logic ใน `isTicketInRoom`, `stripFloorPrefix`, `cleanStr`
   - ห้ามเปลี่ยนรหัส `id` และ `code` ของห้องที่เชื่อมโยงกับฐานข้อมูล
3. ⛔ **ห้ามนำ Emoji ตัวอักษรกลับมาใช้ใน UI:**
   - ใช้เฉพาะไอคอนเวกเตอร์จาก `lucide-react` เท่านั้น เพื่อรักษาภาพลักษณ์ Modern Enterprise SaaS
4. ⛔ **รักษาความคมชัดและ Event ลูกกลิ้งเมาส์:**
   - ห้ามใส่ `willChange: "transform"` หรือ `translateZ` ที่ทำให้เบลอบนมือถือ
   - รักษา Logic การซูมที่ Dampen ความไว (Step 0.045) ไว้ตามเดิม
5. ⛔ **TypeScript Integrity:**
   - โค้ดทุกจุดต้องคอมไพล์ผ่าน `npx tsc --noEmit` ด้วยสถานะ **0 Errors** เสมอ

---

## 4. ปัญหาและฟีเจอร์ถัดไปที่ต้องทำต่อ (Next Steps)

1. **Auto-Center & Initial Position เมื่อสลับชั้นบนมือถือ:**
   - ตรวจสอบและปรับจูนตำแหน่งเริ่มต้นของแผนผังเมื่อผู้ใช้กดเปลี่ยนชั้น (1F–4F) บนหน้าจอมือถือ เพื่อให้ตัวตึกอยู่กึ่งกลางพอดี ไม่หลุดชิดขอบบนหรือมีช่องว่างด้านบนมากเกินไป
2. **End-to-End Workflow Verification:**
   - ทดสอบ Flow การใช้งานครบวงจร: นักศึกษาส่งแจ้งซ่อมผ่านผัง 2.5D -> ผู้ดูแล/Admin มอบหมายงาน -> ช่างรับงาน/บันทึกผล -> นักศึกษาดูสถานะอัปเดตแบบเรียลไทม์
3. **Drawer Smooth Interaction:**
   - เพิ่มความลื่นไหลของ Transition เมื่อเปิด/ปิด Drawer รายละเอียดห้องบน Mobile Viewport

