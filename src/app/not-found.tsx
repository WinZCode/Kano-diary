// Trang 404 tiếng Việt (thay trang mặc định tiếng Anh của Next).
import Link from "next/link";
import { buttonStyles, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card tone="pink" className="flex max-w-sm flex-col items-center gap-3 text-center">
        <p className="font-pixel text-display text-primary">404</p>
        <h1 className="font-headline text-headline font-extrabold">Không tìm thấy trang</h1>
        <p className="text-on-surface-variant">Đường dẫn không tồn tại hoặc ngày nhật ký không hợp lệ.</p>
        <Link href="/dashboard" className={buttonStyles({ variant: "primary" })}>
          Về Tổng quan
        </Link>
      </Card>
    </main>
  );
}
