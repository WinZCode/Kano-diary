/*
 * Đọc dữ liệu kế hoạch / hồ sơ từ Supabase (server). Mỗi hàm tự lấy user qua getCurrentUser()
 * và lọc theo user_id (RLS cũng chặn thêm một lớp).
 * Dữ liệu trả về được parse bằng Zod: DB đổi cột → lỗi rõ ràng ngay, không lọt dữ liệu sai lên UI.
 * (Có thể thay bằng type sinh từ Supabase CLI sau — CLAUDE.md §3.)
 */
import "server-only";
import { z } from "zod";
import {
  ACTIVITY_LEVELS,
  GOAL_TYPES,
  MACRO_PRESETS,
  SEXES,
  SPEEDS,
  type ActivityLevel,
  type GoalType,
  type MacroPreset,
  type Sex,
  type Speed,
} from "@/constants/nutrition";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { PlanWarning } from "@/lib/calc";
import { createClient } from "@/lib/supabase/server";
import type { IsoDate } from "@/lib/utils/date";
import { parsePlanWarnings } from "./warnings";

// numeric của Postgres có thể về dạng chuỗi → coerce
const num = z.coerce.number();
const nullableNum = z.coerce.number().nullable();

const planRowSchema = z.object({
  id: z.string(),
  start_date: z.string(),
  sex: z.enum(SEXES),
  age_years: num,
  height_cm: num,
  start_weight_kg: num,
  body_fat_ratio: nullableNum,
  activity_level: z.enum(ACTIVITY_LEVELS),
  goal_type: z.enum(GOAL_TYPES),
  target_weight_kg: num,
  speed: z.enum(SPEEDS),
  macro_preset: z.enum(MACRO_PRESETS),
  bmr_kcal: num,
  bmr_method: z.enum(["katch-mcardle", "mifflin-st-jeor"]),
  tdee_kcal: num,
  daily_delta_kcal: num,
  target_kcal: num,
  protein_g: num,
  carb_g: num,
  fat_g: num,
  weeks_to_goal: nullableNum,
  estimated_end_date: z.string().nullable(),
  warnings: z.array(z.string()),
});

const PLAN_COLUMNS = Object.keys(planRowSchema.shape).join(",");

/** Kế hoạch đã lưu (camelCase, đúng kiểu). */
export type SavedPlan = {
  id: string;
  startDate: IsoDate;
  sex: Sex;
  ageYears: number;
  heightCm: number;
  startWeightKg: number;
  bodyFatRatio: number | null;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetWeightKg: number;
  speed: Speed;
  macroPreset: MacroPreset;
  bmrKcal: number;
  bmrMethod: "katch-mcardle" | "mifflin-st-jeor";
  tdeeKcal: number;
  dailyDeltaKcal: number;
  targetKcal: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  weeksToGoal: number | null;
  estimatedEndDate: IsoDate | null;
  warnings: PlanWarning[];
};

function toSavedPlan(row: z.infer<typeof planRowSchema>): SavedPlan {
  return {
    id: row.id,
    startDate: row.start_date,
    sex: row.sex,
    ageYears: row.age_years,
    heightCm: row.height_cm,
    startWeightKg: row.start_weight_kg,
    bodyFatRatio: row.body_fat_ratio,
    activityLevel: row.activity_level,
    goalType: row.goal_type,
    targetWeightKg: row.target_weight_kg,
    speed: row.speed,
    macroPreset: row.macro_preset,
    bmrKcal: row.bmr_kcal,
    bmrMethod: row.bmr_method,
    tdeeKcal: row.tdee_kcal,
    dailyDeltaKcal: row.daily_delta_kcal,
    targetKcal: row.target_kcal,
    proteinG: row.protein_g,
    carbG: row.carb_g,
    fatG: row.fat_g,
    weeksToGoal: row.weeks_to_goal,
    estimatedEndDate: row.estimated_end_date,
    warnings: parsePlanWarnings(row.warnings),
  };
}

/** Kế hoạch đang dùng của người dùng hiện tại; null nếu chưa có. */
export async function getActivePlan(): Promise<SavedPlan | null> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select(PLAN_COLUMNS)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(`Không đọc được kế hoạch: ${error.message}`);
  return data ? toSavedPlan(planRowSchema.parse(data)) : null;
}

/** Người dùng đã hoàn thành onboarding chưa (profiles.onboarded_at khác null). */
export async function isOnboarded(): Promise<boolean> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("onboarded_at").eq("id", user.id).maybeSingle();
  if (error) throw new Error(`Không đọc được hồ sơ: ${error.message}`);
  return Boolean(z.object({ onboarded_at: z.string().nullable() }).parse(data ?? { onboarded_at: null }).onboarded_at);
}

/** Giá trị điền sẵn cho form khi lập kế hoạch mới (lấy từ hồ sơ + kế hoạch đang dùng + cân gần nhất). */
export type OnboardingDefaults = Partial<{
  sex: Sex;
  birthDate: string;
  heightCm: number;
  weightKg: number;
  bodyFatPercent: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  targetWeightKg: number;
  speed: Speed;
  macroPreset: MacroPreset;
}>;

const profileSchema = z.object({
  sex: z.enum(SEXES).nullable(),
  birth_date: z.string().nullable(),
  height_cm: nullableNum,
});
const weightSchema = z.object({ weight_kg: num, body_fat_ratio: nullableNum });

export async function getOnboardingDefaults(): Promise<OnboardingDefaults> {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const [profileRes, weightRes, plan] = await Promise.all([
    supabase.from("profiles").select("sex,birth_date,height_cm").eq("id", user.id).maybeSingle(),
    supabase
      .from("weight_logs")
      .select("weight_kg,body_fat_ratio")
      .eq("user_id", user.id)
      .order("log_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getActivePlan(),
  ]);
  if (profileRes.error) throw new Error(`Không đọc được hồ sơ: ${profileRes.error.message}`);
  if (weightRes.error) throw new Error(`Không đọc được cân nặng: ${weightRes.error.message}`);

  const profile = profileRes.data ? profileSchema.parse(profileRes.data) : null;
  const weight = weightRes.data ? weightSchema.parse(weightRes.data) : null;
  const bodyFatRatio = weight?.body_fat_ratio ?? plan?.bodyFatRatio ?? null;

  return {
    sex: profile?.sex ?? undefined,
    birthDate: profile?.birth_date ?? undefined,
    heightCm: profile?.height_cm ?? undefined,
    weightKg: weight?.weight_kg ?? plan?.startWeightKg,
    bodyFatPercent: bodyFatRatio != null ? Math.round(bodyFatRatio * 1000) / 10 : undefined,
    activityLevel: plan?.activityLevel,
    goalType: plan?.goalType,
    targetWeightKg: plan?.targetWeightKg,
    speed: plan?.speed,
    macroPreset: plan?.macroPreset,
  };
}
