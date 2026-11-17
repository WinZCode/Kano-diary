/*
 * Quy tắc điều hướng theo trạng thái đăng nhập — hàm thuần, dùng trong proxy và có unit test.
 */

/** Trang dành cho người CHƯA đăng nhập; đã đăng nhập mà vào → đưa về trang chính. */
export const AUTH_PAGES = ["/login", "/register"] as const;

/** Tiền tố đường dẫn ai cũng vào được (callback xác nhận email...). */
const PUBLIC_PREFIXES = ["/auth/"] as const;

export const HOME_PATH = "/dashboard";
export const LOGIN_PATH = "/login";

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname === page);
}

function isPublicPath(pathname: string): boolean {
  return isAuthPage(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * Chỉ chấp nhận đường dẫn nội bộ cho tham số ?next= — chặn chuyển hướng sang trang web khác
 * (open redirect), ví dụ "//evil.com" hay "https://evil.com".
 */
export function safeNextPath(next: string | null | undefined, fallback: string = HOME_PATH): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

/**
 * Quyết định có cần chuyển hướng không.
 * @param pathname Đường dẫn đang truy cập
 * @param search Query string hiện tại (kể cả "?"), giữ lại khi đưa về trang đăng nhập
 * @param isAuthenticated Đã có phiên đăng nhập hợp lệ chưa
 * @returns Đường dẫn cần chuyển tới, hoặc null nếu cho đi tiếp
 */
export function resolveAuthRedirect(pathname: string, search: string, isAuthenticated: boolean): string | null {
  if (isAuthenticated && isAuthPage(pathname)) return HOME_PATH;
  if (!isAuthenticated && !isPublicPath(pathname)) {
    const next = `${pathname}${search}`;
    return next === "/" ? LOGIN_PATH : `${LOGIN_PATH}?next=${encodeURIComponent(next)}`;
  }
  return null;
}
