/*
 * Khung trang cho mọi màn hình đã đăng nhập.
 * - Desktop (≥ md, 768px): Sidebar cố định bên trái.
 * - Mobile: header gọn phía trên + BottomNav cố định phía dưới (dễ bấm bằng ngón cái).
 */
import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { NAV_ITEMS } from "./nav-items";
import { NavLink } from "./NavLink";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      {/* Sidebar — chỉ desktop */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-8 border-r-3 border-outline bg-surface p-4 md:flex">
        <Brand />
        <nav aria-label="Điều hướng chính">
          <ul className="flex flex-col gap-1.5">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NavLink item={item} layout="sidebar" />
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header — chỉ mobile */}
        <header className="border-b-3 border-outline bg-surface px-4 py-3 md:hidden">
          <Brand />
        </header>

        {/* pb-28 trên mobile chừa chỗ cho BottomNav để nội dung cuối không bị che */}
        <main className="mx-auto w-full max-w-6xl flex-1 p-4 pb-28 md:p-6 md:pb-6">{children}</main>
      </div>

      {/* BottomNav — chỉ mobile; pb theo safe-area để tránh thanh home của iPhone */}
      <nav
        aria-label="Điều hướng chính"
        className="fixed inset-x-0 bottom-0 z-40 border-t-3 border-outline bg-surface px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className="grid grid-cols-5 gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} layout="bottom" />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
