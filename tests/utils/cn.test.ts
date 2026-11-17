// Kiểm tra cn() gộp class đúng, đặc biệt với các token tùy biến của Kano.
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";

describe("cn", () => {
  it("bỏ giá trị falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("class sau ghi đè class trước cùng nhóm", () => {
    expect(cn("bg-primary", "bg-secondary")).toBe("bg-secondary");
  });

  it("giữ cả cỡ chữ token và màu chữ (không nhầm text-label là màu)", () => {
    expect(cn("text-label", "text-primary")).toBe("text-label text-primary");
  });

  it("ghi đè shadow pixel", () => {
    expect(cn("shadow-pixel", "shadow-pixel-pink")).toBe("shadow-pixel-pink");
  });
});
