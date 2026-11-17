// Validate form đăng nhập / đăng ký.
import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/features/auth/errors";
import { loginSchema, registerSchema } from "@/features/auth/schema";

const validRegister = {
  displayName: "Kano",
  email: "kano@example.com",
  password: "matkhau123",
  confirmPassword: "matkhau123",
};

describe("loginSchema", () => {
  it("chuẩn hóa email (bỏ khoảng trắng, chữ thường)", () => {
    const result = loginSchema.parse({ email: "  Kano@Example.COM ", password: "x" });
    expect(result.email).toBe("kano@example.com");
  });

  it("từ chối email sai định dạng", () => {
    expect(loginSchema.safeParse({ email: "kano@", password: "x" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("chấp nhận dữ liệu hợp lệ", () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it("báo lỗi ở confirmPassword khi không khớp", () => {
    const result = registerSchema.safeParse({ ...validRegister, confirmPassword: "khac123456" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
  });

  it("mật khẩu ngắn hơn 8 ký tự bị từ chối", () => {
    const result = registerSchema.safeParse({ ...validRegister, password: "1234567", confirmPassword: "1234567" });
    expect(result.success).toBe(false);
  });

  it("tên hiển thị chỉ có khoảng trắng bị từ chối", () => {
    expect(registerSchema.safeParse({ ...validRegister, displayName: "   " }).success).toBe(false);
  });
});

describe("authErrorMessage", () => {
  it("dịch mã lỗi đã biết, mã lạ dùng thông báo chung", () => {
    expect(authErrorMessage("invalid_credentials")).toBe("Email hoặc mật khẩu không đúng.");
    expect(authErrorMessage("something_new")).toBe("Có lỗi xảy ra. Vui lòng thử lại.");
    expect(authErrorMessage(undefined)).toBe("Có lỗi xảy ra. Vui lòng thử lại.");
  });
});
