import RegisterForm from "@/components/auth/RegisterForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครสมาชิกใหม่ | CampusOps",
  description: "ลงทะเบียนบัญชีนักศึกษาหรือบุคลากรสำหรับแจ้งซ่อมบำรุง",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-transparent text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full flex justify-center relative z-10">
        <RegisterForm />
      </div>
    </main>
  );
}
