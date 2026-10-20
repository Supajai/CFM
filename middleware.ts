// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "campus-facility-maintenance-secret-jwt-key-2026-secure"
);

const SESSION_COOKIE_NAME = "campusops_session";

function getRoleDashboardUrl(role: string, baseUrl: string): URL {
  switch (role) {
    case "SUPER_ADMIN":
      return new URL("/super-admin/dashboard", baseUrl);
    case "ADMIN":
      return new URL("/admin/dashboard", baseUrl);
    case "TECHNICIAN":
      return new URL("/technician/dashboard", baseUrl);
    case "USER":
    default:
      return new URL("/student/dashboard", baseUrl);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  let sessionUser: any = null;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, JWT_SECRET, {
        algorithms: ["HS256"],
      });
      sessionUser = payload;
    } catch (err) {
      sessionUser = null;
    }
  }

  // ฟังก์ชันสร้าง Login Redirect พร้อมแนบ callbackUrl เดิม
  const createLoginRedirect = () => {
    const loginUrl = new URL("/login", request.url);
    const fullCallback = `${pathname}${search}`;
    loginUrl.searchParams.set("callbackUrl", fullCallback);
    return NextResponse.redirect(loginUrl);
  };

  // 1. ตรวจสอบ Protected Route: /super-admin/* (สิทธิ์สูงสุด IT เท่านั้น 100%)
  if (pathname.startsWith("/super-admin")) {
    if (!sessionUser) {
      return createLoginRedirect();
    }
    if (sessionUser.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(getRoleDashboardUrl(sessionUser.role, request.url));
    }
  }

  // 2. ตรวจสอบ Protected Route: /admin/* (หัวหน้างานอาคาร และ Super Admin)
  if (pathname.startsWith("/admin")) {
    if (!sessionUser) {
      return createLoginRedirect();
    }
    if (sessionUser.role !== "ADMIN" && sessionUser.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(getRoleDashboardUrl(sessionUser.role, request.url));
    }
  }

  // 3. ตรวจสอบ Protected Route: /technician/* (ช่างเทคนิค และ Super Admin)
  if (pathname.startsWith("/technician")) {
    if (!sessionUser) {
      return createLoginRedirect();
    }
    if (sessionUser.role !== "TECHNICIAN" && sessionUser.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(getRoleDashboardUrl(sessionUser.role, request.url));
    }
  }

  // 4. ตรวจสอบ Protected Route: /student/* (นักศึกษา/บุคลากร)
  if (pathname.startsWith("/student")) {
    if (!sessionUser) {
      return createLoginRedirect();
    }
  }

  // 5. ตรวจสอบ Protected Route: /report (แบบฟอร์มแจ้งซ่อม)
  if (pathname === "/report" || pathname.startsWith("/report/")) {
    if (!sessionUser) {
      return createLoginRedirect();
    }
  }

  // 6. หากล็อกอินแล้ว แต่พยายามเข้าหน้า /login หรือ /register
  if ((pathname === "/login" || pathname === "/register") && sessionUser) {
    const callback = request.nextUrl.searchParams.get("callbackUrl");
    if (callback && !callback.startsWith("/login") && !callback.startsWith("/register")) {
      return NextResponse.redirect(new URL(callback, request.url));
    }
    return NextResponse.redirect(getRoleDashboardUrl(sessionUser.role, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/report",
    "/report/:path*",
    "/student/:path*",
    "/technician/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/login",
    "/register",
  ],
};
