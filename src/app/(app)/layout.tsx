/*
 * Layout cho nhóm route đã đăng nhập: AppShell + kiểm tra đã onboarding chưa.
 * (Chưa đăng nhập đã được proxy chuyển về /login trước khi tới đây.)
 */
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout";
import { isOnboarded } from "@/features/plan";

/** Chưa onboarding → /onboarding. Nằm trong Suspense để không chặn khung trang (Cache Components). */
async function OnboardingGuard() {
  if (!(await isOnboarded())) redirect("/onboarding");
  return null;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <OnboardingGuard />
      </Suspense>
      {children}
    </AppShell>
  );
}
