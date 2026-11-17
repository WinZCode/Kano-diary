/*
 * Server Action: tạo kế hoạch mới từ form onboarding.
 * Server tự tính lại toàn bộ bằng lib/calc — không dùng số do trình duyệt gửi lên.
 * Lưu bằng RPC start_plan (1 transaction: lưu trữ kế hoạch cũ + thêm mới + cập nhật hồ sơ + ghi cân).
 */
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { DEFAULT_TIMEZONE } from "@/constants/app";
import { getCurrentUser } from "@/lib/auth/current-user";
import { calcPlan } from "@/lib/calc";
import { createClient } from "@/lib/supabase/server";
import { toIsoDate } from "@/lib/utils/date";
import type { FormState } from "@/types/form-state";
import { makeOnboardingSchema, toPlanInput, type OnboardingField } from "./schema";

/** Phiên bản công thức trong lib/calc — tăng khi đổi công thức để phân biệt kế hoạch cũ. */
const FORMULA_VERSION = 1;

/** Làm tròn 1 chữ số thập phân để khớp kiểu numeric(…, 1) trong DB. */
const round1 = (value: number) => Math.round(value * 10) / 10;

export async function startPlan(
  _prev: FormState<OnboardingField>,
  formData: FormData,
): Promise<FormState<OnboardingField>> {
  await getCurrentUser(); // chưa đăng nhập → chuyển /login

  // Giữ lại toàn bộ giá trị chuỗi để điền lại form khi có lỗi.
  const values: Partial<Record<OnboardingField, string>> = {};
  for (const [key, value] of formData) {
    if (typeof value === "string") values[key as OnboardingField] = value; // key lạ sẽ bị schema bỏ qua
  }

  const today = toIsoDate(new Date(), DEFAULT_TIMEZONE);
  const parsed = makeOnboardingSchema(today).safeParse(values);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<OnboardingField, string>> = {};
    for (const [field, messages] of Object.entries(z.flattenError(parsed.error).fieldErrors)) {
      if (Array.isArray(messages) && messages[0]) fieldErrors[field as OnboardingField] = messages[0];
    }
    return { status: "error", message: "Vui lòng kiểm tra lại thông tin.", fieldErrors, values };
  }

  const input = toPlanInput(parsed.data, today);
  const plan = calcPlan(input);
  const option = plan.macroOptions.find((candidate) => candidate.preset === parsed.data.macroPreset);
  if (!option) {
    return { status: "error", fieldErrors: { macroPreset: "Kiểu chia macro không hợp lệ" }, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("start_plan", {
    p_birth_date: parsed.data.birthDate,
    p_plan: {
      start_date: today,
      sex: input.sex,
      age_years: input.ageYears,
      height_cm: input.heightCm,
      start_weight_kg: input.weightKg,
      body_fat_ratio: input.bodyFatRatio,
      activity_level: input.activityLevel,
      goal_type: input.goalType,
      target_weight_kg: input.targetWeightKg,
      speed: input.speed,
      macro_preset: option.preset,
      bmr_kcal: round1(plan.bmr.bmrKcal),
      bmr_method: plan.bmr.method,
      tdee_kcal: round1(plan.tdeeKcal),
      daily_delta_kcal: round1(plan.dailyDeltaKcal),
      target_kcal: round1(plan.targetKcal),
      protein_g: round1(option.macros.proteinG),
      carb_g: round1(option.macros.carbG),
      fat_g: round1(option.macros.fatG),
      weeks_to_goal: plan.weeksToGoal,
      estimated_end_date: plan.estimatedEndDate,
      warnings: plan.warnings,
      formula_version: FORMULA_VERSION,
    },
  });
  if (error) {
    console.error(`[plan:start] code=${error.code} — ${error.message}`);
    return { status: "error", message: "Không lưu được kế hoạch. Vui lòng thử lại.", values };
  }

  redirect("/plan");
}
