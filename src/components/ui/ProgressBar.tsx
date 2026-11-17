/*
 * Thanh tiến độ pixel (mockup .pixel-bar): calo đã nạp / mục tiêu, nước đã uống, macro...
 * Có vạch sọc trắng mỗi 12px tạo cảm giác "ô pixel".
 */
import { cn } from "@/lib/utils/cn";

export type ProgressTone = "pink" | "purple" | "cyan" | "amber" | "green";

const FILL: Record<ProgressTone, string> = {
  pink: "bg-primary",
  purple: "bg-secondary",
  cyan: "bg-tertiary",
  amber: "bg-warning",
  green: "bg-positive",
};

type ProgressBarProps = {
  value: number;
  max: number;
  /** Mô tả cho trình đọc màn hình, ví dụ "Calo đã nạp". */
  label: string;
  tone?: ProgressTone;
  className?: string;
};

/**
 * @param value Giá trị hiện tại (có thể vượt max — thanh sẽ đầy, nơi gọi tự đổi tone để cảnh báo)
 * @param max Giá trị mục tiêu (> 0)
 */
export function ProgressBar({ value, max, label, tone = "pink", className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("relative h-4.5 w-full overflow-hidden border-2 border-outline bg-surface-container", className)}
    >
      <div
        className={cn(
          "h-full bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_10px,var(--surface-container-low)_10px,var(--surface-container-low)_12px)] bg-blend-soft-light transition-[width] duration-180 ease-pixel-out",
          FILL[tone],
        )}
        style={{ width: `${percent}%` }} // độ rộng động — không thể viết bằng class tĩnh
      />
    </div>
  );
}
