/*
 * Hộp thông báo đầu form: lỗi chung (đỏ) hoặc thành công (xanh).
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function FormMessage({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "border-2 px-3 py-2 text-sm font-semibold",
        tone === "error"
          ? "border-error bg-error-container text-error"
          : "border-positive bg-positive-container text-positive",
      )}
    >
      {children}
    </p>
  );
}
