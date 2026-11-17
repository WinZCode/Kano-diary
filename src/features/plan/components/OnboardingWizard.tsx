/*
 * Wizard 4 bước: Cơ thể → Vận động → Mục tiêu → Kế hoạch (xem trước + chọn macro) → lưu.
 *
 * Cách hoạt động:
 * - MỘT <form> chứa cả 4 bước; bước không hiển thị dùng thuộc tính `hidden` nên dữ liệu vẫn được gửi.
 * - Ô nhập không kiểm soát (defaultValue); mỗi lần thay đổi, đọc lại FormData vào state `raw`
 *   để kiểm tra từng bước và tính bản xem trước bằng lib/calc (chạy ngay trên trình duyệt).
 * - Bấm "Bắt đầu" → Server Action startPlan kiểm tra & tính lại toàn bộ trên server.
 */
"use client";

import { useActionState, useRef, useState, type FormEvent } from "react";
import {
  ACTIVITY_LABELS,
  ACTIVITY_LEVELS,
  DAILY_ENERGY_DELTA_KCAL,
  GOAL_LABELS,
  GOAL_TYPES,
  KCAL_PER_KG_FAT,
  MACRO_PRESET_LABELS,
  SEX_LABELS,
  SEXES,
  SPEED_LABELS,
  SPEEDS,
  type MacroPreset,
} from "@/constants/nutrition";
import { Button, Card, CardTitle, Field, fieldDescribedBy, Input, SegmentedControl } from "@/components/ui";
import { calcPlan } from "@/lib/calc";
import { cn } from "@/lib/utils/cn";
import type { IsoDate } from "@/lib/utils/date";
import { formatDecimal } from "@/lib/utils/format";
import { IDLE_FORM_STATE, type FormState } from "@/types/form-state";
import { startPlan } from "../actions";
import type { OnboardingDefaults } from "../queries";
import { makeOnboardingSchema, STEP_FIELDS, toPlanInput, type OnboardingField } from "../schema";
import { MacroPresetPicker } from "./MacroPresetPicker";
import { PlanSummary } from "./PlanSummary";

const STEP_TITLES = ["Cơ thể", "Vận động", "Mục tiêu", "Kế hoạch"] as const;
const LAST_STEP = STEP_TITLES.length - 1;

type Raw = Partial<Record<OnboardingField, string>>;
type Errors = Partial<Record<OnboardingField, string>>;

/** Giá trị điền sẵn (số) → chuỗi như trong form. */
function defaultsToRaw(defaults: OnboardingDefaults): Raw {
  const raw: Raw = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (value !== undefined && value !== null) raw[key as OnboardingField] = String(value); // key lấy từ OnboardingDefaults
  }
  return raw;
}

function readForm(form: HTMLFormElement): Raw {
  const raw: Raw = {};
  for (const [key, value] of new FormData(form)) {
    if (typeof value === "string") raw[key as OnboardingField] = value; // key lạ bị schema bỏ qua
  }
  return raw;
}

type OnboardingWizardProps = {
  defaults: OnboardingDefaults;
  /** "Hôm nay" theo server — truyền xuống để client và server tính tuổi giống nhau. */
  today: IsoDate;
  /** true khi người dùng đã có kế hoạch và đang lập kế hoạch mới. */
  isReplan: boolean;
};

export function OnboardingWizard({ defaults, today, isReplan }: OnboardingWizardProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState(0);
  const [raw, setRaw] = useState<Raw>(() => defaultsToRaw(defaults));
  const [clientErrors, setClientErrors] = useState<Errors>({});
  const [state, action, pending] = useActionState<FormState<OnboardingField>, FormData>(startPlan, IDLE_FORM_STATE);

  // Khi server trả lỗi mới: hiện lỗi và nhảy tới bước đầu tiên có lỗi.
  // (Cập nhật state trong lúc render theo state trước đó — mẫu React khuyến nghị thay cho useEffect.)
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error" && state.fieldErrors) {
      const errorFields = Object.keys(state.fieldErrors);
      const firstStep = STEP_FIELDS.findIndex((fields) => fields.some((field) => errorFields.includes(field)));
      if (firstStep >= 0) setStep(firstStep);
      setClientErrors(state.fieldErrors);
    }
  }

  const schema = makeOnboardingSchema(today);

  // Xem trước: tạm điền kiểu macro hợp lệ để các bước trước được kiểm tra đầy đủ
  // (lỗi riêng của kiểu macro không làm mất bản xem trước).
  const previewParse = schema.safeParse({ ...raw, macroPreset: "balanced" });
  const preview = previewParse.success ? calcPlan(toPlanInput(previewParse.data, today)) : null;
  const selectedPreset = (raw.macroPreset as MacroPreset | undefined) ?? preview?.macroOptions[0]?.preset;
  const selectedOption = preview?.macroOptions.find((option) => option.preset === selectedPreset);

  const goalType = raw.goalType ?? "lose";
  const hasBodyFat = Boolean(raw.bodyFatPercent?.trim());

  /** Lỗi của các trường thuộc một bước (chạy toàn bộ schema, lọc theo trường). */
  function validateStep(stepIndex: number, values: Raw): Errors {
    const candidate = stepIndex < LAST_STEP ? { ...values, macroPreset: values.macroPreset || "balanced" } : values;
    const result = schema.safeParse(candidate);
    if (result.success) return {};
    const errors: Errors = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as OnboardingField; // path[0] luôn là tên trường của object
      if (STEP_FIELDS[stepIndex]?.includes(field) && !errors[field]) errors[field] = issue.message;
    }
    return errors;
  }

  function goNext() {
    const values = formRef.current ? readForm(formRef.current) : raw;
    const errors = validateStep(step, values);
    setClientErrors(errors);
    if (Object.keys(errors).length === 0) setStep((current) => Math.min(current + 1, LAST_STEP));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Enter ở các bước đầu = "Tiếp", không gửi form.
    if (step < LAST_STEP) {
      event.preventDefault();
      goNext();
      return;
    }
    const errors = validateStep(LAST_STEP, readForm(event.currentTarget));
    if (Object.keys(errors).length > 0) {
      event.preventDefault();
      setClientErrors(errors);
    }
  }

  const errors: Errors = clientErrors;
  const describedBy = (field: OnboardingField, hint = false) =>
    fieldDescribedBy(field, { hint, error: Boolean(errors[field]) });

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={handleSubmit}
      onChange={(event) => setRaw(readForm(event.currentTarget))}
      className="grid gap-6"
      noValidate
    >
      {/* Thanh bước */}
      <ol className="grid grid-cols-4 gap-1.5" aria-label="Các bước">
        {STEP_TITLES.map((title, index) => (
          <li
            key={title}
            aria-current={index === step ? "step" : undefined}
            className={cn(
              "border-2 px-1 py-1.5 text-center font-label text-label font-bold",
              index === step && "border-outline bg-primary text-on-primary shadow-pixel-sm",
              index < step && "border-outline bg-primary-container",
              index > step && "border-outline-variant bg-surface text-on-surface-variant",
            )}
          >
            <span className="font-pixel">{index + 1}</span> {title}
          </li>
        ))}
      </ol>

      {state.status === "error" && state.message && (
        <p role="alert" className="border-2 border-error bg-error-container px-3 py-2 text-sm font-semibold text-error">
          {state.message}
        </p>
      )}

      {/* Bước 1 — Cơ thể */}
      <Card tone="pink" hidden={step !== 0}>
        <CardTitle>Chỉ số cơ thể</CardTitle>
        <div className="grid gap-4">
          <SegmentedControl
            name="sex"
            legend="Giới tính"
            defaultValue={raw.sex as (typeof SEXES)[number] | undefined}
            options={SEXES.map((value) => ({ value, label: SEX_LABELS[value] }))}
            error={errors.sex}
          />
          <Field htmlFor="birthDate" label="Ngày sinh" error={errors.birthDate}>
            <Input
              id="birthDate"
              name="birthDate"
              type="date"
              max={today}
              defaultValue={raw.birthDate}
              invalid={Boolean(errors.birthDate)}
              aria-describedby={describedBy("birthDate")}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field htmlFor="heightCm" label="Chiều cao" error={errors.heightCm}>
              <Input
                id="heightCm"
                name="heightCm"
                inputMode="decimal"
                unit="cm"
                defaultValue={raw.heightCm}
                invalid={Boolean(errors.heightCm)}
                aria-describedby={describedBy("heightCm")}
              />
            </Field>
            <Field htmlFor="weightKg" label="Cân nặng hiện tại" error={errors.weightKg}>
              <Input
                id="weightKg"
                name="weightKg"
                inputMode="decimal"
                unit="kg"
                defaultValue={raw.weightKg}
                invalid={Boolean(errors.weightKg)}
                aria-describedby={describedBy("weightKg")}
              />
            </Field>
          </div>
          <Field
            htmlFor="bodyFatPercent"
            label="% mỡ cơ thể (không bắt buộc)"
            hint="Có % mỡ → tính BMR chính xác hơn (Katch-McArdle) và mở kiểu macro “Theo sheet”."
            error={errors.bodyFatPercent}
          >
            <Input
              id="bodyFatPercent"
              name="bodyFatPercent"
              inputMode="decimal"
              unit="%"
              defaultValue={raw.bodyFatPercent}
              invalid={Boolean(errors.bodyFatPercent)}
              aria-describedby={describedBy("bodyFatPercent", true)}
            />
          </Field>
        </div>
      </Card>

      {/* Bước 2 — Vận động */}
      <Card tone="purple" hidden={step !== 1}>
        <CardTitle>Mức vận động</CardTitle>
        <SegmentedControl
          name="activityLevel"
          legend="Bạn vận động bao nhiêu mỗi tuần?"
          tone="purple"
          layout="stack"
          defaultValue={raw.activityLevel as (typeof ACTIVITY_LEVELS)[number] | undefined}
          options={ACTIVITY_LEVELS.map((value) => ({ value, label: ACTIVITY_LABELS[value] }))}
          error={errors.activityLevel}
        />
      </Card>

      {/* Bước 3 — Mục tiêu */}
      <Card tone="cyan" hidden={step !== 2}>
        <CardTitle>Mục tiêu</CardTitle>
        <div className="grid gap-4">
          <SegmentedControl
            name="goalType"
            legend="Bạn muốn"
            defaultValue={(raw.goalType as (typeof GOAL_TYPES)[number] | undefined) ?? "lose"}
            options={GOAL_TYPES.map((value) => ({ value, label: GOAL_LABELS[value] }))}
            error={errors.goalType}
          />
          {goalType !== "maintain" && (
            <>
              <Field htmlFor="targetWeightKg" label="Cân nặng mục tiêu" error={errors.targetWeightKg}>
                <Input
                  id="targetWeightKg"
                  name="targetWeightKg"
                  inputMode="decimal"
                  unit="kg"
                  defaultValue={raw.targetWeightKg}
                  invalid={Boolean(errors.targetWeightKg)}
                  aria-describedby={describedBy("targetWeightKg")}
                />
              </Field>
              <SegmentedControl
                name="speed"
                legend="Tốc độ"
                defaultValue={(raw.speed as (typeof SPEEDS)[number] | undefined) ?? "medium"}
                options={SPEEDS.map((value) => {
                  const kcal = DAILY_ENERGY_DELTA_KCAL[value];
                  const kgPerWeek = (kcal * 7) / KCAL_PER_KG_FAT;
                  const sign = goalType === "gain" ? "+" : "−";
                  return {
                    value,
                    label: SPEED_LABELS[value],
                    hint: `${sign}${kcal} kcal · ≈${formatDecimal(kgPerWeek, 2)} kg/tuần`,
                  };
                })}
                error={errors.speed}
              />
            </>
          )}
        </div>
      </Card>

      {/* Bước 4 — Xem kế hoạch */}
      <div hidden={step !== LAST_STEP} className="grid gap-6">
        {preview && selectedOption ? (
          <>
            <MacroPresetPicker options={preview.macroOptions} selected={selectedPreset} error={errors.macroPreset} />
            <PlanSummary
              data={{
                goalType: previewParse.success ? previewParse.data.goalType : "lose",
                targetKcal: preview.targetKcal,
                tdeeKcal: preview.tdeeKcal,
                bmrKcal: preview.bmr.bmrKcal,
                dailyDeltaKcal: preview.dailyDeltaKcal,
                macros: selectedOption.macros,
                macroLabel: MACRO_PRESET_LABELS[selectedOption.preset],
                startWeightKg: previewParse.success ? previewParse.data.weightKg : 0,
                targetWeightKg: previewParse.success
                  ? toPlanInput(previewParse.data, today).targetWeightKg
                  : 0,
                weeksToGoal: preview.weeksToGoal,
                estimatedEndDate: preview.estimatedEndDate,
                bodyFatRatioAtTarget: preview.bodyFatRatioAtTarget,
                limits: preview.limits,
                warnings: preview.warnings,
              }}
            />
          </>
        ) : (
          <p className="text-on-surface-variant">Điền đủ thông tin ở các bước trước để xem kế hoạch.</p>
        )}
        {!hasBodyFat && (
          <p className="text-xs text-on-surface-variant">
            Kiểu “Theo sheet” (protein theo khối nạc) chỉ có khi nhập % mỡ ở bước 1.
          </p>
        )}
      </div>

      {/* Điều hướng */}
      <div className="flex flex-wrap justify-between gap-3">
        <Button onClick={() => setStep((current) => Math.max(current - 1, 0))} disabled={step === 0 || pending}>
          ← Quay lại
        </Button>
        {step < LAST_STEP ? (
          <Button variant="primary" onClick={goNext}>
            Tiếp →
          </Button>
        ) : (
          <Button type="submit" variant="primary" disabled={pending || !preview}>
            {pending ? "Đang lưu…" : isReplan ? "Lưu kế hoạch mới" : "Bắt đầu kế hoạch"}
          </Button>
        )}
      </div>
    </form>
  );
}
