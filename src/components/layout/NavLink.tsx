/*
 * Một mục điều hướng. Là Client Component vì cần usePathname() để biết trang hiện tại.
 * layout="sidebar": hàng ngang icon + chữ (desktop). layout="bottom": icon trên, chữ nhỏ dưới (mobile).
 *
 * Vì sao có <Suspense>: khi bật Cache Components, usePathname() trên route động (ví dụ /diary/[date])
 * chưa có giá trị lúc build → phải bọc Suspense, nếu không build lỗi.
 * Fallback là chính link ở trạng thái "không active" nên khung trang vẫn prerender đầy đủ.
 * Xem node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-pathname.md (mục Cache Components).
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { PixelIcon } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { isNavItemActive, type NavItem } from "./nav-items";

type NavLinkProps = { item: NavItem; layout: "sidebar" | "bottom" };

/** Phần hiển thị thuần, không đọc URL. */
function NavLinkView({ item, layout, active }: NavLinkProps & { active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center border-2 font-headline font-bold transition-colors duration-100",
        layout === "sidebar"
          ? "min-h-11 gap-3 px-3 text-sm"
          : "min-h-14 flex-col justify-center gap-0.5 px-1 text-[0.6875rem]",
        active
          ? "border-outline bg-primary text-on-primary shadow-pixel-sm"
          : "border-transparent text-on-surface hover:bg-surface-high",
      )}
    >
      <PixelIcon name={item.icon} size={layout === "sidebar" ? 20 : 22} />
      <span>{item.label}</span>
    </Link>
  );
}

/** Đọc URL hiện tại để tô sáng mục đang mở. */
function ActiveAwareNavLink(props: NavLinkProps) {
  const pathname = usePathname();
  return <NavLinkView {...props} active={isNavItemActive(pathname, props.item.href)} />;
}

export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavLinkView {...props} active={false} />}>
      <ActiveAwareNavLink {...props} />
    </Suspense>
  );
}
