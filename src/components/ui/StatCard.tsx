/*
 * Thẻ chỉ số lớn (mockup .kpi-card): "Calo còn lại", "Cân nặng", "Nước"...
 * Số hiển thị bằng font pixel → giá trị nên là số / ký tự không dấu.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { PixelIcon } from "./PixelIcon";
import type { PixelIconName } from "./pixel-icons";

type StatCardProps = {
  label: string;
  /** Giá trị đã định dạng sẵn, ví dụ "1.906". */
  value: string;
  unit?: string;
  icon?: PixelIconName;
  /** Badge hoặc phần tử nhỏ ở góc phải. */
  badge?: ReactNode;
  /** Nội dung dưới số: thanh tiến độ, chú thích... */
  footer?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, unit, icon, badge, footer, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-2 border-3 border-outline bg-surface p-4 shadow-pixel",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="flex items-center gap-1.5 font-label text-label font-bold text-on-surface-variant">
          {icon && <PixelIcon name={icon} size={12} className="text-primary" />}
          {label}
        </span>
        {badge}
      </div>
      <p className="font-pixel text-kpi font-bold tabular-nums">
        {value}
        {unit && <span className="ml-1 font-label text-label font-bold text-primary">{unit}</span>}
      </p>
      {footer}
    </div>
  );
}
