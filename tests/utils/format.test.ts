// Định dạng số kiểu Việt Nam và quy tắc làm tròn đã chốt (số nguyên gần nhất).
import { describe, expect, it } from "vitest";
import { formatDecimal, formatInteger, formatPercent, formatSignedInteger } from "@/lib/utils/format";

describe("formatInteger", () => {
  it("làm tròn số nguyên gần nhất, ngăn nghìn bằng dấu chấm", () => {
    expect(formatInteger(1906.88)).toBe("1.907");
    expect(formatInteger(2406.4)).toBe("2.406");
  });

  it("không hiện -0", () => {
    expect(formatInteger(-0.3)).toBe("0");
  });
});

describe("formatDecimal", () => {
  it("dấu phẩy thập phân, bỏ số 0 thừa", () => {
    expect(formatDecimal(82.4)).toBe("82,4");
    expect(formatDecimal(83)).toBe("83");
    expect(formatDecimal(63.91)).toBe("63,9");
  });
});

describe("formatPercent", () => {
  it("tỉ lệ 0–1 sang %", () => {
    expect(formatPercent(0.23)).toBe("23%");
    expect(formatPercent(0.0871)).toBe("8,7%");
  });
});

describe("formatSignedInteger", () => {
  it("có dấu", () => {
    expect(formatSignedInteger(-500)).toBe("−500");
    expect(formatSignedInteger(500)).toBe("+500");
    expect(formatSignedInteger(0.2)).toBe("0");
  });
});
