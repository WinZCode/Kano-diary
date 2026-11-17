/*
 * Tổng hợp kế hoạch từ dữ liệu onboarding: BMR → TDEE → calo mục tiêu (có sàn an toàn)
 * → số tuần → ngày dự kiến đạt → các lựa chọn macro.
 * Quy tắc đã chốt với người dùng (2026-11-17):
 *  - Tốc độ: chênh 250 / 500 / 750 kcal/ngày (giảm = thâm hụt, tăng = thặng dư).
 *  - Sàn calo khi giảm: 1.500 nam / 1.200 nữ; thấp hơn BMR chỉ cảnh báo.
 *  - Có 3 mục tiêu: giảm / duy trì / tăng.
 */
import {
  CALORIE_FLOOR_KCAL,
  DAILY_ENERGY_DELTA_KCAL,
  type ActivityLevel,
  type GoalType,
  type Sex,
  type Speed,
} from "@/constants/nutrition";
import { addDays, type IsoDate } from "@/lib/utils/date";
import { calcBmr, type BmrResult } from "./body";
import { calcBodyFatRatioAtTarget, calcTdee, calcWeeksToGoal } from "./energy";
import { calcMacroLimits, calcMacroOptions, type MacroOption } from "./macros";

export type PlanInput = {
  sex: Sex;
  ageYears: number;
  heightCm: number;
  weightKg: number;
  /** Tỉ lệ mỡ 0–1, null nếu không biết. */
  bodyFatRatio: number | null;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  /** Cân mục tiêu (kg). Với "maintain" bỏ qua và dùng cân hiện tại. */
  targetWeightKg: number;
  speed: Speed;
  /** Ngày bắt đầu kế hoạch — để tính ngày dự kiến đạt (hàm thuần: truyền vào). */
  startDate: IsoDate;
};

export type PlanWarning =
  /** Sàn calo đã được áp: calo mục tiêu bị nâng lên, mục tiêu sẽ đạt chậm hơn. */
  | "floor-applied"
  /** TDEE thấp hơn sàn calo → không thể giảm cân an toàn chỉ bằng ăn uống, nên tăng vận động. */
  | "tdee-below-floor"
  /** Calo mục tiêu thấp hơn BMR — cho phép nhưng cần lưu ý. */
  | "below-bmr"
  /** Cân mục tiêu ngược hướng với mục tiêu (ví dụ chọn "giảm" nhưng cân mục tiêu cao hơn). */
  | "target-direction-mismatch"
  /** Cân mục tiêu thấp hơn khối nạc — không khả thi (phải mất cơ/xương). */
  | "target-below-lean-mass";

export type PlanResult = {
  bmr: BmrResult;
  tdeeKcal: number;
  /** Chênh lệch mong muốn theo tốc độ (âm = thâm hụt, dương = thặng dư). */
  requestedDeltaKcal: number;
  /** Chênh lệch thực tế sau khi áp sàn calo. */
  dailyDeltaKcal: number;
  targetKcal: number;
  /** Số tuần dự kiến; null khi duy trì hoặc không thể tiến tới mục tiêu. */
  weeksToGoal: number | null;
  /** Ngày dự kiến đạt mục tiêu; null cùng điều kiện với weeksToGoal. */
  estimatedEndDate: IsoDate | null;
  /** % mỡ ước tính ở cân mục tiêu (giữ nguyên khối nạc); null nếu không có % mỡ. */
  bodyFatRatioAtTarget: number | null;
  macroOptions: MacroOption[];
  limits: { sugarMaxG: number; saturatedFatMaxG: number };
  warnings: PlanWarning[];
};

/** Hướng thay đổi cân nặng của từng mục tiêu: -1 giảm, 0 giữ, +1 tăng. */
const GOAL_DIRECTION: Readonly<Record<GoalType, -1 | 0 | 1>> = { lose: -1, maintain: 0, gain: 1 };

/**
 * Tính toàn bộ kế hoạch. Không làm tròn — làm tròn ở bước hiển thị.
 */
export function calcPlan(input: PlanInput): PlanResult {
  const warnings: PlanWarning[] = [];
  const bmr = calcBmr(input);
  const tdeeKcal = calcTdee(bmr.bmrKcal, input.activityLevel);

  const direction = GOAL_DIRECTION[input.goalType];
  const requestedDeltaKcal = direction * DAILY_ENERGY_DELTA_KCAL[input.speed];
  let targetKcal = tdeeKcal + requestedDeltaKcal;

  // Sàn calo chỉ áp cho giảm cân.
  if (input.goalType === "lose") {
    const floor = CALORIE_FLOOR_KCAL[input.sex];
    if (tdeeKcal <= floor) {
      targetKcal = tdeeKcal; // không thể thâm hụt an toàn → ăn bằng TDEE
      warnings.push("tdee-below-floor");
    } else if (targetKcal < floor) {
      targetKcal = floor;
      warnings.push("floor-applied");
    }
    if (targetKcal < bmr.bmrKcal) warnings.push("below-bmr");
  }
  const dailyDeltaKcal = targetKcal - tdeeKcal;

  // Số tuần: tính theo chênh lệch THỰC TẾ (sau khi áp sàn), cùng công thức của sheet.
  const targetWeightKg = input.goalType === "maintain" ? input.weightKg : input.targetWeightKg;
  const kgToChange = (targetWeightKg - input.weightKg) * direction; // > 0 nếu đúng hướng
  let weeksToGoal: number | null = null;
  if (direction !== 0) {
    if (kgToChange <= 0) warnings.push("target-direction-mismatch");
    else weeksToGoal = calcWeeksToGoal(kgToChange, Math.abs(dailyDeltaKcal));
  }

  const bodyFatRatioAtTarget =
    bmr.leanMassKg != null ? calcBodyFatRatioAtTarget(bmr.leanMassKg, targetWeightKg) : null;
  if (bmr.leanMassKg != null && bodyFatRatioAtTarget === null) warnings.push("target-below-lean-mass");

  return {
    bmr,
    tdeeKcal,
    requestedDeltaKcal,
    dailyDeltaKcal,
    targetKcal,
    weeksToGoal,
    estimatedEndDate: weeksToGoal != null ? addDays(input.startDate, weeksToGoal * 7) : null,
    bodyFatRatioAtTarget,
    macroOptions: calcMacroOptions(targetKcal, bmr.leanMassKg),
    limits: calcMacroLimits(targetKcal),
    warnings,
  };
}
