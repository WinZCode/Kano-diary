/*
 * Nhãn trạng thái nhỏ (mockup .pixel-badge): "Đạt mục tiêu", "Vượt 120 kcal", "Protein"...
 */
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export type BadgeTone = "default" | "ok" | "warn" | "alert" | "cyan" | "purple";

const TONES: Record<BadgeTone, string> = {
  default: "border-outline bg-primary-container text-on-primary-container",
  ok: "border-positive bg-positive-container text-positive",
  warn: "border-warning bg-warning-container text-warning",
  alert: "border-error bg-error-container text-error",
  cyan: "border-tertiary bg-tertiary-container text-tertiary",
  purple: "border-secondary bg-secondary-container text-secondary",
};

type BadgeProps = ComponentProps<"span"> & { tone?: BadgeTone };

export function Badge({ tone = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border-2 px-2 py-0.5 font-label text-label font-bold whitespace-nowrap",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
