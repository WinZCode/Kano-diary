/*
 * Helper gộp className: nối class có điều kiện (clsx) và xử lý xung đột Tailwind (tailwind-merge).
 */
import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Báo cho tailwind-merge biết các token tùy biến, để "text-label" (cỡ chữ) không bị
// nhầm là màu chữ và xóa mất "text-primary" khi gộp.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "headline", "subhead", "body", "label", "kpi"],
      shadow: ["pixel", "pixel-sm", "pixel-pink", "pixel-purple", "pixel-cyan"],
      radius: ["pixel", "pixel-lg"],
      font: ["pixel", "headline", "body", "label"],
    },
  },
});

/**
 * Gộp danh sách class, class sau ghi đè class trước nếu xung đột.
 * @example cn("px-2 bg-primary", isActive && "bg-secondary") // → "px-2 bg-secondary"
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
