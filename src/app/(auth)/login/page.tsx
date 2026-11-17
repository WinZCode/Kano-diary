// Trang đăng nhập. LoginForm đọc ?next= từ URL → bọc Suspense (yêu cầu của Cache Components).
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardTitle } from "@/components/ui";
import { LoginForm } from "@/features/auth";

export const metadata: Metadata = { title: "Đăng nhập" };

export default function LoginPage() {
  return (
    <Card tone="pink">
      <CardTitle>Đăng nhập</CardTitle>
      <Suspense>
        <LoginForm />
      </Suspense>
      <p className="mt-4 text-sm text-on-surface-variant">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="font-bold text-primary underline underline-offset-2">
          Đăng ký
        </Link>
      </p>
    </Card>
  );
}
