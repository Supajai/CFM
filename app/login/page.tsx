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
    <main className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full flex justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 flex items-center justify-center space-x-2 shadow-2xl">
              <Loader2 className="h-5 w-5 animate-spin text-slate-800" />
              <span className="text-sm font-semibold">กำลังโหลดหน้าเข้าสู่ระบบ...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
