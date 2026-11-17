// Trang Tiến độ — TẠM THỜI là khung trống, nội dung thật làm ở Bước 8.
import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "Tiến độ" };

export default function ProgressPage() {
  return (
    <>
      <PageHeader title="Tiến độ" description="Xu hướng cân nặng, tổng kết tuần và số ngày đạt mục tiêu." />
      <ComingSoon step={8}>Biểu đồ cân nặng (trung bình 7 ngày) và tổng kết tuần.</ComingSoon>
    </>
  );
}
