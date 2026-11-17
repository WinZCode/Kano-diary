/*
 * Zod schema cho đăng nhập / đăng ký — dùng chung để validate ở Server Action.
 */
import { z } from "zod";

const email = z.string().trim().toLowerCase().pipe(z.email("Email không hợp lệ"));

export const PASSWORD_MIN_LENGTH = 8;

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Nhập mật khẩu"),
});

export const registerSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1, "Nhập tên hiển thị")
      .max(50, "Tên tối đa 50 ký tự"),
    email,
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Mật khẩu tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`)
      .max(72, "Mật khẩu tối đa 72 ký tự"), // giới hạn của bcrypt mà Supabase dùng
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu nhập lại không khớp",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginField = keyof LoginInput;
export type RegisterField = keyof RegisterInput;
