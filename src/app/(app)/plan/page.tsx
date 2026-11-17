// Trang Kế hoạch — TẠM THỜI là khung trống, nội dung thật làm ở Bước 6.
import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "Kế hoạch" };

export default function PlanPage() {
  return (
    <>
      <PageHeader title="Kế hoạch" description="BMR, TDEE, calo mục tiêu, macro và ngày dự kiến đạt mục tiêu." />
      <ComingSoon step={6}>Kế hoạch được tính tự động từ dữ liệu onboarding.</ComingSoon>
    </>
  );
}
