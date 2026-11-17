/*
 * Chạy trong src/proxy.ts trước mỗi request:
 * 1. Làm mới phiên Supabase (token hết hạn → đổi token mới, ghi lại cookie).
 * 2. Chuyển hướng "lạc quan" theo trạng thái đăng nhập (chưa đăng nhập → /login).
 * Đây KHÔNG phải lớp bảo mật cuối: mọi Server Action / truy vấn vẫn tự kiểm tra user,
 * và RLS trong Postgres chặn truy cập dữ liệu người khác.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { resolveAuthRedirect } from "@/lib/auth/routes";
import { getSupabaseEnv } from "./env";

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Ghi cookie mới vào cả request (cho code phía sau đọc) và response (gửi về trình duyệt).
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
      },
    },
  });

  // getClaims() xác thực chữ ký JWT — không tin cookie một cách mù quáng như getSession().
  // Không chèn code nào giữa createServerClient và getClaims (khuyến nghị của Supabase).
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const target = resolveAuthRedirect(request.nextUrl.pathname, request.nextUrl.search, isAuthenticated);
  if (!target) return response;

  const redirect = NextResponse.redirect(new URL(target, request.url));
  // Giữ cookie phiên vừa làm mới, nếu không người dùng có thể bị đăng xuất ngoài ý muốn.
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}
