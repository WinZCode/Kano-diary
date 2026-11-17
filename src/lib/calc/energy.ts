/*
 * Năng lượng tiêu hao & mục tiêu: TDEE, calo mục tiêu, protein, số tuần.
 * Chỉ gồm phần ĐÃ CHỐT trong sheet "Thiết lập". Các điểm chưa chốt (README §3: tốc độ → thâm hụt,
 * sàn calo, chia carb/fat, tăng cân) sẽ thêm sau khi người dùng xác nhận.
 */
import {
  ACTIVITY_FACTORS,
  KCAL_PER_KG_FAT,
  PROTEIN_G_PER_KG_LEAN_MASS,
  type ActivityLevel,
} from "@/constants/nutrition";

/**
 * TDEE = BMR × hệ số vận động. Nguồn: sheet "Thiết lập".
 * @param bmrKcal BMR (kcal/ngày)
 * @returns TDEE (kcal/ngày)
 */
export function calcTdee(bmrKcal: number, activityLevel: ActivityLevel): number {
  return bmrKcal * ACTIVITY_FACTORS[activityLevel];
}

/**
 * Calo mục tiêu/ngày = TDEE − thâm hụt. Nguồn: sheet "Thiết lập".
 * @param tdeeKcal TDEE (kcal/ngày)
 * @param dailyDeficitKcal Thâm hụt mỗi ngày (kcal, số dương = ăn ít hơn TDEE)
 */
export function calcTargetKcal(tdeeKcal: number, dailyDeficitKcal: number): number {
  return tdeeKcal - dailyDeficitKcal;
}

/**
 * Protein mục tiêu = 2.2 g × khối nạc. Nguồn: sheet "Thiết lập".
 * @param leanMassKg Khối nạc (kg)
 * @returns Protein (g/ngày)
 */
export function calcProteinG(leanMassKg: number): number {
  return PROTEIN_G_PER_KG_LEAN_MASS * leanMassKg;
}

/**
 * Số tuần dự kiến để giảm hết số cân = ceil(kg cần giảm × 7700 / (thâm hụt × 7)).
 * Nguồn: sheet "Thiết lập".
 * @param kgToLose Số kg cần giảm (> 0)
 * @param dailyDeficitKcal Thâm hụt mỗi ngày (kcal, > 0)
 * @returns Số tuần (làm tròn lên); null nếu không có gì để giảm hoặc thâm hụt ≤ 0
 */
export function calcWeeksToGoal(kgToLose: number, dailyDeficitKcal: number): number | null {
  if (kgToLose <= 0 || dailyDeficitKcal <= 0) return null;
  return Math.ceil((kgToLose * KCAL_PER_KG_FAT) / (dailyDeficitKcal * 7));
}

/**
 * % mỡ ước tính khi đạt cân mục tiêu, giả định giữ nguyên khối nạc: 1 − LBM / cân mục tiêu.
 * Nguồn: sheet "Thiết lập".
 * @returns Tỉ lệ mỡ 0–1; null nếu cân mục tiêu ≤ khối nạc (không khả thi)
 */
export function calcBodyFatRatioAtTarget(leanMassKg: number, targetWeightKg: number): number | null {
  if (targetWeightKg <= leanMassKg) return null;
  return 1 - leanMassKg / targetWeightKg;
}
