/*
 * "/diary" → chuyển sang nhật ký của hôm nay ("/diary/YYYY-MM-DD").
 * "Hôm nay" chỉ biết được lúc có request, nên phần redirect nằm trong <Suspense>
 * (bắt buộc khi bật Cache Components — xem node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md).
 */
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { DEFAULT_TIMEZONE } from "@/constants/app";
import { toIsoDate } from "@/lib/utils/date";

async function RedirectToToday(): Promise<never> {
  await connection(); // báo Next: phần này chạy theo từng request, không prerender
  redirect(`/diary/${toIsoDate(new Date(), DEFAULT_TIMEZONE)}`);
}

export default function DiaryIndexPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Đang mở nhật ký hôm nay…</p>}>
      <RedirectToToday />
    </Suspense>
  );
}
