/*
 * Proxy của Next.js 16 (tên mới của "middleware"): chạy trước mọi request trang.
 * Làm mới phiên đăng nhập Supabase và chuyển hướng người chưa đăng nhập về /login.
 */
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Bỏ qua file tĩnh và ảnh — không cần kiểm tra đăng nhập, tránh chậm.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)"],
};
