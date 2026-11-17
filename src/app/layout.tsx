/*
 * Root layout: nạp font qua next/font (tự host, không gọi Google lúc chạy) và gắn biến font lên <html>.
 * Tên biến --font-*-src được tokens.css dùng để dựng --font-body / --font-headline / ...
 */
import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono, Silkscreen } from "next/font/google";
import "./globals.css";

// Font body — có bộ ký tự tiếng Việt (thay DM Sans của mockup).
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-src",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Font tiêu đề & nhãn — có tiếng Việt.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains-src",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Font pixel — KHÔNG có dấu tiếng Việt, chỉ dùng cho số và chữ không dấu.
const silkscreen = Silkscreen({
  variable: "--font-silkscreen-src",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kano Diary",
    template: "%s · Kano Diary",
  },
  description: "Nhật ký sức khỏe giúp bạn kiểm soát cân nặng: calo, macro, nước, giấc ngủ và vận động.",
  applicationName: "Kano Diary",
};

export const viewport: Viewport = {
  themeColor: "#c21875", // = --primary; thanh trình duyệt trên mobile
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${jetbrains.variable} ${silkscreen.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
