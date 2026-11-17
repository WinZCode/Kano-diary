/*
 * Logo + tên app (mockup: ô avatar pixel + tiêu đề "Theo dõi Kano").
 */
import Link from "next/link";
import { PixelIcon } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={cn("flex items-center gap-3", className)}>
      <span className="flex size-10 shrink-0 items-center justify-center border-3 border-outline bg-surface-container shadow-pixel-sm">
        <PixelIcon name="flame" size={24} className="text-primary" />
      </span>
      <span className="font-headline text-lg leading-tight font-extrabold">
        <em className="text-primary not-italic">Kano</em> Diary
      </span>
    </Link>
  );
}
