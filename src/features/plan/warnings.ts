/*
 * Nội dung cảnh báo của kế hoạch (tiếng Việt) + mức độ hiển thị.
 */
import type { PlanWarning } from "@/lib/calc";

export const PLAN_WARNINGS: Readonly<Record<PlanWarning, { tone: "warn" | "alert"; text: string }>> = {
  "floor-applied": {
    tone: "warn",
    text: "Calo đã được nâng lên mức tối thiểu an toàn (1.500 kcal nam / 1.200 kcal nữ). Mục tiêu sẽ đạt chậm hơn tốc độ đã chọn.",
  },
  "tdee-below-floor": {
    tone: "alert",
    text: "Mức tiêu hao của bạn thấp hơn mức ăn an toàn tối thiểu, nên không thể giảm cân chỉ bằng ăn ít hơn. Hãy tăng vận động.",
  },
  "below-bmr": {
    tone: "warn",
    text: "Calo mục tiêu thấp hơn BMR (năng lượng cơ thể cần khi nghỉ). Có thể gây mệt mỏi, mất cơ — cân nhắc tốc độ chậm hơn.",
  },
  "target-direction-mismatch": {
    tone: "alert",
    text: "Cân mục tiêu không khớp với mục tiêu đã chọn.",
  },
  "target-below-lean-mass": {
    tone: "alert",
    text: "Cân mục tiêu thấp hơn khối nạc của bạn — không khả thi. Hãy đặt cân mục tiêu cao hơn.",
  },
};

const KNOWN = new Set<string>(Object.keys(PLAN_WARNINGS));

/** Lọc mảng chuỗi (từ DB) chỉ giữ cảnh báo hợp lệ. */
export function parsePlanWarnings(values: readonly string[]): PlanWarning[] {
  return values.filter((value): value is PlanWarning => KNOWN.has(value));
}
