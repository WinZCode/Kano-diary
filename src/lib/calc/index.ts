// Public API của bộ tính toán dinh dưỡng — import từ "@/lib/calc".
export {
  calcAgeYears,
  calcBmr,
  calcBmrKatchMcArdle,
  calcBmrMifflinStJeor,
  calcLeanMassKg,
  type BmrInput,
  type BmrResult,
} from "./body";
export { calcBodyFatRatioAtTarget, calcProteinG, calcTargetKcal, calcTdee, calcWeeksToGoal } from "./energy";
export {
  calcMacroLimits,
  calcMacroOptions,
  calcMacrosByRatio,
  calcMacrosSheet,
  type MacroOption,
  type Macros,
} from "./macros";
export { calcPlan, type PlanInput, type PlanResult, type PlanWarning } from "./plan";
