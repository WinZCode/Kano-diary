/*
 * Trang gốc "/": chuyển thẳng vào Tổng quan.
 * Bước 4 (auth) sẽ đổi thành: chưa đăng nhập → /login, chưa onboarding → /onboarding.
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
