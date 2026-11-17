// Trang Tổng quan — TẠM THỜI là khung trống, nội dung thật làm ở Bước 8.
import type { Metadata } from "next";
import { ComingSoon, PageHeader } from "@/components/layout";

export const metadata: Metadata = { title: "Tổng quan" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader eyebrow="Hôm nay" title="Tổng quan" description="Calo còn lại, macro, nước và giấc ngủ trong ngày." />
      <ComingSoon step={8}>Thẻ chỉ số hôm nay, biểu đồ 7 ngày và tổng kết nhanh.</ComingSoon>
    </>
  );
}
