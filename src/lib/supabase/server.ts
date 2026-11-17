/*
 * Supabase client phía server (Server Component, Server Action, Route Handler).
 * Phiên đăng nhập nằm trong cookie; client đọc/ghi cookie qua next/headers.
 * Mỗi request tạo client mới — không dùng chung client giữa các người dùng.
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component không được ghi cookie → bỏ qua. Proxy (src/proxy.ts) đã làm mới phiên trước đó.
        }
      },
    },
  });
}
