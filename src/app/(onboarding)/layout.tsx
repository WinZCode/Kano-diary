/*
 * Layout riêng cho onboarding: KHÔNG dùng AppShell (chưa có kế hoạch thì menu chưa có ý nghĩa)
 * và nằm ngoài nhóm (app) để không bị OnboardingGuard chuyển hướng vòng lặp.
 */
import { Brand } from "@/components/layout";

export default function OnboardingLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-4 md:p-6">
      <Brand />
      {children}
    </main>
  );
}
