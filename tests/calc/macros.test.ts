// Chia macro: các kiểu theo tỉ lệ (calculator.net) + kiểu "Theo sheet".
import { describe, expect, it } from "vitest";
import { MACRO_PRESET_RATIOS } from "@/constants/nutrition";
import { calcMacroLimits, calcMacroOptions, calcMacrosByRatio, calcMacrosSheet } from "@/lib/calc";

describe("MACRO_PRESET_RATIOS", () => {
  it.each(Object.entries(MACRO_PRESET_RATIOS))("%s có tổng tỉ lệ = 100%%", (_preset, ratios) => {
    expect(ratios.protein + ratios.carb + ratios.fat).toBeCloseTo(1, 10);
  });
});

describe("calcMacrosByRatio", () => {
  it("Cân bằng 2.000 kcal → P 125 g · C 250 g · F 55.6 g", () => {
    const macros = calcMacrosByRatio(2000, MACRO_PRESET_RATIOS.balanced);
    expect(macros.proteinG).toBeCloseTo(125, 5);
    expect(macros.carbG).toBeCloseTo(250, 5);
    expect(macros.fatG).toBeCloseTo(55.56, 2);
  });
});

describe("calcMacrosSheet", () => {
  it("ca của sheet: 1.906,9 kcal, khối nạc 63,91 kg", () => {
    const macros = calcMacrosSheet(1906.9, 63.91);
    expect(macros.proteinG).toBeCloseTo(140.6, 1); // 2.2 × 63.91
    expect(macros.fatG).toBeCloseTo(52.97, 2); // 25% calo / 9
    // carb = (1906.9 − 140.6×4 − 52.97×9) / 4 = (1906.9 − 562.4 − 476.7) / 4
    expect(macros.carbG).toBeCloseTo(216.9, 1);
  });

  it("carb không âm khi protein chiếm quá nhiều calo", () => {
    expect(calcMacrosSheet(1200, 120).carbG).toBe(0);
  });
});

describe("calcMacroOptions", () => {
  it("có kiểu Theo sheet đứng đầu khi biết khối nạc", () => {
    const presets = calcMacroOptions(2000, 60).map((option) => option.preset);
    expect(presets).toEqual(["sheet", "balanced", "low-fat", "low-carb", "high-protein"]);
  });

  it("không có kiểu Theo sheet khi thiếu % mỡ", () => {
    expect(calcMacroOptions(2000, null).map((option) => option.preset)).not.toContain("sheet");
  });

  it("tổng calo từ macro khớp calo mục tiêu (kiểu theo tỉ lệ)", () => {
    for (const option of calcMacroOptions(2000, null)) {
      const { proteinG, carbG, fatG } = option.macros;
      expect(proteinG * 4 + carbG * 4 + fatG * 9).toBeCloseTo(2000, 5);
    }
  });
});

describe("calcMacroLimits", () => {
  it("đường và chất béo bão hòa < 10% calo", () => {
    const limits = calcMacroLimits(2000);
    expect(limits.sugarMaxG).toBeCloseTo(50, 5);
    expect(limits.saturatedFatMaxG).toBeCloseTo(22.22, 2);
  });
});
