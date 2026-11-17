// Quy tắc điều hướng theo đăng nhập + chống open redirect cho ?next=.
import { describe, expect, it } from "vitest";
import { resolveAuthRedirect, safeNextPath } from "@/lib/auth/routes";

describe("resolveAuthRedirect", () => {
  it("chưa đăng nhập vào trang app → /login kèm next", () => {
    expect(resolveAuthRedirect("/diary/2026-11-17", "", false)).toBe("/login?next=%2Fdiary%2F2026-11-17");
    expect(resolveAuthRedirect("/plan", "?tab=macro", false)).toBe("/login?next=%2Fplan%3Ftab%3Dmacro");
  });

  it("chưa đăng nhập vào / → /login không kèm next", () => {
    expect(resolveAuthRedirect("/", "", false)).toBe("/login");
  });

  it("chưa đăng nhập vẫn vào được trang đăng nhập / đăng ký / callback", () => {
    expect(resolveAuthRedirect("/login", "", false)).toBeNull();
    expect(resolveAuthRedirect("/register", "", false)).toBeNull();
    expect(resolveAuthRedirect("/auth/callback", "?code=abc", false)).toBeNull();
  });

  it("đã đăng nhập mà vào /login, /register → về trang chính", () => {
    expect(resolveAuthRedirect("/login", "", true)).toBe("/dashboard");
    expect(resolveAuthRedirect("/register", "", true)).toBe("/dashboard");
  });

  it("đã đăng nhập vào trang app → cho qua", () => {
    expect(resolveAuthRedirect("/dashboard", "", true)).toBeNull();
  });

  it("không nhầm đường dẫn chỉ có tiền tố giống", () => {
    expect(resolveAuthRedirect("/login-help", "", false)).toBe("/login?next=%2Flogin-help");
    expect(resolveAuthRedirect("/authx", "", false)).toBe("/login?next=%2Fauthx");
  });
});

describe("safeNextPath", () => {
  it("giữ đường dẫn nội bộ", () => {
    expect(safeNextPath("/diary/2026-11-17")).toBe("/diary/2026-11-17");
  });

  it.each([null, undefined, "", "https://evil.com", "//evil.com", "/\\evil.com", "javascript:alert(1)"])(
    "chặn %s → trang chính",
    (value) => {
      expect(safeNextPath(value)).toBe("/dashboard");
    },
  );
});
