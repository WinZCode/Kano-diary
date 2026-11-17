/*
 * GET /auth/callback — đích của link trong email xác nhận đăng ký.
 * Hỗ trợ 2 dạng link của Supabase:
 *   ?code=...                     (PKCE, mặc định của @supabase/ssr)
 *   ?token_hash=...&type=signup   (khi tự sửa email template)
 * Thành công → đăng nhập luôn và vào app; thất bại → /login kèm thông báo.
 */
import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";

const OTP_TYPES: readonly EmailOtpType[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

function isOtpType(value: string | null): value is EmailOtpType {
  return value !== null && (OTP_TYPES as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && isOtpType(type)) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = ok ? next : `${LOGIN_PATH}?error=confirm_failed`;
  return NextResponse.redirect(new URL(target, request.url));
}
