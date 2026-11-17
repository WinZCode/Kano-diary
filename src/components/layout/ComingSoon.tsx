/*
 * TẠM THỜI: khối báo "phần này làm ở bước X" cho các trang chưa có nội dung. Xóa khi mọi trang đã xong.
 */
import type { ReactNode } from "react";
import { Badge, Card } from "@/components/ui";

export function ComingSoon({ step, children }: { step: number; children: ReactNode }) {
  return (
    <Card variant="soft" className="flex flex-col items-start gap-2">
      <Badge tone="purple">Bước {step}</Badge>
      <p className="text-on-surface-variant">{children}</p>
    </Card>
  );
}
