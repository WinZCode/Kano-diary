/*
 * Layout cho nhóm route đã đăng nhập: bọc mọi trang trong AppShell (Sidebar / BottomNav).
 * Bước 4 sẽ thêm kiểm tra phiên đăng nhập ở đây.
 */
import { AppShell } from "@/components/layout";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
