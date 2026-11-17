/*
 * Vẽ icon pixel từ lưới trong pixel-icons.ts bằng SVG. Màu theo currentColor → đổi màu bằng class text-*.
 */
import { cn } from "@/lib/utils/cn";
import { PIXEL_ICON_SIZE, PIXEL_ICONS, type PixelIconName } from "./pixel-icons";

type PixelIconProps = {
  name: PixelIconName;
  /** Kích thước hiển thị (px). Nên là bội số của 12 để pixel sắc nét. */
  size?: number;
  /** Có label → icon được đọc bởi trình đọc màn hình; không có → chỉ trang trí (aria-hidden). */
  label?: string;
  className?: string;
};

export function PixelIcon({ name, size = 24, label, className }: PixelIconProps) {
  const rows = PIXEL_ICONS[name];
  return (
    <svg
      viewBox={`0 0 ${PIXEL_ICON_SIZE} ${PIXEL_ICON_SIZE}`}
      width={size}
      height={size}
      fill="currentColor"
      shapeRendering="crispEdges" // giữ cạnh pixel, không khử răng cưa
      className={cn("shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null,
        ),
      )}
    </svg>
  );
}
