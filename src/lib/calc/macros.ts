/*
 * Chia calo mục tiêu thành Protein / Carb / Fat (gram) theo các kiểu như calculator.net,
 * cộng thêm kiểu "Theo sheet" của người dùng. Hàm thuần, không làm tròn.
 */
import {
  KCAL_PER_G,
  MACRO_PRESET_LABELS,
  MACRO_PRESET_RATIOS,
  PROTEIN_G_PER_KG_LEAN_MASS,
  SATURATED_FAT_MAX_RATIO,
  SHEET_FAT_RATIO,
  SUGAR_MAX_RATIO,
  type MacroPreset,
  type MacroRatios,
  type RatioMacroPreset,
} from "@/constants/nutrition";

export type Macros = { proteinG: number; carbG: number; fatG: number };

export type MacroOption = {
  preset: MacroPreset;
  label: string;
  macros: Macros;
  /** Tỉ lệ % calo thực tế của từng macro (0–1) — để hiển thị. */
  ratios: MacroRatios;
};

/**
 * Chia calo theo tỉ lệ % cố định.
 * @param targetKcal Calo mục tiêu/ngày
 * @param ratios Tỉ lệ calo (tổng = 1)
 */
export function calcMacrosByRatio(targetKcal: number, ratios: MacroRatios): Macros {
  return {
    proteinG: (targetKcal * ratios.protein) / KCAL_PER_G.protein,
    carbG: (targetKcal * ratios.carb) / KCAL_PER_G.carb,
    fatG: (targetKcal * ratios.fat) / KCAL_PER_G.fat,
  };
}

/**
 * Kiểu "Theo sheet": protein = 2.2 g × khối nạc, fat = 25% calo, carb = phần còn lại (không âm).
 * @param targetKcal Calo mục tiêu/ngày
 * @param leanMassKg Khối nạc (kg)
 */
export function calcMacrosSheet(targetKcal: number, leanMassKg: number): Macros {
  const proteinG = PROTEIN_G_PER_KG_LEAN_MASS * leanMassKg;
  const fatG = (targetKcal * SHEET_FAT_RATIO) / KCAL_PER_G.fat;
  const remainingKcal = targetKcal - proteinG * KCAL_PER_G.protein - fatG * KCAL_PER_G.fat;
  return { proteinG, carbG: Math.max(0, remainingKcal) / KCAL_PER_G.carb, fatG };
}

/** Tỉ lệ % calo thực tế của một bộ macro. */
function ratiosOf(macros: Macros): MacroRatios {
  const protein = macros.proteinG * KCAL_PER_G.protein;
  const carb = macros.carbG * KCAL_PER_G.carb;
  const fat = macros.fatG * KCAL_PER_G.fat;
  const total = protein + carb + fat;
  return total > 0
    ? { protein: protein / total, carb: carb / total, fat: fat / total }
    : { protein: 0, carb: 0, fat: 0 };
}

const RATIO_PRESETS = Object.keys(MACRO_PRESET_RATIOS) as RatioMacroPreset[]; // key lấy từ chính object

/**
 * Tất cả lựa chọn chia macro cho một mức calo — giống các tab của calculator.net.
 * Kiểu "Theo sheet" chỉ có khi biết khối nạc (đã nhập % mỡ).
 */
export function calcMacroOptions(targetKcal: number, leanMassKg: number | null): MacroOption[] {
  const options: MacroOption[] = [];
  if (leanMassKg != null) {
    const macros = calcMacrosSheet(targetKcal, leanMassKg);
    options.push({ preset: "sheet", label: MACRO_PRESET_LABELS.sheet, macros, ratios: ratiosOf(macros) });
  }
  for (const preset of RATIO_PRESETS) {
    const ratios = MACRO_PRESET_RATIOS[preset];
    options.push({ preset, label: MACRO_PRESET_LABELS[preset], macros: calcMacrosByRatio(targetKcal, ratios), ratios });
  }
  return options;
}

/**
 * Giới hạn trên cho đường và chất béo bão hòa (mỗi loại < 10% calo).
 * @returns gram/ngày
 */
export function calcMacroLimits(targetKcal: number): { sugarMaxG: number; saturatedFatMaxG: number } {
  return {
    sugarMaxG: (targetKcal * SUGAR_MAX_RATIO) / KCAL_PER_G.carb,
    saturatedFatMaxG: (targetKcal * SATURATED_FAT_MAX_RATIO) / KCAL_PER_G.fat,
  };
}
