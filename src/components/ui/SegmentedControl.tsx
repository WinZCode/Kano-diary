/*
 * Nhóm nút chọn một (mockup .seg-btn): giới tính, mức vận động, tốc độ giảm cân...
 * Dựng bằng radio thật (ẩn) nên chạy trong <form> không cần JavaScript và dùng được bằng phím mũi tên.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type SegmentOption<V extends string> = {
  value: V;
  label: ReactNode;
  /** Dòng chú thích nhỏ dưới nhãn, ví dụ "-0.25 kg/tuần". */
  hint?: ReactNode;
};

type SegmentedControlProps<V extends string> = {
  /** Tên trường khi submit form. */
  name: string;
  legend: ReactNode;
  options: ReadonlyArray<SegmentOption<V>>;
  defaultValue?: V;
  tone?: "pink" | "purple";
  required?: boolean;
  className?: string;
};

export function SegmentedControl<V extends string>({
  name,
  legend,
  options,
  defaultValue,
  tone = "pink",
  required,
  className,
}: SegmentedControlProps<V>) {
  const checkedBg = tone === "pink" ? "peer-checked:bg-primary" : "peer-checked:bg-secondary";
  return (
    <fieldset className={cn("flex flex-col gap-1", className)}>
      <legend className="mb-1 font-label text-label font-bold text-on-surface-variant">{legend}</legend>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} // số cột theo số lựa chọn
      >
        {options.map((option) => (
          <label key={option.value} className="relative">
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              required={required}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex min-h-11 cursor-pointer flex-col items-center justify-center border-2 border-outline bg-surface-container px-2 py-1.5 text-center font-headline text-[0.8125rem] font-bold",
                "transition-colors duration-100 hover:bg-surface-high",
                "peer-checked:text-on-primary peer-checked:shadow-pixel-sm",
                "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                checkedBg,
              )}
            >
              {option.label}
              {option.hint && <span className="text-[0.6875rem] font-semibold opacity-80">{option.hint}</span>}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
