// lib/constants/academic-data.ts

/**
 * โครงสร้างข้อมูลแผนกวิชาและสาขาวิชา (Master Data)
 * สำหรับสายอาชีวศึกษา / เทคนิค / มหาวิทยาลัย
 * สามารถแก้ไข ปรับปรุง หรือนำข้อมูลจริงของสถานศึกษามาวางทับได้ที่ไฟล์นี้
 */

export interface DepartmentStructure {
  id: string;
  name: string;
  majors: string[];
}

export const DEPARTMENT_NAME = "แผนกวิชาช่างเทคนิคคอมพิวเตอร์";

export interface DepartmentUserGroup {
  value: string;
  label: string;
  classLevel: string;
  major: string;
  groupType: "VOCATIONAL_CERT" | "HIGH_VOCATIONAL_CERT" | "STAFF";
}

/**
 * กลุ่มสาขาวิชาและระดับชั้นการศึกษาเฉพาะประจำแผนกวิชาช่างเทคนิคคอมพิวเตอร์
 */
export const DEPARTMENT_USER_GROUPS: DepartmentUserGroup[] = [
  // 1. ปวช. ช่างเทคนิคคอมพิวเตอร์ (ปี 1 - 3)
  {
    value: "ปวช. 1 ช่างเทคนิคคอมพิวเตอร์",
    label: "ปวช. 1 - ช่างเทคนิคคอมพิวเตอร์",
    classLevel: "ปวช. 1",
    major: "ช่างเทคนิคคอมพิวเตอร์",
    groupType: "VOCATIONAL_CERT",
  },
  {
    value: "ปวช. 2 ช่างเทคนิคคอมพิวเตอร์",
    label: "ปวช. 2 - ช่างเทคนิคคอมพิวเตอร์",
    classLevel: "ปวช. 2",
    major: "ช่างเทคนิคคอมพิวเตอร์",
    groupType: "VOCATIONAL_CERT",
  },
  {
    value: "ปวช. 3 ช่างเทคนิคคอมพิวเตอร์",
    label: "ปวช. 3 - ช่างเทคนิคคอมพิวเตอร์",
    classLevel: "ปวช. 3",
    major: "ช่างเทคนิคคอมพิวเตอร์",
    groupType: "VOCATIONAL_CERT",
  },
  // 2. ปวส. สาขาเทคโนโลยีคอมพิวเตอร์ (ปี 1 - 2)
  {
    value: "ปวส. 1 สาขาเทคโนโลยีคอมพิวเตอร์",
    label: "ปวส. 1 - สาขาเทคโนโลยีคอมพิวเตอร์",
    classLevel: "ปวส. 1",
    major: "สาขาเทคโนโลยีคอมพิวเตอร์",
    groupType: "HIGH_VOCATIONAL_CERT",
  },
  {
    value: "ปวส. 2 สาขาเทคโนโลยีคอมพิวเตอร์",
    label: "ปวส. 2 - สาขาเทคโนโลยีคอมพิวเตอร์",
    classLevel: "ปวส. 2",
    major: "สาขาเทคโนโลยีคอมพิวเตอร์",
    groupType: "HIGH_VOCATIONAL_CERT",
  },
  // 3. ปวส. สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน (ปี 1 - 2)
  {
    value: "ปวส. 1 สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน",
    label: "ปวส. 1 - สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน",
    classLevel: "ปวส. 1",
    major: "สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน",
    groupType: "HIGH_VOCATIONAL_CERT",
  },
  {
    value: "ปวส. 2 สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน",
    label: "ปวส. 2 - สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน",
    classLevel: "ปวส. 2",
    major: "สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน",
    groupType: "HIGH_VOCATIONAL_CERT",
  },
  // 4. ครูผู้สอน / เจ้าหน้าที่ประจำแผนกวิชา
  {
    value: "ครูผู้สอน / เจ้าหน้าที่ประจำแผนกวิชา",
    label: "ครูผู้สอน / เจ้าหน้าที่ประจำแผนกวิชา",
    classLevel: "ครูผู้สอน / เจ้าหน้าที่",
    major: "ประจำแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
    groupType: "STAFF",
  },
];

export const ACADEMIC_DEPARTMENTS: DepartmentStructure[] = [
  {
    id: "comp-tech",
    name: "แผนกวิชาช่างเทคนิคคอมพิวเตอร์",
    majors: [
      "ช่างเทคนิคคอมพิวเตอร์ (ปวช.)",
      "สาขาเทคโนโลยีคอมพิวเตอร์ (ปวส.)",
      "สาขาการพัฒนาซอฟต์แวร์และแอปพลิเคชัน (ปวส.)",
      "ประจำแผนกวิชาช่างเทคนิคคอมพิวเตอร์",
    ],
  },
];

/**
 * ตัวเลือกระดับชั้นการศึกษา (Class Levels)
 */
export const CLASS_LEVEL_OPTIONS = [
  { value: "ปวช. 1", label: "ปวช. 1 (ประกาศนียบัตรวิชาชีพ ปีที่ 1)" },
  { value: "ปวช. 2", label: "ปวช. 2 (ประกาศนียบัตรวิชาชีพ ปีที่ 2)" },
  { value: "ปวช. 3", label: "ปวช. 3 (ประกาศนียบัตรวิชาชีพ ปีที่ 3)" },
  { value: "ปวส. 1", label: "ปวส. 1 (ประกาศนียบัตรวิชาชีพชั้นสูง ปีที่ 1)" },
  { value: "ปวส. 2", label: "ปวส. 2 (ประกาศนียบัตรวิชาชีพชั้นสูง ปีที่ 2)" },
  { value: "ครูผู้สอน / เจ้าหน้าที่", label: "ครูผู้สอน / เจ้าหน้าที่ประจำแผนกวิชา" },
];

/**
 * ฟังก์ชันช่วยดึงรายชื่อสาขาวิชาตามชื่อแผนกวิชา
 */
export function getMajorsByDepartment(departmentName?: string | null): string[] {
  if (!departmentName) return [];
  const dept = ACADEMIC_DEPARTMENTS.find((d) => d.name === departmentName);
  return dept ? dept.majors : [];
}
