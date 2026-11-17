/*
 * Form đăng ký. Nếu Supabase bật xác nhận email, form được thay bằng thông báo "kiểm tra email".
 */
"use client";

import { useActionState } from "react";
import { Button, Field, fieldDescribedBy, Input } from "@/components/ui";
import { IDLE_FORM_STATE, type FormState } from "@/types/form-state";
import { signUp } from "../actions";
import { PASSWORD_MIN_LENGTH, type RegisterField } from "../schema";
import { FormMessage } from "./FormMessage";

export function RegisterForm() {
  const [state, action, pending] = useActionState<FormState<RegisterField>, FormData>(signUp, IDLE_FORM_STATE);

  if (state.status === "success") return <FormMessage tone="success">{state.message}</FormMessage>;

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const values = state.status === "error" ? (state.values ?? {}) : {};
  const describedBy = (id: RegisterField, hint = false) => fieldDescribedBy(id, { hint, error: Boolean(errors[id]) });

  return (
    <form action={action} className="grid gap-4" noValidate>
      {state.status === "error" && state.message && <FormMessage tone="error">{state.message}</FormMessage>}

      <Field htmlFor="displayName" label="Tên hiển thị" error={errors.displayName}>
        <Input
          id="displayName"
          name="displayName"
          autoComplete="nickname"
          maxLength={50}
          defaultValue={values.displayName}
          invalid={Boolean(errors.displayName)}
          aria-describedby={describedBy("displayName")}
          required
        />
      </Field>

      <Field htmlFor="email" label="Email" error={errors.email}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          defaultValue={values.email}
          invalid={Boolean(errors.email)}
          aria-describedby={describedBy("email")}
          required
        />
      </Field>

      <Field
        htmlFor="password"
        label="Mật khẩu"
        hint={`Tối thiểu ${PASSWORD_MIN_LENGTH} ký tự`}
        error={errors.password}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          invalid={Boolean(errors.password)}
          aria-describedby={describedBy("password", true)}
          required
        />
      </Field>

      <Field htmlFor="confirmPassword" label="Nhập lại mật khẩu" error={errors.confirmPassword}>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          invalid={Boolean(errors.confirmPassword)}
          aria-describedby={describedBy("confirmPassword")}
          required
        />
      </Field>

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
