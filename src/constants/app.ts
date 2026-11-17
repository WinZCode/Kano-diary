/*
 * Hằng số cấp ứng dụng (không phải công thức dinh dưỡng — những hằng đó sẽ nằm ở file riêng ở Bước 5).
 */

/** Múi giờ mặc định để xác định "hôm nay" của nhật ký. Ghi đè bằng NEXT_PUBLIC_DEFAULT_TIMEZONE. */
export const DEFAULT_TIMEZONE: string = process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE ?? "Asia/Ho_Chi_Minh";
