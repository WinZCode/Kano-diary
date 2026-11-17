/*
 * Danh sách cảnh báo của kế hoạch (sàn calo, dưới BMR...).
 */
import { Badge } from "@/components/ui";
import type { PlanWarning } from "@/lib/calc";
import { cn } from "@/lib/utils/cn";
import { PLAN_WARNINGS } from "../warnings";

export function PlanWarnings({ warnings }: { warnings: readonly PlanWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <ul className="grid gap-2" aria-label="Cảnh báo">
      {warnings.map((warning) => {
        const { tone, text } = PLAN_WARNINGS[warning];
        return (
          <li
            key={warning}
            className={cn(
              "flex items-start gap-2 border-2 p-3 text-sm",
              tone === "alert" ? "border-error bg-error-container" : "border-warning bg-warning-container",
            )}
          >
            <Badge tone={tone}>{tone === "alert" ? "Lưu ý" : "Cảnh báo"}</Badge>
            <span>{text}</span>
          </li>
        );
      })}
    </ul>
  );
}
