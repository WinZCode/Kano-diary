// Trang đăng ký tài khoản mới.
import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui";
import { RegisterForm } from "@/features/auth";

export const metadata: Metadata = { title: "Đăng ký" };

export default function RegisterPage() {
  return (
    <Card tone="purple">
      <CardTitle>Tạo tài khoản</CardTitle>
      <RegisterForm />
      <p className="mt-4 text-sm text-on-surface-variant">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-bold text-primary underline underline-offset-2">
          Đăng nhập
        </Link>
      </p>
    </Card>
  );
}
