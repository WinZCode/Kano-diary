/*
 * /onboarding — nhập dữ liệu lần đầu, hoặc lập kế hoạch mới (điền sẵn từ hồ sơ + kế hoạch hiện tại).
 * Đọc dữ liệu người dùng → nằm trong <Suspense> (Cache Components).
 */
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout";
import { buttonStyles } from "@/components/ui";
import { DEFAULT_TIMEZONE } from "@/constants/app";
import { getActivePlan, getOnboardingDefaults, OnboardingWizard } from "@/features/plan";
import { toIsoDate } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Lập kế hoạch" };

async function OnboardingContent() {
  const [defaults, activePlan] = await Promise.all([getOnboardingDefaults(), getActivePlan()]);
  const isReplan = activePlan !== null;
  // Đã đọc cookie ở trên → đang render theo request, dùng giờ hiện tại được.
  const today = toIsoDate(new Date(), DEFAULT_TIMEZONE);

  return (
    <>
      <PageHeader
        eyebrow={isReplan ? "Kế hoạch mới" : "Chào mừng"}
        title={isReplan ? "Lập kế hoạch mới" : "Thiết lập cá nhân"}
        description={
          isReplan
            ? "Kế hoạch hiện tại sẽ được lưu vào lịch sử."
            : "Vài thông tin để app tính calo, macro và thời gian đạt mục tiêu cho riêng bạn."
        }
        actions={
          isReplan ? (
            <Link href="/plan" className={buttonStyles({ size: "sm" })}>
              Hủy
            </Link>
          ) : undefined
        }
      />
      <OnboardingWizard defaults={defaults} today={today} isReplan={isReplan} />
    </>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<p className="text-on-surface-variant">Đang tải…</p>}>
      <OnboardingContent />
    </Suspense>
  );
}
