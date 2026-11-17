/*
 * Dịch mã lỗi Supabase Auth sang thông báo tiếng Việt thân thiện.
 * Mã lỗi: https://supabase.com/docs/guides/auth/debugging/error-codes
 */

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Email hoặc mật khẩu không đúng.",
  email_not_confirmed: "Email chưa được xác nhận. Hãy mở link trong email đăng ký.",
  user_already_exists: "Email này đã được đăng ký. Hãy đăng nhập.",
  email_exists: "Email này đã được đăng ký. Hãy đăng nhập.",
  weak_password: "Mật khẩu quá yếu. Hãy dùng mật khẩu dài hơn, có cả chữ và số.",
  over_email_send_rate_limit: "Đã gửi quá nhiều email. Vui lòng thử lại sau ít phút.",
  over_request_rate_limit: "Thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  signup_disabled: "Đăng ký tài khoản mới đang tạm tắt.",
  email_provider_disabled: "Đăng nhập bằng email đang bị tắt trên Supabase (Authentication → Providers → Email).",
  email_address_invalid: "Email này không được chấp nhận. Hãy dùng địa chỉ email thật.",
};

const FALLBACK = "Có lỗi xảy ra. Vui lòng thử lại.";

/** @param code Thuộc tính `code` của AuthError (có thể không có) */
export function authErrorMessage(code: string | undefined): string {
  return (code && MESSAGES[code]) || FALLBACK;
}

/**
 * Ghi lỗi gốc ra log server (terminal chạy npm run dev) để dễ tìm nguyên nhân khi người dùng
 * chỉ thấy thông báo chung. Không ghi email/mật khẩu.
 */
export function logAuthError(action: string, error: { code?: string; status?: number; message: string }): void {
  console.error(`[auth:${action}] code=${error.code ?? "?"} status=${error.status ?? "?"} — ${error.message}`);
}
