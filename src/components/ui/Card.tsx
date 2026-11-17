/*
 * Thẻ pixel (mockup .pixel-card): khung chứa từng khối nội dung — bữa ăn, nước, giấc ngủ...
 * tone đổi màu bóng để phân biệt nhóm; variant "soft" là thẻ phụ nền hồng nhạt nằm bên trong thẻ chính.
 */
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type CardTone = "default" | "pink" | "purple" | "cyan";

const TONE_SHADOW: Record<CardTone, string> = {
  default: "shadow-pixel",
  pink: "shadow-pixel-pink",
  purple: "shadow-pixel-purple",
  cyan: "shadow-pixel-cyan",
};

// Bỏ "ref" vì thẻ có thể là section/div/article — kiểu ref mỗi thẻ khác nhau, và Card không cần ref.
type CardProps = Omit<ComponentProps<"section">, "ref"> & {
  tone?: CardTone;
  variant?: "solid" | "soft";
  /** Thẻ tag HTML: section (mặc định, có nghĩa), div hoặc article. */
  as?: "section" | "div" | "article";
};

export function Card({ tone = "default", variant = "solid", as: Tag = "section", className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        variant === "solid"
          ? cn("rounded-pixel-lg border-3 border-outline bg-surface p-4 md:p-6", TONE_SHADOW[tone])
          : "rounded-pixel-lg border-2 border-outline bg-surface-container p-4 shadow-pixel-sm",
        className,
      )}
      {...props}
    />
  );
}

type CardTitleProps = ComponentProps<"h2"> & {
  /** Icon hoặc phần tử đứng trước tiêu đề. */
  icon?: ReactNode;
  /** Phần tử căn phải (badge, nút nhỏ...). */
  action?: ReactNode;
};

export function CardTitle({ icon, action, className, children, ...props }: CardTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2
        className={cn("flex items-center gap-2 font-headline text-headline font-extrabold", className)}
        {...props}
      >
        {icon}
        {children}
      </h2>
      {action}
    </div>
  );
}
