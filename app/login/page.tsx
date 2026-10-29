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
    <main className="min-h-screen bg-transparent text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full flex justify-center relative z-10">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-md p-6 text-center text-slate-600 flex items-center justify-center space-x-2 shadow-2xl">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">กำลังโหลดหน้าเข้าสู่ระบบ...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
