// Đảm bảo mọi icon pixel đúng lưới 12×12 và chỉ chứa "#" / "." — tránh icon méo khi thêm mới.
import { describe, expect, it } from "vitest";
import { PIXEL_ICON_SIZE, PIXEL_ICONS } from "@/components/ui/pixel-icons";

describe("PIXEL_ICONS", () => {
  it.each(Object.entries(PIXEL_ICONS))("%s có lưới 12×12 hợp lệ", (_name, rows) => {
    expect(rows).toHaveLength(PIXEL_ICON_SIZE);
    for (const row of rows) {
      expect(row).toMatch(new RegExp(`^[#.]{${PIXEL_ICON_SIZE}}$`));
    }
  });
});
