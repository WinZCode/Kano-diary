// calcPlan: tốc độ, sàn calo, 3 mục tiêu và các cảnh báo.
import { describe, expect, it } from "vitest";
import { calcPlan, type PlanInput } from "@/lib/calc";

// Người dùng trong sheet "Thiết lập"
const SHEET_USER: PlanInput = {
  sex: "male",
  ageYears: 25,
  heightCm: 171,
  weightKg: 83,
  bodyFatRatio: 0.23,
  activityLevel: "light",
  goalType: "lose",
  targetWeightKg: 70,
  speed: "medium",
  startDate: "2026-11-17",
};

describe("giảm cân — ca của sheet", () => {
  const plan = calcPlan(SHEET_USER);

  it("tốc độ Vừa = thâm hụt 500, calo ≈ 1.906,9", () => {
    expect(plan.requestedDeltaKcal).toBe(-500);
    expect(plan.dailyDeltaKcal).toBeCloseTo(-500, 10);
    expect(plan.targetKcal).toBeCloseTo(1906.88, 1);
  });

  it("29 tuần, đạt khoảng 2027-06-08", () => {
    expect(plan.weeksToGoal).toBe(29);
    expect(plan.estimatedEndDate).toBe("2027-06-08");
  });

  it("không có cảnh báo", () => {
    expect(plan.warnings).toEqual([]);
  });

  it("có 5 lựa chọn macro, kiểu Theo sheet đầu tiên", () => {
    expect(plan.macroOptions).toHaveLength(5);
    expect(plan.macroOptions[0]?.preset).toBe("sheet");
  });
});

describe("tốc độ", () => {
  it("Chậm 250 → mất nhiều tuần hơn", () => {
    expect(calcPlan({ ...SHEET_USER, speed: "slow" }).weeksToGoal).toBe(58); // ceil(13×7700/1750)
  });

  it("Nhanh 750 → calo 1.656,9, dưới BMR 1.750 → cảnh báo nhưng không chặn", () => {
    const plan = calcPlan({ ...SHEET_USER, speed: "fast" });
    expect(plan.targetKcal).toBeCloseTo(1656.88, 1);
    expect(plan.warnings).toEqual(["below-bmr"]);
    expect(plan.weeksToGoal).toBe(20); // ceil(13×7700/5250)
  });
});

describe("sàn calo", () => {
  // Nữ 50 kg, 155 cm, 30 tuổi, ít vận động, không có % mỡ → BMR 1.157,75 · TDEE 1.389,3
  const SMALL_FEMALE: PlanInput = {
    ...SHEET_USER,
    sex: "female",
    weightKg: 50,
    heightCm: 155,
    ageYears: 30,
    bodyFatRatio: null,
    activityLevel: "sedentary",
    targetWeightKg: 47,
    speed: "fast",
  };

  it("nâng calo lên 1.200 và tính tuần theo thâm hụt thực tế", () => {
    const plan = calcPlan(SMALL_FEMALE);
    expect(plan.targetKcal).toBe(1200);
    expect(plan.dailyDeltaKcal).toBeCloseTo(-189.3, 1);
    expect(plan.warnings).toContain("floor-applied");
    expect(plan.weeksToGoal).toBe(18); // ceil(3×7700/(189.3×7))
  });

  it("TDEE dưới sàn → ăn bằng TDEE, không có ngày dự kiến", () => {
    // Nữ 40 kg, 145 cm, 60 tuổi → BMR 845,25 · TDEE 1.014,3 < 1.200
    const plan = calcPlan({ ...SMALL_FEMALE, weightKg: 40, heightCm: 145, ageYears: 60, targetWeightKg: 38 });
    expect(plan.targetKcal).toBeCloseTo(plan.tdeeKcal, 10);
    expect(plan.warnings).toContain("tdee-below-floor");
    expect(plan.weeksToGoal).toBeNull();
    expect(plan.estimatedEndDate).toBeNull();
  });
});

describe("duy trì & tăng cân", () => {
  it("duy trì: calo = TDEE, không có ngày đích", () => {
    const plan = calcPlan({ ...SHEET_USER, goalType: "maintain" });
    expect(plan.targetKcal).toBeCloseTo(plan.tdeeKcal, 10);
    expect(plan.weeksToGoal).toBeNull();
    expect(plan.warnings).toEqual([]);
  });

  it("tăng cân: thặng dư 500, không áp sàn", () => {
    const plan = calcPlan({ ...SHEET_USER, goalType: "gain", targetWeightKg: 86 });
    expect(plan.dailyDeltaKcal).toBeCloseTo(500, 10);
    expect(plan.weeksToGoal).toBe(7); // ceil(3×7700/3500)
  });
});

describe("cảnh báo mục tiêu", () => {
  it("chọn giảm nhưng cân mục tiêu cao hơn", () => {
    const plan = calcPlan({ ...SHEET_USER, targetWeightKg: 90 });
    expect(plan.warnings).toContain("target-direction-mismatch");
    expect(plan.weeksToGoal).toBeNull();
  });

  it("cân mục tiêu thấp hơn khối nạc", () => {
    expect(calcPlan({ ...SHEET_USER, targetWeightKg: 60 }).warnings).toContain("target-below-lean-mass");
  });
});
