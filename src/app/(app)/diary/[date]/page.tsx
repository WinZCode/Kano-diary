/*
 * Nhật ký một ngày: /diary/YYYY-MM-DD.
 * Bước 3 mới có thanh chuyển ngày; các khối Bữa ăn / Vận động / Nước / Ngủ / Cân làm ở Bước 7.
 * params là dữ liệu runtime → đọc trong component con bọc <Suspense> (yêu cầu của Cache Components).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ComingSoon, PageHeader } from "@/components/layout";
import { buttonStyles, PixelIcon } from "@/components/ui";
import { addDays, formatDateVi, isIsoDate } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Nhật ký" };

async function DiaryDay({ params }: { params: PageProps<"/diary/[date]">["params"] }) {
  const { date } = await params;
  if (!isIsoDate(date)) notFound(); // URL sai định dạng → 404 thay vì crash

  return (
    <>
      <PageHeader
        eyebrow="Nhật ký"
        title={formatDateVi(date)}
        actions={
          <>
            <Link href={`/diary/${addDays(date, -1)}`} className={buttonStyles({ size: "sm" })}>
              <PixelIcon name="chevron-left" size={12} /> Hôm trước
            </Link>
            <Link href="/diary" className={buttonStyles({ size: "sm", variant: "primary" })}>
              Hôm nay
            </Link>
            <Link href={`/diary/${addDays(date, 1)}`} className={buttonStyles({ size: "sm" })}>
              Hôm sau <PixelIcon name="chevron-right" size={12} />
            </Link>
          </>
        }
      />
      <ComingSoon step={7}>Bữa ăn (Sáng/Trưa/Tối/Phụ), Vận động, Nước, Giấc ngủ và Cân sáng.</ComingSoon>
    </>
  );
}

export default function DiaryDayPage({ params }: PageProps<"/diary/[date]">) {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Đang tải nhật ký…</p>}>
      <DiaryDay params={params} />
    </Suspense>
  );
}
