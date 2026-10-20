import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครสมาชิกใหม่ | CampusOps",
  description: "ลงทะเบียนบัญชีนักศึกษาหรือบุคลากรสำหรับแจ้งซ่อมบำรุง",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <RegisterForm />
      </div>
    </main>
  );
}
