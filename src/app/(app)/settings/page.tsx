// Trang Cài đặt — TẠM THỜI là khung trống, nội dung thật làm ở Bước 4 & 6.
import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "Cài đặt" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Cài đặt" description="Hồ sơ cá nhân, đơn vị đo và tài khoản." />
      <ComingSoon step={4}>Thông tin tài khoản và đăng xuất.</ComingSoon>
    </>
  );
}
