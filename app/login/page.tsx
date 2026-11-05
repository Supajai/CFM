// app/login/page.tsx
import LoginForm from "@/components/auth/LoginForm";
import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | CampusOps",
  description: "ยืนยันตัวตนเพื่อเข้าใช้งานระบบแจ้งซ่อมและกระดานจัดการงานช่าง",
};

export default function LoginPage() {
  return (
    <main className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden">
      {/* Ambient Emerald Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-8 text-center text-slate-600 flex items-center justify-center space-x-2 shadow-xl relative z-10">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span className="text-xs font-semibold">กำลังโหลดหน้าเข้าสู่ระบบ...</span>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
