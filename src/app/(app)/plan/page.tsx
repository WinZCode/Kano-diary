/*
 * Trang Kế hoạch: hiển thị kế hoạch đang dùng (snapshot lúc tạo) + nút lập kế hoạch mới.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout";
import { buttonStyles, Card } from "@/components/ui";
import {
  ACTIVITY_LABELS,
  GOAL_LABELS,
  MACRO_PRESET_LABELS,
  SEX_LABELS,
  SPEED_LABELS,
} from "@/constants/nutrition";
import { getActivePlan, PlanSummary, type SavedPlan } from "@/features/plan";
import { calcBodyFatRatioAtTarget, calcLeanMassKg, calcMacroLimits } from "@/lib/calc";
import { formatDateVi } from "@/lib/utils/date";
import { formatDecimal, formatPercent } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Kế hoạch" };

/** Thông tin đầu vào của kế hoạch, hiển thị dạng danh sách. */
function PlanInputs({ plan }: { plan: SavedPlan }) {
  const rows: [string, string][] = [
    ["Bắt đầu", formatDateVi(plan.startDate)],
    ["Giới tính · Tuổi", `${SEX_LABELS[plan.sex]} · ${plan.ageYears}`],
    ["Chiều cao", `${formatDecimal(plan.heightCm)} cm`],
    ["% mỡ", plan.bodyFatRatio != null ? formatPercent(plan.bodyFatRatio) : "Không nhập"],
    ["Vận động", ACTIVITY_LABELS[plan.activityLevel]],
    ["Mục tiêu", plan.goalType === "maintain" ? GOAL_LABELS.maintain : `${GOAL_LABELS[plan.goalType]} · ${SPEED_LABELS[plan.speed]}`],
    ["Công thức BMR", plan.bmrMethod === "katch-mcardle" ? "Katch-McArdle" : "Mifflin-St Jeor"],
  ];
  return (
    <Card variant="soft">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2 border-b-2 border-outline-variant pb-1">
            <dt className="font-label text-label font-bold text-on-surface-variant">{label}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

async function ActivePlan() {
  const plan = await getActivePlan();
  if (!plan) {
    return (
      <Card className="flex flex-col items-start gap-3">
        <p>Bạn chưa có kế hoạch.</p>
        <Link href="/onboarding" className={buttonStyles({ variant: "primary" })}>
          Lập kế hoạch
        </Link>
      </Card>
    );
  }

  const leanMassKg = plan.bodyFatRatio != null ? calcLeanMassKg(plan.startWeightKg, plan.bodyFatRatio) : null;
  return (
    <div className="grid gap-6">
      <PlanSummary
        data={{
          goalType: plan.goalType,
          targetKcal: plan.targetKcal,
          tdeeKcal: plan.tdeeKcal,
          bmrKcal: plan.bmrKcal,
          dailyDeltaKcal: plan.dailyDeltaKcal,
          macros: { proteinG: plan.proteinG, carbG: plan.carbG, fatG: plan.fatG },
          macroLabel: MACRO_PRESET_LABELS[plan.macroPreset],
          startWeightKg: plan.startWeightKg,
          targetWeightKg: plan.targetWeightKg,
          weeksToGoal: plan.weeksToGoal,
          estimatedEndDate: plan.estimatedEndDate,
          bodyFatRatioAtTarget: leanMassKg != null ? calcBodyFatRatioAtTarget(leanMassKg, plan.targetWeightKg) : null,
          limits: calcMacroLimits(plan.targetKcal),
          warnings: plan.warnings,
        }}
      />
      <PlanInputs plan={plan} />
    </div>
  );
}

export default function PlanPage() {
  return (
    <>
      <PageHeader
        title="Kế hoạch"
        description="Calo, macro và thời gian dự kiến — tính từ thông tin bạn nhập."
        actions={
          <Link href="/onboarding" className={buttonStyles({ size: "sm" })}>
            Lập kế hoạch mới
          </Link>
        }
      />
      <Suspense fallback={<p className="text-on-surface-variant">Đang tải kế hoạch…</p>}>
        <ActivePlan />
      </Suspense>
    </>
  );
}
