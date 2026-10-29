import type { Metadata } from "next";
import { Inter, Prompt } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ระบบแจ้งซ่อมและรายงานปัญหาในสถานศึกษา | CampusOps",
  description: "Smart Campus Issue & Facility Repair Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${inter.variable} ${prompt.variable}`}>
      <body className="min-h-screen bg-slate-50/75 font-sans text-slate-900 antialiased relative selection:bg-emerald-600 selection:text-white">
        {/* Atmospheric Engineering Dot Grid Background */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
