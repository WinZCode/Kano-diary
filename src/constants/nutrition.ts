/*
 * Hằng số dinh dưỡng dùng trong src/lib/calc. Mỗi hằng số ghi nguồn.
 * Nguồn chính: sheet "Thiết lập" của người dùng (README §3).
 */

/** Năng lượng của 1 kg mỡ cơ thể (kcal). Nguồn: sheet "Thiết lập" (quy ước phổ biến ~7.700 kcal/kg). */
export const KCAL_PER_KG_FAT = 7700;

/** Mức vận động — key lưu trong DB / form. */
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";

/** Hệ số nhân BMR → TDEE theo mức vận động. Nguồn: sheet "Thiết lập". */
export const ACTIVITY_FACTORS: Readonly<Record<ActivityLevel, number>> = {
  sedentary: 1.2, // Ít vận động
  light: 1.375, // Nhẹ: 1–3 buổi/tuần
  moderate: 1.55, // Vừa: 3–5 buổi/tuần
  active: 1.725, // Nhiều: 6–7 buổi/tuần
};

/** Nhãn tiếng Việt cho mức vận động (dùng ở UI). */
export const ACTIVITY_LABELS: Readonly<Record<ActivityLevel, string>> = {
  sedentary: "Ít vận động",
  light: "Nhẹ (1–3 buổi/tuần)",
  moderate: "Vừa (3–5 buổi/tuần)",
  active: "Nhiều (6–7 buổi/tuần)",
};

export type Sex = "male" | "female";

/** Katch-McArdle: BMR = 370 + 21.6 × LBM(kg). Nguồn: sheet "Thiết lập". */
export const KATCH_MCARDLE = { base: 370, perKgLeanMass: 21.6 } as const;

/**
 * Mifflin-St Jeor (1990): BMR = 10×kg + 6.25×cm − 5×tuổi + hằng số giới tính.
 * Dùng khi người dùng không có % mỡ.
 */
export const MIFFLIN_ST_JEOR = {
  perKg: 10,
  perCm: 6.25,
  perYear: 5,
  sexOffset: { male: 5, female: -161 } satisfies Record<Sex, number>,
} as const;

/** Protein mục tiêu: 2.2 g cho mỗi kg khối nạc. Nguồn: sheet "Thiết lập". */
export const PROTEIN_G_PER_KG_LEAN_MASS = 2.2;

/** Năng lượng mỗi gram macro (Atwater) — khớp nhãn dinh dưỡng trên thực phẩm. */
export const KCAL_PER_G = { protein: 4, carb: 4, fat: 9 } as const;

// ---------------------------------------------------------------------------
// Mục tiêu & tốc độ — người dùng chốt ngày 2026-11-17
// ---------------------------------------------------------------------------

export type GoalType = "lose" | "maintain" | "gain";
export type Speed = "slow" | "medium" | "fast";

/**
 * Mức chênh calo mỗi ngày theo tốc độ (kcal). Giảm cân = thâm hụt, tăng cân = thặng dư cùng mức.
 * Người dùng chọn kcal cố định (giống sheet: 500 = Vừa). 500 kcal/ngày ≈ 0.45 kg/tuần.
 */
export const DAILY_ENERGY_DELTA_KCAL: Readonly<Record<Speed, number>> = {
  slow: 250,
  medium: 500,
  fast: 750,
};

/**
 * Sàn calo an toàn khi giảm cân — calo mục tiêu không bao giờ thấp hơn mức này.
 * Người dùng chọn: 1.500 nam / 1.200 nữ; dưới BMR chỉ cảnh báo.
 */
export const CALORIE_FLOOR_KCAL: Readonly<Record<Sex, number>> = { male: 1500, female: 1200 };

// ---------------------------------------------------------------------------
// Kiểu chia macro — tham khảo calculator.net/macro-calculator.html (người dùng yêu cầu)
// Tỉ lệ % calo suy ra từ kết quả của trang; quy đổi gram dùng 4/4/9 thay vì hệ số riêng của trang.
// ---------------------------------------------------------------------------

export type MacroRatios = { protein: number; carb: number; fat: number };

export type RatioMacroPreset = "balanced" | "low-fat" | "low-carb" | "high-protein";
/** "sheet" = protein 2.2 g × khối nạc (sheet Thiết lập), không phải tỉ lệ cố định. */
export type MacroPreset = "sheet" | RatioMacroPreset;

export const MACRO_PRESET_RATIOS: Readonly<Record<RatioMacroPreset, MacroRatios>> = {
  balanced: { protein: 0.25, carb: 0.5, fat: 0.25 },
  "low-fat": { protein: 0.275, carb: 0.525, fat: 0.2 },
  "low-carb": { protein: 0.3, carb: 0.4, fat: 0.3 },
  "high-protein": { protein: 0.35, carb: 0.425, fat: 0.225 },
};

export const MACRO_PRESET_LABELS: Readonly<Record<MacroPreset, string>> = {
  sheet: "Theo sheet",
  balanced: "Cân bằng",
  "low-fat": "Ít béo",
  "low-carb": "Ít carb",
  "high-protein": "Nhiều đạm",
};

/** Kiểu "Theo sheet": fat chiếm 25% calo, carb là phần còn lại. */
export const SHEET_FAT_RATIO = 0.25;

/** Giới hạn đường và chất béo bão hòa: mỗi loại < 10% calo (Dietary Guidelines for Americans). */
export const SUGAR_MAX_RATIO = 0.1;
export const SATURATED_FAT_MAX_RATIO = 0.1;
