/*
 * Tiêu đề đầu mỗi trang: nhãn nhỏ (eyebrow) + tiêu đề lớn + mô tả + vùng nút hành động bên phải.
 */
import type { ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="font-label text-label font-bold text-on-surface-variant">{eyebrow}</p>}
        <h1 className="font-headline text-display font-extrabold">{title}</h1>
        {description && <p className="mt-1 text-on-surface-variant">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
