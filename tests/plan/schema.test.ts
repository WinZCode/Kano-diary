// Validate form onboarding: chuyển chuỗi → số, quy tắc theo mục tiêu, kiểu macro "Theo sheet".
import { describe, expect, it } from "vitest";
import { makeOnboardingSchema, toPlanInput } from "@/features/plan/schema";

const TODAY = "2026-11-17";
const schema = makeOnboardingSchema(TODAY);

// Dữ liệu form (chuỗi) của người dùng trong sheet
const VALID = {
  sex: "male",
  birthDate: "2001-05-01",
  heightCm: "171",
  weightKg: "83",
  bodyFatPercent: "23",
  activityLevel: "light",
  goalType: "lose",
  targetWeightKg: "70",
  speed: "medium",
  macroPreset: "sheet",
};

/** Dữ liệu cho mục tiêu "duy trì": bỏ cân mục tiêu và tốc độ. */
function maintainInput(): Record<string, string> {
  const input: Record<string, string> = { ...VALID, goalType: "maintain" };
  delete input.targetWeightKg;
  delete input.speed;
  return input;
}

function errorFields(input: Record<string, string>): string[] {
  const result = schema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
}

describe("makeOnboardingSchema", () => {
  it("chấp nhận dữ liệu hợp lệ và đổi chuỗi sang số", () => {
    const result = schema.parse(VALID);
    expect(result.weightKg).toBe(83);
    expect(result.bodyFatPercent).toBe(23);
  });

  it("chấp nhận dấu phẩy thập phân", () => {
    expect(schema.parse({ ...VALID, weightKg: "82,5" }).weightKg).toBe(82.5);
  });

  it("% mỡ để trống → undefined (không bắt buộc)", () => {
    const result = schema.parse({ ...VALID, bodyFatPercent: "", macroPreset: "balanced" });
    expect(result.bodyFatPercent).toBeUndefined();
  });

  it("kiểu Theo sheet bắt buộc có % mỡ", () => {
    expect(errorFields({ ...VALID, bodyFatPercent: "" })).toEqual(["macroPreset"]);
  });

  it("giảm cân: cân mục tiêu phải nhỏ hơn cân hiện tại", () => {
    expect(errorFields({ ...VALID, targetWeightKg: "85" })).toEqual(["targetWeightKg"]);
  });

  it("tăng cân: cân mục tiêu phải lớn hơn cân hiện tại", () => {
    expect(errorFields({ ...VALID, goalType: "gain", targetWeightKg: "80" })).toEqual(["targetWeightKg"]);
  });

  it("duy trì: không cần cân mục tiêu và tốc độ", () => {
    expect(schema.safeParse(maintainInput()).success).toBe(true);
  });

  it("tuổi ngoài 13–100 bị từ chối", () => {
    expect(errorFields({ ...VALID, birthDate: "2020-01-01" })).toEqual(["birthDate"]);
  });

  it("chưa chọn giới tính → báo lỗi ở sex", () => {
    expect(errorFields({ ...VALID, sex: "" })).toContain("sex");
  });

  it("chữ thay vì số → lỗi", () => {
    expect(errorFields({ ...VALID, heightCm: "abc" })).toContain("heightCm");
  });
});

describe("toPlanInput", () => {
  it("đổi % mỡ sang tỉ lệ, tính tuổi theo ngày bắt đầu", () => {
    const input = toPlanInput(schema.parse(VALID), TODAY);
    expect(input.bodyFatRatio).toBeCloseTo(0.23, 10);
    expect(input.ageYears).toBe(25);
    expect(input.startDate).toBe(TODAY);
  });

  it("duy trì: cân mục tiêu = cân hiện tại", () => {
    const input = toPlanInput(schema.parse(maintainInput()), TODAY);
    expect(input.targetWeightKg).toBe(83);
  });
});
