/*
 * Kiểu trạng thái trả về từ Server Action dùng cho form (useActionState).
 * Mở rộng quy ước { ok } của CLAUDE.md §7 với lỗi từng trường + giá trị đã nhập
 * (React 19 reset form sau khi submit, nên cần trả lại giá trị để điền lại — trừ mật khẩu).
 */
export type FormState<Field extends string> =
  | { status: "idle" }
  | {
      status: "error";
      /** Lỗi chung, hiển thị trên đầu form. */
      message?: string;
      fieldErrors?: Partial<Record<Field, string>>;
      values?: Partial<Record<Field, string>>;
    }
  | { status: "success"; message: string };

export const IDLE_FORM_STATE = { status: "idle" } as const;
