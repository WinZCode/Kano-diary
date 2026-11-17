/*
 * Layout cho trang chưa đăng nhập (đăng nhập / đăng ký): logo + 1 thẻ ở giữa màn hình.
 */
import { Brand } from "@/components/layout";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Brand />
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
