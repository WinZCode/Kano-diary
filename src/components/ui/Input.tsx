/*
 * Ô nhập pixel (mockup .pixel-input) và ô chọn (.pixel-select).
 * Input hỗ trợ `unit` hiển thị đơn vị bên phải (kg, cm, ml...) — số đo nào cũng nên có đơn vị.
 */
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

const FIELD_BASE =
  "min-h-11 w-full rounded-pixel border-2 border-outline bg-surface-container px-3 py-2 font-semibold " +
  "transition-[background-color,box-shadow] duration-100 ease-pixel-out " +
  "placeholder:font-normal placeholder:text-on-surface-variant/60 " +
  "focus:bg-surface focus:shadow-pixel-sm " +
  "aria-invalid:border-error aria-invalid:bg-error-container " +
  "disabled:cursor-not-allowed disabled:opacity-55";

type InputProps = ComponentProps<"input"> & {
  /** Đơn vị hiển thị cuối ô, ví dụ "kg". */
  unit?: string;
  /** true → viền đỏ + aria-invalid cho trình đọc màn hình. */
  invalid?: boolean;
};

export function Input({ unit, invalid, className, ...props }: InputProps) {
  const input = (
    <input
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE, unit && "pr-12", className)}
      {...props}
    />
  );
  if (!unit) return input;

  return (
    <div className="relative">
      {input}
      <span
        aria-hidden // đơn vị đã có trong nhãn của Field, tránh đọc lặp
        className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-label text-label font-bold text-on-surface-variant"
      >
        {unit}
      </span>
    </div>
  );
}

type SelectProps = ComponentProps<"select"> & { invalid?: boolean };

export function Select({ invalid, className, ...props }: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={cn(FIELD_BASE, "cursor-pointer pr-7", className)}
      {...props}
    />
  );
}
