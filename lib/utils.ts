import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateThai(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function timeAgoThai(date: Date | string): string {
  const now = new Date().getTime()
  const past = new Date(date).getTime()
  const diffInMinutes = Math.floor((now - past) / (1000 * 60))

  if (diffInMinutes < 1) return "เมื่อสักครู่"
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} ชม. ที่แล้ว`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} วันที่แล้ว`
}
