/*
 * Trang gốc "/": chuyển vào Tổng quan. Người chưa đăng nhập đã bị proxy đưa về /login trước đó.
 * Bước 6 sẽ thêm: chưa onboarding → /onboarding.
 */
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}
