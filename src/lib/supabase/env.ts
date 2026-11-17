/*
 * Đọc & kiểm tra biến môi trường Supabase. Lỗi rõ ràng (tiếng Việt) nếu chưa điền .env.local,
 * thay vì lỗi khó hiểu từ thư viện.
 * Lưu ý: phải viết process.env.NEXT_PUBLIC_... nguyên văn để Next nhúng được giá trị vào bundle trình duyệt.
 */
import { z } from "zod";

const envSchema = z.object({
  url: z
    .url()
    .refine((value) => !value.includes("your-project"), "đang là giá trị mẫu")
    // Hay copy nhầm URL của Data API (…supabase.co/rest/v1/) — chỉ được là gốc https://xxx.supabase.co
    .refine((value) => new URL(value).pathname === "/", "chỉ điền phần gốc https://xxx.supabase.co, bỏ /rest/v1/"),
  anonKey: z
    .string()
    .min(20, "quá ngắn")
    .refine((value) => value !== "your-anon-key", "đang là giá trị mẫu"),
});

export type SupabaseEnv = z.infer<typeof envSchema>;

/** Trả về URL + anon key; ném lỗi hướng dẫn cách sửa nếu thiếu / sai. Gọi lúc dùng, không gọi lúc import. */
export function getSupabaseEnv(): SupabaseEnv {
  const parsed = envSchema.safeParse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(
      `Chưa cấu hình Supabase (${detail}). Điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY ` +
        "trong .env.local (xem README §7), rồi khởi động lại npm run dev.",
    );
  }
  return parsed.data;
}
