/*
 * Helper ngày cho nhật ký. Ngày nhật ký luôn là chuỗi "YYYY-MM-DD" theo giờ địa phương người dùng
 * (CLAUDE.md §7) — không dùng toISOString() vì nó trả về ngày theo UTC, lệch 7 tiếng ở Việt Nam.
 * Mọi hàm ở đây là hàm thuần: thời điểm "bây giờ" được truyền vào, không tự gọi new Date().
 */

/** Chuỗi ngày dạng "YYYY-MM-DD". */
export type IsoDate = string;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lấy ngày "YYYY-MM-DD" của một thời điểm theo múi giờ cho trước.
 * @param instant Thời điểm cần đổi (thường là new Date() ở nơi gọi)
 * @param timeZone Múi giờ IANA, ví dụ "Asia/Ho_Chi_Minh"
 */
export function toIsoDate(instant: Date, timeZone: string): IsoDate {
  // Locale en-CA định dạng sẵn theo kiểu YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/**
 * Kiểm tra chuỗi có phải ngày hợp lệ dạng "YYYY-MM-DD" không (loại cả ngày không tồn tại như 2026-02-30).
 */
export function isIsoDate(value: string): value is IsoDate {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
  );
}

/** Đổi chuỗi ngày sang Date ở 00:00 UTC — chỉ dùng nội bộ cho phép cộng ngày / định dạng. */
function isoToUtcDate(iso: IsoDate): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Cộng (hoặc trừ nếu âm) số ngày vào một ngày.
 * @param iso Ngày gốc "YYYY-MM-DD"
 * @param days Số ngày cộng thêm
 */
export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = isoToUtcDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10); // an toàn: date đang ở 00:00 UTC
}

/**
 * Hiển thị ngày bằng tiếng Việt, ví dụ "Thứ Ba, 17/11/2026".
 * @param iso Ngày "YYYY-MM-DD"
 */
export function formatDateVi(iso: IsoDate): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "UTC", // ngày đã là ngày địa phương, không quy đổi thêm
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(isoToUtcDate(iso));
}
