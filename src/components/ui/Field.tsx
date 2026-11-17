/*
 * Khung một trường form: nhãn + ô nhập + gợi ý + lỗi.
 * Truy cập: gợi ý có id `${htmlFor}-hint`, lỗi có id `${htmlFor}-error`. Dùng fieldDescribedBy()
 * để gắn aria-describedby cho ô nhập, giúp trình đọc màn hình đọc kèm gợi ý / lỗi.
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FieldProps = {
  /** id của ô nhập bên trong — bắt buộc để nhãn trỏ đúng ô. */
  htmlFor: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function Field({ htmlFor, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="font-label text-label font-bold text-on-surface-variant">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs text-on-surface-variant">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Tạo giá trị aria-describedby khớp với id gợi ý / lỗi mà Field sinh ra.
 * @example <Input id="weight" aria-describedby={fieldDescribedBy("weight", { hint: true, error: !!err })} />
 */
export function fieldDescribedBy(id: string, { hint = false, error = false }: { hint?: boolean; error?: boolean }) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
