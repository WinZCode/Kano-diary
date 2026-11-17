/*
 * Định dạng số để HIỂN THỊ (kiểu Việt Nam: 1.907 · 82,4). Mọi phép làm tròn hiển thị nằm ở đây,
 * phép tính trong lib/calc giữ nguyên số thập phân (CLAUDE.md §6).
 */

const integerFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

/**
 * Số nguyên gần nhất, có dấu chấm ngăn nghìn. Dùng cho kcal, gram.
 * @example formatInteger(1906.88) // "1.907"
 */
export function formatInteger(value: number): string {
  return integerFormat.format(Math.round(value) + 0); // "+ 0" đổi -0 thành 0, tránh hiện "-0"
}

/**
 * Số thập phân dấu phẩy, bỏ số 0 thừa. Dùng cho kg, cm, giờ.
 * @example formatDecimal(82.40) // "82,4"
 */
export function formatDecimal(value: number, maxFractionDigits = 1): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: maxFractionDigits }).format(value + 0);
}

/**
 * Tỉ lệ 0–1 → phần trăm.
 * @example formatPercent(0.2345) // "23,5%"
 */
export function formatPercent(ratio: number, maxFractionDigits = 1): string {
  return `${formatDecimal(ratio * 100, maxFractionDigits)}%`;
}

/** Số có dấu +/− phía trước (chênh lệch calo). @example formatSignedInteger(-500) // "−500" */
export function formatSignedInteger(value: number): string {
  const rounded = Math.round(value) + 0;
  if (rounded === 0) return "0";
  return `${rounded > 0 ? "+" : "−"}${formatInteger(Math.abs(rounded))}`;
}
