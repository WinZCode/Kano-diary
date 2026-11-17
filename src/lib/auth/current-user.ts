/*
 * Data Access Layer cho người dùng hiện tại: nơi DUY NHẤT đọc phiên đăng nhập ở server.
 * Mọi Server Action / truy vấn cần user gọi getCurrentUser() — không nhận user_id từ client.
 * Đọc cookie → phải gọi bên trong <Suspense> (Cache Components).
 */
import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_PATH } from "./routes";

/** Thông tin tối thiểu về người dùng — không trả nguyên token/session ra ngoài. */
export type CurrentUser = {
  id: string;
  email: string | null;
  displayName: string | null;
};

/**
 * Lấy người dùng đang đăng nhập; chưa đăng nhập → chuyển về /login.
 * Bọc cache() của React để nhiều component trong cùng request chỉ xác thực 1 lần.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) redirect(LOGIN_PATH);

  const metadata: unknown = claims.user_metadata;
  const displayName =
    typeof metadata === "object" && metadata !== null && "display_name" in metadata
      ? String(metadata.display_name)
      : null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    displayName,
  };
});
