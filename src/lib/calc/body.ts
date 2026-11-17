/*
 * Chỉ số cơ thể: khối nạc (LBM), BMR. Hàm thuần — không I/O, không làm tròn (CLAUDE.md §6).
 */
import { KATCH_MCARDLE, MIFFLIN_ST_JEOR, type Sex } from "@/constants/nutrition";

/**
 * Khối nạc (Lean Body Mass) = cân nặng × (1 − tỉ lệ mỡ).
 * Nguồn: sheet "Thiết lập".
 * @param weightKg Cân nặng (kg)
 * @param bodyFatRatio Tỉ lệ mỡ 0–1 (ví dụ 0.23 = 23%)
 * @returns Khối nạc (kg)
 */
export function calcLeanMassKg(weightKg: number, bodyFatRatio: number): number {
  return weightKg * (1 - bodyFatRatio);
}

/**
 * BMR theo Katch-McArdle — chính xác hơn khi biết % mỡ.
 * Công thức: 370 + 21.6 × LBM. Nguồn: sheet "Thiết lập".
 * @param leanMassKg Khối nạc (kg)
 * @returns BMR (kcal/ngày)
 */
export function calcBmrKatchMcArdle(leanMassKg: number): number {
  return KATCH_MCARDLE.base + KATCH_MCARDLE.perKgLeanMass * leanMassKg;
}

/**
 * BMR theo Mifflin-St Jeor (1990) — dùng khi không có % mỡ.
 * Công thức: 10×kg + 6.25×cm − 5×tuổi + 5 (nam) / −161 (nữ).
 * @param weightKg Cân nặng (kg)
 * @param heightCm Chiều cao (cm)
 * @param ageYears Tuổi (năm)
 * @param sex Giới tính
 * @returns BMR (kcal/ngày)
 */
export function calcBmrMifflinStJeor(weightKg: number, heightCm: number, ageYears: number, sex: Sex): number {
  return (
    MIFFLIN_ST_JEOR.perKg * weightKg +
    MIFFLIN_ST_JEOR.perCm * heightCm -
    MIFFLIN_ST_JEOR.perYear * ageYears +
    MIFFLIN_ST_JEOR.sexOffset[sex]
  );
}

export type BmrInput = {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  sex: Sex;
  /** Tỉ lệ mỡ 0–1; null/undefined nếu không biết. */
  bodyFatRatio?: number | null;
};

export type BmrResult = {
  bmrKcal: number;
  method: "katch-mcardle" | "mifflin-st-jeor";
  /** Khối nạc (kg) — null khi không có % mỡ. */
  leanMassKg: number | null;
};

/**
 * Chọn công thức BMR phù hợp: có % mỡ → Katch-McArdle, không có → Mifflin-St Jeor.
 * Quy tắc chọn theo sheet "Thiết lập".
 */
export function calcBmr(input: BmrInput): BmrResult {
  if (input.bodyFatRatio != null) {
    const leanMassKg = calcLeanMassKg(input.weightKg, input.bodyFatRatio);
    return { bmrKcal: calcBmrKatchMcArdle(leanMassKg), method: "katch-mcardle", leanMassKg };
  }
  return {
    bmrKcal: calcBmrMifflinStJeor(input.weightKg, input.heightCm, input.ageYears, input.sex),
    method: "mifflin-st-jeor",
    leanMassKg: null,
  };
}

/**
 * Tuổi tròn năm tại một ngày.
 * @param birthDate Ngày sinh "YYYY-MM-DD"
 * @param onDate Ngày tính tuổi "YYYY-MM-DD" (truyền vào, không tự lấy hôm nay — hàm thuần)
 */
export function calcAgeYears(birthDate: string, onDate: string): number {
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const [y, m, d] = onDate.split("-").map(Number);
  const hadBirthdayThisYear = m > bm || (m === bm && d >= bd);
  return y - by - (hadBirthdayThisYear ? 0 : 1);
}
