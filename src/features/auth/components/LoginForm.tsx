/*
 * Form đăng nhập. Client Component vì dùng useActionState (trạng thái đang gửi + lỗi trả về).
 * ?next= trên URL (do proxy gắn) được gửi kèm để quay lại đúng trang sau khi đăng nhập.
 */
"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button, Field, fieldDescribedBy, Input } from "@/components/ui";
import { IDLE_FORM_STATE, type FormState } from "@/types/form-state";
import { signIn } from "../actions";
import type { LoginField } from "../schema";
import { FormMessage } from "./FormMessage";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  // /auth/callback chuyển về đây với ?error=confirm_failed khi link email hết hạn / đã dùng.
  const confirmFailed = searchParams.get("error") === "confirm_failed";
  const [state, action, pending] = useActionState<FormState<LoginField>, FormData>(signIn, IDLE_FORM_STATE);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <form action={action} className="grid gap-4" noValidate>
      {state.status === "error" && state.message && <FormMessage tone="error">{state.message}</FormMessage>}
      {confirmFailed && state.status === "idle" && (
        <FormMessage tone="error">Link xác nhận không hợp lệ hoặc đã hết hạn. Hãy đăng nhập hoặc đăng ký lại.</FormMessage>
      )}
      <input type="hidden" name="next" value={next} />

      <Field htmlFor="email" label="Email" error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          defaultValue={values.email}
          invalid={Boolean(errors.email)}
          aria-describedby={fieldDescribedBy("email", { error: Boolean(errors.email) })}
          required
        />
      </Field>

      <Field htmlFor="password" label="Mật khẩu" error={errors.password}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          invalid={Boolean(errors.password)}
          aria-describedby={fieldDescribedBy("password", { error: Boolean(errors.password) })}
          required
        />
      </Field>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </form>
  );
}
