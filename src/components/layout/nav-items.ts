/*
 * Cấu hình 5 mục điều hướng chính — dùng chung cho Sidebar (desktop) và BottomNav (mobile).
 */
import type { PixelIconName } from "@/components/ui";

export type NavItem = {
  href: string;
  label: string;
  icon: PixelIconName;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: "home" },
  { href: "/diary", label: "Nhật ký", icon: "book" }, // /diary tự chuyển sang ngày hôm nay
  { href: "/plan", label: "Kế hoạch", icon: "target" },
  { href: "/progress", label: "Tiến độ", icon: "chart" },
  { href: "/settings", label: "Cài đặt", icon: "gear" },
];

/** Mục đang active khi đường dẫn hiện tại bằng href hoặc nằm bên dưới nó (ví dụ /diary/2026-11-17). */
export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
