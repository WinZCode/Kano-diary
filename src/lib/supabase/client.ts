/*
 * Supabase client phía trình duyệt (Client Component). Dùng cho tính năng cần chạy ở client
 * như realtime; ghi dữ liệu thông thường vẫn đi qua Server Action (CLAUDE.md §7).
 */
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
