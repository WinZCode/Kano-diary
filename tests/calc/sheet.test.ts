/*
 * Kiểm chứng với số liệu sheet "Thiết lập" của người dùng (README §3):
 * Nam, 25 tuổi, 171 cm, 83 kg, 23% mỡ, vận động Nhẹ, thâm hụt 500, mục tiêu 70 kg
 * → LBM 63.9 · BMR 1.750 · TDEE 2.406 · Mục tiêu 1.906 kcal · Protein 141 g · 29 tuần.
 */
import { describe, expect, it } from "vitest";
import {
  calcAgeYears,
  calcBmr,
  calcBmrMifflinStJeor,
  calcBodyFatRatioAtTarget,
  calcProteinG,
  calcTargetKcal,
  calcTdee,
  calcWeeksToGoal,
} from "@/lib/calc";

describe("ca kiểm chứng của sheet Thiết lập", () => {
  const bmr = calcBmr({ weightKg: 83, heightCm: 171, ageYears: 25, sex: "male", bodyFatRatio: 0.23 });
  const tdee = calcTdee(bmr.bmrKcal, "light");

  it("LBM ≈ 63.9 kg", () => {
    expect(bmr.leanMassKg).toBeCloseTo(63.91, 2);
  });

  it("dùng Katch-McArdle khi có % mỡ, BMR ≈ 1.750", () => {
    expect(bmr.method).toBe("katch-mcardle");
    expect(Math.round(bmr.bmrKcal)).toBe(1750);
  });

  it("TDEE ≈ 2.406", () => {
    expect(Math.floor(tdee)).toBe(2406);
  });

  it("calo mục tiêu ≈ 1.906 với thâm hụt 500", () => {
    expect(Math.floor(calcTargetKcal(tdee, 500))).toBe(1906);
  });

  it("protein ≈ 141 g", () => {
    expect(Math.round(calcProteinG(bmr.leanMassKg ?? 0))).toBe(141);
  });

  it("29 tuần để giảm 13 kg (83 → 70)", () => {
    expect(calcWeeksToGoal(83 - 70, 500)).toBe(29);
  });
});

describe("calcBmr không có % mỡ", () => {
  it("dùng Mifflin-St Jeor", () => {
    const result = calcBmr({ weightKg: 83, heightCm: 171, ageYears: 25, sex: "male", bodyFatRatio: null });
    expect(result.method).toBe("mifflin-st-jeor");
    expect(result.leanMassKg).toBeNull();
    // 10×83 + 6.25×171 − 5×25 + 5 = 1778.75
    expect(result.bmrKcal).toBeCloseTo(1778.75, 5);
  });

  it("nữ trừ 161", () => {
    // 10×60 + 6.25×160 − 5×30 − 161 = 1289
    expect(calcBmrMifflinStJeor(60, 160, 30, "female")).toBeCloseTo(1289, 5);
  });
});

describe("ca biên", () => {
  it("không có gì để giảm / thâm hụt ≤ 0 → null", () => {
    expect(calcWeeksToGoal(0, 500)).toBeNull();
    expect(calcWeeksToGoal(-2, 500)).toBeNull();
    expect(calcWeeksToGoal(5, 0)).toBeNull();
  });

  it("% mỡ ở cân mục tiêu", () => {
    // LBM 63.91 / 70 kg → mỡ ≈ 8.7%
    expect(calcBodyFatRatioAtTarget(63.91, 70)).toBeCloseTo(0.087, 3);
    // Cân mục tiêu thấp hơn khối nạc → không khả thi
    expect(calcBodyFatRatioAtTarget(63.91, 60)).toBeNull();
  });
});

describe("calcAgeYears", () => {
  it("tính đúng trước / đúng / sau ngày sinh nhật", () => {
    expect(calcAgeYears("2001-11-18", "2026-11-17")).toBe(24);
    expect(calcAgeYears("2001-11-17", "2026-11-17")).toBe(25);
    expect(calcAgeYears("2001-01-01", "2026-11-17")).toBe(25);
  });
});
