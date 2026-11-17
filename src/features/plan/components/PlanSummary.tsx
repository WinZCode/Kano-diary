/*
 * Hiển thị kết quả kế hoạch: calo mục tiêu, TDEE, BMR, thời gian, macro, cảnh báo.
 * Thuần hiển thị (không hook) → dùng được ở cả wizard (xem trước, client) và trang Kế hoạch (server).
 */
import { GOAL_LABELS, KCAL_PER_G, type GoalType } from "@/constants/nutrition";
import { Badge, Card, CardTitle, ProgressBar, StatCard } from "@/components/ui";
import type { Macros, PlanWarning } from "@/lib/calc";
import { formatDateVi, type IsoDate } from "@/lib/utils/date";
import { formatDecimal, formatInteger, formatPercent, formatSignedInteger } from "@/lib/utils/format";
import { PlanWarnings } from "./PlanWarnings";

export type PlanSummaryData = {
  goalType: GoalType;
  targetKcal: number;
  tdeeKcal: number;
  bmrKcal: number;
  dailyDeltaKcal: number;
  macros: Macros;
  macroLabel: string;
  startWeightKg: number;
  targetWeightKg: number;
  weeksToGoal: number | null;
  estimatedEndDate: IsoDate | null;
  bodyFatRatioAtTarget: number | null;
  limits: { sugarMaxG: number; saturatedFatMaxG: number };
  warnings: readonly PlanWarning[];
};

const MACRO_ROWS = [
  { key: "proteinG", label: "Protein", kcalPerG: KCAL_PER_G.protein, tone: "pink" },
  { key: "carbG", label: "Carb", kcalPerG: KCAL_PER_G.carb, tone: "purple" },
  { key: "fatG", label: "Fat", kcalPerG: KCAL_PER_G.fat, tone: "amber" },
] as const;

export function PlanSummary({ data }: { data: PlanSummaryData }) {
  const deltaTone = data.dailyDeltaKcal < 0 ? "default" : data.dailyDeltaKcal > 0 ? "purple" : "ok";
  const totalMacroKcal = MACRO_ROWS.reduce((sum, row) => sum + data.macros[row.key] * row.kcalPerG, 0);

  return (
    <div className="grid gap-6">
      <PlanWarnings warnings={data.warnings} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Calo mục tiêu"
          value={formatInteger(data.targetKcal)}
          unit="kcal"
          icon="flame"
          badge={<Badge tone={deltaTone}>{formatSignedInteger(data.dailyDeltaKcal)}</Badge>}
          footer={<span className="text-xs text-on-surface-variant">mỗi ngày</span>}
        />
        <StatCard
          label="TDEE"
          value={formatInteger(data.tdeeKcal)}
          unit="kcal"
          icon="chart"
          footer={<span className="text-xs text-on-surface-variant">tiêu hao/ngày</span>}
        />
        <StatCard
          label="BMR"
          value={formatInteger(data.bmrKcal)}
          unit="kcal"
          icon="moon"
          footer={<span className="text-xs text-on-surface-variant">khi nghỉ ngơi</span>}
        />
        <StatCard
          label="Thời gian"
          value={data.weeksToGoal != null ? String(data.weeksToGoal) : "—"}
          unit={data.weeksToGoal != null ? "tuần" : undefined}
          icon="target"
          footer={
            <span className="text-xs text-on-surface-variant">
              {data.estimatedEndDate ? `Dự kiến: ${formatDateVi(data.estimatedEndDate)}` : GOAL_LABELS[data.goalType]}
            </span>
          }
        />
      </div>

      <Card tone="purple">
        <CardTitle action={<Badge tone="purple">{data.macroLabel}</Badge>}>Macro mỗi ngày</CardTitle>
        <div className="grid gap-4">
          {MACRO_ROWS.map((row) => {
            const grams = data.macros[row.key];
            const share = totalMacroKcal > 0 ? (grams * row.kcalPerG) / totalMacroKcal : 0;
            return (
              <div key={row.key} className="grid gap-1">
                <div className="flex items-baseline justify-between font-label font-bold">
                  <span>{row.label}</span>
                  <span className="tabular-nums">
                    <span className="font-pixel text-lg">{formatInteger(grams)}</span> g
                    <span className="ml-2 text-label text-on-surface-variant">{formatPercent(share, 0)}</span>
                  </span>
                </div>
                <ProgressBar value={share * 100} max={100} label={`Tỉ lệ ${row.label}`} tone={row.tone} />
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-on-surface-variant">
          Đường &lt; {formatInteger(data.limits.sugarMaxG)} g · Chất béo bão hòa &lt;{" "}
          {formatInteger(data.limits.saturatedFatMaxG)} g mỗi ngày
        </p>
      </Card>

      <Card variant="soft">
        <p className="font-headline font-bold">
          {formatDecimal(data.startWeightKg)} kg → {formatDecimal(data.targetWeightKg)} kg
          <span className="ml-2 font-body text-sm font-normal text-on-surface-variant">
            ({GOAL_LABELS[data.goalType].toLowerCase()})
          </span>
        </p>
        {data.bodyFatRatioAtTarget != null && (
          <p className="text-sm text-on-surface-variant">
            % mỡ dự kiến khi đạt mục tiêu: <strong>{formatPercent(data.bodyFatRatioAtTarget)}</strong> (giữ nguyên
            khối nạc)
          </p>
        )}
      </Card>
    </div>
  );
}
