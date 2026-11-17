/*
 * Validate form onboarding / lập kế hoạch mới — dùng chung ở trình duyệt (kiểm tra từng bước,
 * xem trước) và ở Server Action (kiểm tra lại toàn bộ, không tin dữ liệu client).
 * Form gửi chuỗi → các trường số được chuyển sang number (chấp nhận cả dấu phẩy "82,5").
 */
import { z } from "zod";
import {
  ACTIVITY_LEVELS,
  GOAL_TYPES,
  MACRO_PRESETS,
  SEXES,
  SPEEDS,
  type Speed,
} from "@/constants/nutrition";
import { calcAgeYears, type PlanInput } from "@/lib/calc";
import { isIsoDate, type IsoDate } from "@/lib/utils/date";

export const MIN_AGE_YEARS = 13;
export const MAX_AGE_YEARS = 100;

/** Chuỗi form → number; "" → undefined; "82,5" → 82.5. */
function toNumber(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? undefined : Number(normalized);
}

/** Trường số bắt buộc trong khoảng [min, max]. */
function requiredNumber(label: string, min: number, max: number, unit: string) {
  return z.preprocess(
    toNumber,
    z
      .number({ error: `Nhập ${label}` })
      .min(min, `${label} tối thiểu ${min} ${unit}`)
      .max(max, `${label} tối đa ${max} ${unit}`),
  );
}

/** Trường số không bắt buộc. */
function optionalNumber(label: string, min: number, max: number, unit: string) {
  return z.preprocess(
    toNumber,
    z
      .number({ error: `${label} phải là số` })
      .min(min, `${label} tối thiểu ${min}${unit}`)
      .max(max, `${label} tối đa ${max}${unit}`)
      .optional(),
  );
}

/** Rỗng → undefined, để radio chưa chọn báo lỗi "Chọn ..." thay vì lỗi enum khó hiểu. */
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

/**
 * Tạo schema theo ngày hôm nay (cần để kiểm tra tuổi). Hàm thuần: "hôm nay" truyền vào.
 * @param today Ngày hiện tại "YYYY-MM-DD" theo giờ người dùng
 */
export function makeOnboardingSchema(today: IsoDate) {
  return z
    .object({
      sex: z.preprocess(emptyToUndefined, z.enum(SEXES, { error: "Chọn giới tính" })),
      birthDate: z
        .string({ error: "Nhập ngày sinh" })
        .refine(isIsoDate, "Ngày sinh không hợp lệ")
        .refine((value) => {
          const age = calcAgeYears(value, today);
          return age >= MIN_AGE_YEARS && age <= MAX_AGE_YEARS;
        }, `Tuổi phải từ ${MIN_AGE_YEARS} đến ${MAX_AGE_YEARS}`),
      heightCm: requiredNumber("Chiều cao", 100, 250, "cm"),
      weightKg: requiredNumber("Cân nặng", 20, 400, "kg"),
      bodyFatPercent: optionalNumber("% mỡ", 3, 69, "%"),
      activityLevel: z.preprocess(emptyToUndefined, z.enum(ACTIVITY_LEVELS, { error: "Chọn mức vận động" })),
      goalType: z.preprocess(emptyToUndefined, z.enum(GOAL_TYPES, { error: "Chọn mục tiêu" })),
      targetWeightKg: optionalNumber("Cân mục tiêu", 20, 400, " kg"),
      speed: z.preprocess(emptyToUndefined, z.enum(SPEEDS).optional()),
      macroPreset: z.preprocess(emptyToUndefined, z.enum(MACRO_PRESETS, { error: "Chọn kiểu chia macro" })),
    })
    .superRefine((data, ctx) => {
      if (data.goalType !== "maintain") {
        if (data.targetWeightKg === undefined) {
          ctx.addIssue({ code: "custom", path: ["targetWeightKg"], message: "Nhập cân mục tiêu" });
        } else if (data.goalType === "lose" && data.targetWeightKg >= data.weightKg) {
          ctx.addIssue({ code: "custom", path: ["targetWeightKg"], message: "Giảm cân: cân mục tiêu phải nhỏ hơn cân hiện tại" });
        } else if (data.goalType === "gain" && data.targetWeightKg <= data.weightKg) {
          ctx.addIssue({ code: "custom", path: ["targetWeightKg"], message: "Tăng cân: cân mục tiêu phải lớn hơn cân hiện tại" });
        }
        if (data.speed === undefined) {
          ctx.addIssue({ code: "custom", path: ["speed"], message: "Chọn tốc độ" });
        }
      }
      if (data.macroPreset === "sheet" && data.bodyFatPercent === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["macroPreset"],
          message: "Kiểu “Theo sheet” cần % mỡ — quay lại bước 1 nhập % mỡ, hoặc chọn kiểu khác",
        });
      }
    });
}

export type OnboardingValues = z.infer<ReturnType<typeof makeOnboardingSchema>>;
export type OnboardingField = keyof OnboardingValues;

/** Các trường thuộc từng bước của wizard — để kiểm tra từng bước và nhảy tới bước có lỗi. */
export const STEP_FIELDS: readonly (readonly OnboardingField[])[] = [
  ["sex", "birthDate", "heightCm", "weightKg", "bodyFatPercent"],
  ["activityLevel"],
  ["goalType", "targetWeightKg", "speed"],
  ["macroPreset"],
];

/** Tốc độ mặc định khi mục tiêu là duy trì (không dùng tới nhưng cột DB bắt buộc). */
const MAINTAIN_SPEED: Speed = "medium";

/**
 * Chuyển dữ liệu form đã validate → đầu vào của calcPlan.
 * @param today Ngày bắt đầu kế hoạch
 */
export function toPlanInput(values: OnboardingValues, today: IsoDate): PlanInput {
  const maintain = values.goalType === "maintain";
  return {
    sex: values.sex,
    ageYears: calcAgeYears(values.birthDate, today),
    heightCm: values.heightCm,
    weightKg: values.weightKg,
    bodyFatRatio: values.bodyFatPercent !== undefined ? values.bodyFatPercent / 100 : null,
    activityLevel: values.activityLevel,
    goalType: values.goalType,
    targetWeightKg: maintain || values.targetWeightKg === undefined ? values.weightKg : values.targetWeightKg,
    speed: maintain ? MAINTAIN_SPEED : (values.speed ?? MAINTAIN_SPEED),
    startDate: today,
  };
}
