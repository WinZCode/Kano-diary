# CLAUDE.md — Quy ước bắt buộc cho Kano Diary

Đọc file này **trước mọi thay đổi code**. Kiến trúc tổng thể, user flow và công thức xem [README.md](README.md).

---

## 0. Quy tắc làm việc với người dùng

1. **Từng bước một**: làm theo lộ trình ở README §8. Xong một bước → tóm tắt → chờ người dùng xác nhận mới sang bước tiếp.
2. **Code từng file một**, mỗi file có comment rõ ràng (xem §5).
3. **Hỏi xác nhận trước khi viết logic phức tạp**: công thức dinh dưỡng, TDEE thích nghi, schema DB/RLS, auth, bất kỳ thứ gì ảnh hưởng dữ liệu người dùng. Trình bày phương án + lý do, đợi đồng ý.
4. Các điểm "chưa chốt" trong README §3 **không được tự quyết** — phải hỏi.
5. Giao tiếp bằng **tiếng Việt**. Tên biến/hàm/file bằng **tiếng Anh**.
6. Không tự ý thêm thư viện mới ngoài tech stack ở README §1 — hỏi trước, nêu lý do và dung lượng.
7. Không commit/push trừ khi người dùng yêu cầu.

---

## 1. Tech stack (không đổi nếu chưa được đồng ý)

Next.js 16 (App Router, Turbopack, React Compiler, Cache Components) · TypeScript strict · Tailwind CSS v4 · Supabase (Postgres + Auth + RLS) · Zod · React Hook Form · Vitest · Node.js ≥ 22.

- **Next.js 16 có nhiều thay đổi so với các bản cũ** — đọc [AGENTS.md](AGENTS.md) và tài liệu trong `node_modules/next/dist/docs/` trước khi dùng API Next mà chưa chắc chắn.
- Máy có thể mặc định Node 16. Khi chạy lệnh trong shell, dùng Node theo `.nvmrc` (ví dụ thêm `C:\Users\Admin\AppData\Roaming\nvm\v22.8.0` vào đầu PATH của lệnh đó). **Không** chạy `nvm use` toàn máy khi chưa hỏi, vì sẽ ảnh hưởng dự án khác.
- React Compiler đã bật → không cần tự viết `useMemo`/`useCallback` để tối ưu, trừ khi có lý do đo được.

---

## 2. Cấu trúc & ranh giới module

| Thư mục | Được phép | Không được phép |
|---|---|---|
| `src/app/` | Routing, layout, ghép component, gọi `queries` | Logic nghiệp vụ, gọi Supabase trực tiếp, tính toán dinh dưỡng |
| `src/features/<x>/` | components, `actions.ts`, `queries.ts`, `schema.ts`, `index.ts` | Import nội bộ của feature khác (chỉ import qua `index.ts`) |
| `src/lib/calc/` | **Hàm thuần**: input → output | I/O, `fetch`, Supabase, `Date.now()`, `Math.random()`, React |
| `src/components/ui/` | Primitive hiển thị, không biết gì về nghiệp vụ | Gọi API, import từ `features/` |
| `src/constants/` | Hằng số có tên + đơn vị + nguồn | Magic number rải rác trong code |

- Import dùng alias `@/` (ví dụ `@/lib/calc`), không dùng `../../..`.
- Mỗi feature chỉ export ra ngoài qua `index.ts`.

---

## 3. TypeScript

- `strict: true`. **Cấm `any`** — dùng `unknown` + thu hẹp kiểu.
- Không dùng `as` để ép kiểu trừ khi có comment giải thích vì sao an toàn.
- Kiểu dữ liệu form/action **suy ra từ Zod** (`z.infer<typeof schema>`), không khai báo trùng.
- Kiểu DB lấy từ `src/types/database.types.ts` (sinh bằng Supabase CLI), không viết tay.
- Ưu tiên `type` cho kiểu dữ liệu, union literal thay cho `enum` (ví dụ `type Speed = 'slow' | 'medium' | 'fast'`).

---

## 4. Đặt tên

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | PascalCase, file `.tsx` cùng tên | `MealSection.tsx` |
| Hàm, biến | camelCase | `calcTdee`, `dailyTarget` |
| Hằng số | UPPER_SNAKE_CASE | `KCAL_PER_KG_FAT` |
| File không phải component | kebab-case | `date-utils.ts` |
| Bảng/cột DB | snake_case | `food_logs.user_id` |
| Route | kebab-case | `/diary/2026-11-17` |

**Đơn vị phải nằm trong tên** khi là số đo: `weightKg`, `heightCm`, `durationMin`, `waterMl`, `energyKcal`, `proteinG`. Phần trăm lưu dạng **0–1** và đặt tên `bodyFatRatio`; chỉ đổi sang % khi hiển thị.

---

## 5. Comment

- Mỗi file mở đầu bằng 1–3 dòng comment: file này làm gì, thuộc phần nào của luồng.
- Hàm export có JSDoc: mô tả, `@param` kèm đơn vị, `@returns`.
- Hàm trong `lib/calc` ghi **công thức + nguồn** (ví dụ: "Mifflin-St Jeor, 1990" hoặc "sheet Thiết lập, ô C12").
- Comment giải thích **vì sao**, không lặp lại code đang làm gì.
- Comment bằng tiếng Việt.

```ts
/**
 * Tính BMR theo Katch-McArdle (dùng khi có % mỡ).
 * Nguồn: sheet "Thiết lập" của người dùng.
 * @param leanMassKg Khối nạc (kg)
 * @returns BMR (kcal/ngày)
 */
export function calcBmrKatch(leanMassKg: number): number {
  return 370 + 21.6 * leanMassKg;
}
```

---

## 6. Logic tính toán (`src/lib/calc`)

- Chỉ là hàm thuần; mọi hằng số lấy từ `src/constants`.
- **Bắt buộc có unit test** trong `tests/calc/`, gồm ít nhất ca kiểm chứng của sheet (README §3) và các ca biên (thiếu %mỡ, cân mục tiêu ≥ cân hiện tại, calo dưới sàn an toàn).
- Không làm tròn bên trong phép tính trung gian; chỉ làm tròn ở bước hiển thị (`lib/utils/format`).
- Khi tạo kế hoạch, lưu **snapshot** kết quả vào bảng `plans` — đổi công thức sau này không làm sai lịch sử.

---

## 7. Next.js & dữ liệu

- Mặc định **Server Component**. Chỉ thêm `'use client'` khi cần state, event, hoặc browser API — và đặt ở component lá nhỏ nhất có thể.
- Ghi dữ liệu qua **Server Action** trong `features/*/actions.ts`. Mỗi action:
  1. Validate input bằng Zod (`safeParse`).
  2. Lấy user từ Supabase session phía server — **không bao giờ** tin `user_id` gửi từ client.
  3. Ghi DB → `revalidatePath()`.
  4. Trả về `{ ok: true, data } | { ok: false, error }` — không throw lỗi ra UI.
- Đọc dữ liệu trong `queries.ts`, gọi từ Server Component.
- **Cache Components đang bật**: mọi thứ chỉ biết lúc có request — `params`, `searchParams`, `cookies()`, `new Date()`, và hook `usePathname()` / `useParams()` trên route động — phải nằm trong `<Suspense>`, nếu không `npm run build` sẽ lỗi. Mẫu tham khảo: `app/(app)/diary/[date]/page.tsx`, `components/layout/NavLink.tsx`.
- Ngày nhật ký dùng chuỗi `YYYY-MM-DD` theo **giờ địa phương người dùng** (mặc định `Asia/Ho_Chi_Minh`), không dùng `toISOString()` để lấy ngày.

---

## 8. Supabase & bảo mật

- **Mọi bảng bật RLS** với policy `user_id = auth.uid()`. Bảng `foods`: đọc được dòng `user_id is null` (món hệ thống).
- Thay đổi schema chỉ qua file migration trong `supabase/migrations/` (tên `YYYYMMDDHHMMSS_mo_ta.sql`). Không sửa migration đã chạy — tạo migration mới.
- Lấy người dùng ở server **chỉ** qua `getCurrentUser()` (`src/lib/auth/current-user.ts`) — gọi trong `<Suspense>`. Không dùng `supabase.auth.getSession()` ở server để xác thực (không kiểm chữ ký JWT); dùng `getClaims()`.
- `src/proxy.ts` chỉ là kiểm tra "lạc quan" để chuyển trang — **không** thay thế việc kiểm tra user trong Server Action.
- Bảng mới: cột `user_id uuid not null default auth.uid() references auth.users on delete cascade`, bật RLS, policy dùng `(select auth.uid()) = user_id`, GRANT tường minh cho `authenticated`.
- CHECK constraint không được phụ thuộc thời gian hiện tại (`current_date`, `now()`); kiểm tra kiểu đó bằng Zod.
- `service_role` key **chỉ** dùng ở server, không bao giờ có tiền tố `NEXT_PUBLIC_`.
- Không commit `.env.local` hay secret. Biến mới phải thêm vào `.env.example`.

---

## 9. UI & styling

- Phong cách theo mockup [docs/design/kano-mockup.html](docs/design/kano-mockup.html) (pixel / sakura pink).
- Màu, font, bóng, bo góc **chỉ** lấy từ token trong `src/styles/tokens.css` (map vào Tailwind `@theme`). Không hardcode mã màu hex trong component.
  - Class có sẵn: `bg-primary`, `text-on-surface-variant`, `border-outline`, `shadow-pixel` / `-sm` / `-pink` / `-purple` / `-cyan`, `rounded-pixel` / `-lg`, `font-pixel` / `headline` / `body` / `label`, `text-display` / `headline` / `subhead` / `body` / `label`.
  - Thêm token mới → khai báo trong `tokens.css` **và** bổ sung vào `extendTailwindMerge` trong `lib/utils/cn.ts` nếu là cỡ chữ, bóng, bo góc hoặc font.
- `font-pixel` (Silkscreen) **không có dấu tiếng Việt** → chỉ dùng cho số và chữ không dấu.
- **Mobile-first**: viết class cho mobile trước, mở rộng bằng `md:` / `lg:`. Mobile dùng BottomNav, desktop dùng Sidebar.
- Vùng chạm tối thiểu 44×44px; input số dùng `inputMode="decimal"`.
- Hỗ trợ truy cập: label cho mọi input, `alt` cho ảnh, tương phản đủ đọc, điều hướng được bằng bàn phím.
- Gộp class bằng helper `cn()` trong `lib/utils`.
- **Dùng lại primitive trong `@/components/ui`** (Button, Card, Field, Input, Select, Badge, ProgressBar, SegmentedControl, StatCard, PixelIcon) trước khi tự viết style mới. Primitive mới → thêm vào `components/ui/index.ts` và trưng bày ở trang `/ui`.
- Link trông như nút: `<Link className={buttonStyles({ variant: "primary" })}>` — điều hướng dùng link, hành động dùng `<Button>`.
- Icon: chỉ dùng `PixelIcon` (lưới 12×12 trong `pixel-icons.ts`), không thêm thư viện icon.

---

## 10. Kiểm tra trước khi báo xong

```bash
npm run lint
npm run typecheck   # tsc --noEmit
npm test
```

Cả ba phải pass. Nếu có lỗi chưa sửa được, báo rõ cho người dùng kèm output — không được nói "đã xong" khi còn lỗi.

Sau mỗi bước, cập nhật checklist lộ trình trong README §8.
