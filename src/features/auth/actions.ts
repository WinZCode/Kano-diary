/*
 * Server Actions xác thực: đăng nhập, đăng ký, đăng xuất.
 * Luồng chuẩn (CLAUDE.md §7): validate bằng Zod → gọi Supabase → chuyển trang / trả lỗi.
 */
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { LOGIN_PATH, safeNextPath } from "@/lib/auth/routes";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/types/form-state";
import { authErrorMessage, logAuthError } from "./errors";
import { loginSchema, registerSchema, type LoginField, type RegisterField } from "./schema";

/** Lấy giá trị chuỗi từ FormData (bỏ qua file). */
function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

/** Gom lỗi Zod thành { tênTrường: thôngBáoĐầuTiên }. */
function firstFieldErrors<Field extends string>(error: z.ZodError): Partial<Record<Field, string>> {
  const result: Partial<Record<Field, string>> = {};
  for (const [field, messages] of Object.entries(z.flattenError(error).fieldErrors)) {
    if (Array.isArray(messages) && messages[0]) result[field as Field] = messages[0]; // key lấy từ chính schema
  }
  return result;
}

export async function signIn(_prev: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const values = { email: text(formData, "email") };
  const parsed = loginSchema.safeParse({ email: values.email, password: text(formData, "password") });
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors<LoginField>(parsed.error), values };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    logAuthError("signIn", error);
    return { status: "error", message: authErrorMessage(error.code), values };
  }

  // redirect() phải nằm ngoài try/catch vì nó hoạt động bằng cách ném lỗi đặc biệt.
  redirect(safeNextPath(text(formData, "next")));
}

export async function signUp(
  _prev: FormState<RegisterField>,
  formData: FormData,
): Promise<FormState<RegisterField>> {
  const values = { displayName: text(formData, "displayName"), email: text(formData, "email") };
  const parsed = registerSchema.safeParse({
    ...values,
    password: text(formData, "password"),
    confirmPassword: text(formData, "confirmPassword"),
  });
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors<RegisterField>(parsed.error), values };
  }

  // Link xác nhận email trỏ về chính site đang chạy (localhost khi dev, domain thật khi deploy).
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName }, // trigger DB copy sang bảng profiles
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });
  if (error) {
    logAuthError("signUp", error);
    return { status: "error", message: authErrorMessage(error.code), values };
  }

  // Bật "Confirm email" trên Supabase → chưa có phiên, người dùng phải mở email trước.
  if (!data.session) {
    return {
      status: "success",
      message: `Đã gửi email xác nhận tới ${parsed.data.email}. Mở link trong email để kích hoạt tài khoản.`,
    };
  }
  redirect("/onboarding"); // tài khoản mới → nhập dữ liệu cá nhân trước
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(LOGIN_PATH);
}
