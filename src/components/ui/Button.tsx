/*
 * Nút pixel (mockup .btn): viền 2px, bóng khối, hover nhấc lên 1px, nhấn lún xuống.
 * Dùng buttonStyles() để áp cùng giao diện cho <Link> (điều hướng nên là link, không phải button).
 */
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

export type ButtonVariant = "default" | "primary" | "secondary" | "cyan" | "danger";
export type ButtonSize = "md" | "sm";

const BASE =
  "inline-flex cursor-pointer items-center justify-center gap-1 rounded-pixel border-2 border-outline " +
  "font-headline font-bold shadow-pixel-sm select-none " +
  "transition-[transform,background-color,box-shadow] duration-100 ease-pixel-out " +
  "not-disabled:hover:-translate-x-px not-disabled:hover:-translate-y-px not-disabled:hover:shadow-[3px_3px_0_var(--outline)] " +
  "not-disabled:active:translate-x-0.5 not-disabled:active:translate-y-0.5 not-disabled:active:shadow-none " +
  "disabled:cursor-not-allowed disabled:opacity-55";

const VARIANTS: Record<ButtonVariant, string> = {
  default: "bg-surface text-on-surface not-disabled:hover:bg-surface-container",
  primary: "bg-primary text-on-primary not-disabled:hover:bg-primary-hover",
  secondary: "bg-secondary text-on-primary not-disabled:hover:bg-on-surface",
  cyan: "bg-tertiary text-on-primary not-disabled:hover:bg-on-surface",
  danger: "border-error bg-error-container text-error",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-4 py-1 text-sm", // 44px — vùng chạm tối thiểu trên mobile
  sm: "min-h-9 px-2.5 py-1 text-[0.8125rem]",
};

/**
 * Trả về className của nút pixel — dùng cho <Link> hoặc phần tử khác muốn trông như nút.
 * @example <Link href="/plan" className={buttonStyles({ variant: "primary" })}>Xem kế hoạch</Link>
 */
export function buttonStyles({
  variant = "default",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  // type mặc định "button" để không vô tình submit form.
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
