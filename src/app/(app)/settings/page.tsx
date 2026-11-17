/*
 * Trang Cài đặt — Bước 4: thông tin tài khoản + đăng xuất. Hồ sơ cơ thể thêm ở Bước 6.
 * Thông tin user đọc từ cookie → nằm trong <Suspense>.
 */
import type { Metadata } from "next";
import { Suspense } from "react";
import { ComingSoon, PageHeader } from "@/components/layout";
import { Card, CardTitle } from "@/components/ui";
import { SignOutButton } from "@/features/auth";
import { getCurrentUser } from "@/lib/auth/current-user";

export const metadata: Metadata = { title: "Cài đặt" };

async function AccountInfo() {
  const user = await getCurrentUser();
  return (
    <dl className="grid gap-2 text-sm">
      <div>
        <dt className="font-label text-label font-bold text-on-surface-variant">Tên hiển thị</dt>
        <dd className="font-semibold">{user.displayName ?? "—"}</dd>
      </div>
      <div>
        <dt className="font-label text-label font-bold text-on-surface-variant">Email</dt>
        <dd className="font-semibold break-all">{user.email ?? "—"}</dd>
      </div>
    </dl>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Cài đặt" description="Hồ sơ cá nhân, đơn vị đo và tài khoản." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Tài khoản</CardTitle>
          <Suspense fallback={<p className="text-sm text-on-surface-variant">Đang tải…</p>}>
            <AccountInfo />
          </Suspense>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </Card>
        <ComingSoon step={6}>Hồ sơ cơ thể (chiều cao, ngày sinh, giới tính) và chỉnh sửa mục tiêu.</ComingSoon>
      </div>
    </>
  );
}
