// Kiểm tra helper ngày: đặc biệt ca lệch múi giờ (UTC vs giờ Việt Nam).
import { describe, expect, it } from "vitest";
import { addDays, formatDateVi, isIsoDate, toIsoDate } from "@/lib/utils/date";

describe("toIsoDate", () => {
  it("dùng ngày theo giờ Việt Nam, không theo UTC", () => {
    // 17:30 UTC ngày 17/11 = 00:30 ngày 18/11 ở Việt Nam
    const instant = new Date("2026-11-17T17:30:00Z");
    expect(toIsoDate(instant, "Asia/Ho_Chi_Minh")).toBe("2026-11-18");
    expect(toIsoDate(instant, "UTC")).toBe("2026-11-17");
  });
});

describe("isIsoDate", () => {
  it.each(["2026-11-17", "2024-02-29"])("chấp nhận %s", (value) => {
    expect(isIsoDate(value)).toBe(true);
  });

  it.each(["2026-02-30", "2025-02-29", "2026-13-01", "17-11-2026", "2026-1-5", "abc", ""])(
    "từ chối %s",
    (value) => {
      expect(isIsoDate(value)).toBe(false);
    },
  );
});

describe("addDays", () => {
  it("qua tháng và qua năm", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
});

describe("formatDateVi", () => {
  it("hiển thị thứ và ngày/tháng/năm", () => {
    const text = formatDateVi("2026-11-17");
    expect(text).toContain("17/11/2026");
    expect(text.toLowerCase()).toContain("thứ ba");
  });
});
