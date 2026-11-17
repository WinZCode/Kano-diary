# Kano Diary 🌸

Web app theo dõi sức khỏe giúp người dùng **kiểm soát cân nặng**: nhập chỉ số cơ thể → đặt mục tiêu → app tự tính calo, macro, thời gian → ghi nhật ký hằng ngày → theo dõi tiến độ đến khi đạt mục tiêu.

Chạy tốt trên cả **desktop và mobile** (responsive, có thể cài như app — PWA).

---

## 1. Tech stack

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, React Compiler) + **TypeScript** (strict) | Server Components mặc định, Cache Components bật |
| Styling | **Tailwind CSS v4** | Design token lấy từ mockup KANO (pixel / sakura pink) |
| Backend | **Supabase** | Postgres + Auth + Row Level Security (RLS) |
| Validation | **Zod** | Dùng chung cho form và server action |
| Form | React Hook Form | |
| Biểu đồ | SVG tự vẽ (phong cách pixel như mockup) | Không kéo thư viện chart nặng |
| Test | **Vitest** | Bắt buộc cho toàn bộ `src/lib/calc` |
| Runtime | **Node.js 22 LTS** | Next.js mới không chạy trên Node 16 |
| Deploy | Vercel + Supabase Cloud | |

---

## 2. Luồng người dùng (User Flow)

```
Đăng ký / Đăng nhập
        │
        ▼
Onboarding (nhập 1 lần, sửa được sau)
  ├─ Bước 1: Chỉ số cơ thể — giới tính, tuổi, chiều cao, cân nặng, % mỡ (tùy chọn)
  ├─ Bước 2: Mức vận động — Ít / Nhẹ / Vừa / Nhiều
  └─ Bước 3: Mục tiêu — cân nặng mong muốn + tốc độ (Chậm / Vừa / Nhanh)
        │
        ▼
Kế hoạch tự động (Plan)
  BMR → TDEE → Calo mục tiêu/ngày → Macro (P/C/F) → Số tuần → Ngày dự kiến đạt
        │
        ▼
Nhật ký hằng ngày (Diary)
  Bữa ăn (Sáng/Trưa/Tối/Phụ) · Vận động · Nước · Giấc ngủ · Cân sáng
  → Calo còn lại = Mục tiêu − Nạp + Đốt
        │
        ▼
Tiến độ (Progress)
  Tổng kết tuần · Xu hướng cân nặng · Số ngày đạt mục tiêu · Điều chỉnh kế hoạch
        │
        ▼
Đạt mục tiêu → chuyển sang chế độ Duy trì (Maintenance)
```

---

## 3. Công thức tính (nguồn: sheet "Thiết lập" của người dùng)

Toàn bộ nằm trong `src/lib/calc/` dưới dạng **hàm thuần** (pure function), có unit test.

| Chỉ số | Công thức |
|---|---|
| Khối nạc (LBM) | `cân nặng × (1 − %mỡ)` |
| BMR, **có** %mỡ | Katch-McArdle: `370 + 21.6 × LBM` |
| BMR, **không có** %mỡ | Mifflin-St Jeor: `10×kg + 6.25×cm − 5×tuổi + 5` (nam) / `− 161` (nữ) |
| Hệ số vận động | Ít 1.2 · Nhẹ 1.375 · Vừa 1.55 · Nhiều 1.725 |
| TDEE | `BMR × hệ số vận động` |
| Calo mục tiêu/ngày | `TDEE − thâm hụt` |
| Protein | `2.2 g × LBM` |
| Số tuần dự kiến | `ceil(kg cần giảm × 7700 / (thâm hụt × 7))` |
| %mỡ ở cân mục tiêu | `1 − LBM / cân mục tiêu` (giả định giữ nguyên khối nạc) |
| Năng lượng của mỡ | 1 kg mỡ ≈ 7.700 kcal |

Kiểm chứng với số liệu sheet: Nam, 25 tuổi, 171 cm, 83 kg, 23% mỡ, vận động Nhẹ, thâm hụt 500 → LBM 63.9 · BMR 1.750 · TDEE 2.406 · Mục tiêu 1.906 kcal · Protein 141 g · 29 tuần.

### Quy tắc đã chốt (2026-11-17)
| Chủ đề | Quy tắc |
|---|---|
| Mục tiêu | **Giảm / Duy trì / Tăng** cân |
| Tốc độ | Chênh **250 / 500 / 750 kcal/ngày** (Chậm / Vừa / Nhanh) — giảm = thâm hụt, tăng = thặng dư |
| Sàn calo (khi giảm) | Không dưới **1.500 kcal (nam) / 1.200 kcal (nữ)**; dưới BMR chỉ **cảnh báo**. Áp sàn → tính lại số tuần theo thâm hụt thực tế. TDEE < sàn → ăn bằng TDEE, khuyên tăng vận động |
| Chia macro | Nhiều lựa chọn như [calculator.net](https://www.calculator.net/macro-calculator.html), quy đổi 4/4/9 kcal/g |

| Kiểu macro | Protein | Carb | Fat |
|---|---|---|---|
| **Theo sheet** (mặc định, cần % mỡ) | 2.2 g × khối nạc | phần còn lại | 25% |
| Cân bằng | 25% | 50% | 25% |
| Ít béo | 27.5% | 52.5% | 20% |
| Ít carb | 30% | 40% | 30% |
| Nhiều đạm | 35% | 42.5% | 22.5% |

Kèm giới hạn: đường < 10% calo, chất béo bão hòa < 10% calo.
Code: `src/lib/calc/` (hàm `calcPlan` tổng hợp), hằng số ở `src/constants/nutrition.ts`, test ở `tests/calc/`.

---

## 4. Tính năng

### MVP (giai đoạn 1)
1. **Tài khoản & cá nhân hóa** — đăng nhập Supabase, mỗi tài khoản có hồ sơ + kế hoạch riêng.
2. **Onboarding & Kế hoạch tự động** — tính BMR/TDEE/macro/thời gian như sheet.
3. **Nhật ký ăn uống** — theo 4 bữa, món ăn Việt Nam có sẵn + món tự tạo, khẩu phần, calo/P/C/F.
4. **Nhật ký vận động, nước, giấc ngủ, cân sáng**.
5. **Dashboard & Tiến độ** — calo còn lại hôm nay, biểu đồ 7 ngày, tổng kết tuần, xu hướng cân nặng.

### Đề xuất bổ sung để app tracking "đầy đủ"
| Nhóm | Tính năng | Lý do |
|---|---|---|
| Kế hoạch thông minh | **TDEE thích nghi**: mỗi tuần so cân thực tế với dự kiến, tự điều chỉnh calo | Công thức chỉ là ước tính; cơ thể thực tế khác |
| | Cảnh báo sàn calo / tốc độ giảm quá nhanh | An toàn sức khỏe |
| | Chế độ **Duy trì** sau khi đạt mục tiêu, **diet break** | Tránh tăng cân lại |
| Nhập liệu nhanh | Món yêu thích, "Copy bữa hôm qua", bữa ăn mẫu | Giảm ma sát — lý do số 1 người dùng bỏ app |
| | Thư viện hoạt động theo **MET** (100+ môn như mockup) | Tính calo đốt chính xác theo cân nặng |
| Theo dõi cơ thể | Số đo (eo, hông, ngực…), ảnh tiến độ | Cân có thể đứng yên trong khi vóc dáng thay đổi |
| | Đường xu hướng cân (trung bình trượt 7 ngày) | Lọc nhiễu nước/muối hằng ngày |
| Động lực | Streak ghi nhật ký, huy hiệu pixel, mốc giảm cân | Duy trì thói quen |
| | Nhắc nhở uống nước / ghi bữa / cân sáng (PWA notification) | |
| Dữ liệu | **Import từ Google Sheet hiện tại**, export CSV | Không mất dữ liệu cũ |
| Nền tảng | PWA: cài lên màn hình chính, dùng offline cơ bản | Trải nghiệm như app native trên mobile |

---

## 5. Kiến trúc thư mục

```
kano-diary/
├── CLAUDE.md                  # Quy ước code bắt buộc (đọc trước khi code)
├── README.md
├── .env.example               # Biến môi trường mẫu (không chứa secret thật)
├── docs/
│   └── design/
│       └── kano-mockup.html   # Mockup gốc — nguồn design token
├── public/
│   └── icons/                 # Icon PWA, favicon
├── supabase/
│   └── migrations/            # SQL: bảng, index, RLS policy (đánh số theo thời gian)
├── tests/
│   └── calc/                  # Unit test cho src/lib/calc
└── src/
    ├── app/                   # Next.js App Router — CHỈ routing + ghép layout
    │   ├── (auth)/            # Nhóm route chưa đăng nhập
    │   │   ├── login/
    │   │   └── register/
    │   ├── (app)/             # Nhóm route đã đăng nhập (layout có nav)
    │   │   ├── onboarding/    # Wizard nhập dữ liệu + mục tiêu
    │   │   ├── dashboard/     # Tổng quan hôm nay
    │   │   ├── diary/[date]/  # Nhật ký 1 ngày (YYYY-MM-DD)
    │   │   ├── plan/          # Kế hoạch: BMR, TDEE, macro, timeline
    │   │   ├── progress/      # Tổng kết tuần, biểu đồ cân nặng
    │   │   └── settings/      # Hồ sơ, đơn vị, tài khoản
    │   ├── layout.tsx
    │   └── globals.css        # Import Tailwind + tokens
    ├── components/
    │   ├── ui/                # Primitive pixel: Button, PixelCard, Input, Badge, ProgressBar…
    │   ├── layout/            # AppShell, BottomNav (mobile), Sidebar (desktop), Header
    │   └── charts/            # Biểu đồ SVG pixel: CalorieBarChart, WeightLineChart
    ├── features/              # Mỗi tính năng tự chứa: components + actions + queries + schema
    │   ├── profile/
    │   ├── plan/
    │   ├── food-log/
    │   ├── exercise-log/
    │   ├── water/
    │   ├── sleep/
    │   └── weight/
    ├── lib/
    │   ├── calc/              # ⭐ Hàm thuần: bmr, tdee, macros, timeline, adaptive — KHÔNG I/O
    │   ├── supabase/          # client.ts (browser), server.ts (server), middleware helper
    │   └── utils/             # format số/ngày, cn(), date helpers
    ├── constants/             # Hệ số vận động, kcal/kg mỡ, ngưỡng an toàn…
    ├── data/                  # Seed: món ăn Việt Nam, bảng MET hoạt động
    ├── types/                 # Kiểu dùng chung + type sinh từ Supabase (database.types.ts)
    └── styles/
        └── tokens.css         # Design token từ mockup → Tailwind @theme
```

### Cấu trúc bên trong một feature (ví dụ `features/food-log/`)
```
food-log/
├── components/     # FoodEntryForm, MealSection, FoodSearch…
├── actions.ts      # Server Actions (ghi dữ liệu) — luôn validate bằng Zod
├── queries.ts      # Hàm đọc dữ liệu từ Supabase (server)
├── schema.ts       # Zod schema + type suy ra
└── index.ts        # Public API của feature
```

### Luồng dữ liệu
```
UI (Client Component)
   │  submit form
   ▼
Server Action (features/*/actions.ts)
   │  1. Zod validate   2. lấy user từ Supabase session
   ▼
Supabase Postgres  ── RLS: user chỉ đọc/ghi dòng có user_id = auth.uid()
   │
   ▼
revalidatePath() → Server Component đọc lại (queries.ts) → render
```
Mọi phép tính dinh dưỡng gọi `src/lib/calc` — **không** tính toán rải rác trong component.

---

## 6. Mô hình dữ liệu (dự kiến)

| Bảng | Nội dung chính |
|---|---|
| `profiles` | user_id, tên, giới tính, ngày sinh, chiều cao, đơn vị |
| `plans` | user_id, cân bắt đầu, %mỡ, cân mục tiêu, mức vận động, tốc độ, thâm hụt, ngày bắt đầu, **snapshot** BMR/TDEE/calo/macro, trạng thái (active/archived) |
| `foods` | món ăn: tên, khẩu phần chuẩn, kcal, P/C/F; `user_id = null` là món hệ thống |
| `food_logs` | user_id, ngày, bữa (breakfast/lunch/dinner/snack), food_id, số khẩu phần, kcal/P/C/F đã tính |
| `exercise_logs` | user_id, ngày, hoạt động, phút, kcal đốt |
| `water_logs` | user_id, ngày, ml |
| `sleep_logs` | user_id, ngày, số giờ, chất lượng (1–5) |
| `weight_logs` | user_id, ngày, kg, %mỡ (tùy chọn) |

Mọi bảng có RLS. Tổng kết ngày/tuần tính bằng SQL view hoặc trong `lib/calc`, không lưu trùng.

---

## 7. Chạy dự án

> Yêu cầu: **Node.js ≥ 22** (phiên bản ghi trong `.nvmrc`), tài khoản Supabase.

```bash
nvm use 22.8.0               # hoặc dùng bất kỳ Node ≥ 22
npm install
cp .env.example .env.local   # điền URL + anon key của Supabase
npm run dev                  # http://localhost:3000
```

| Script | Việc làm |
|---|---|
| `npm run dev` | Chạy dev server (Turbopack) |
| `npm run build` | Build production |
| `npm run lint` | ESLint (cấu hình Next core-web-vitals + TypeScript) |
| `npm run typecheck` | Sinh type route (`next typegen`) rồi chạy `tsc --noEmit` |
| `npm test` | Unit test bằng Vitest (`tests/**/*.test.ts`) |

> Lưu ý: Next.js 16 không chạy trên Node 16. Nếu máy mặc định Node cũ, chuyển bằng `nvm use` trước khi chạy.

### Cài đặt Supabase (1 lần)
1. Tạo project tại [supabase.com](https://supabase.com) — region **Southeast Asia (Singapore)**.
2. **Project Settings → API Keys**: copy *Project URL* và *anon / publishable key* vào `.env.local`.
3. **SQL Editor**: dán và chạy lần lượt từng file trong `supabase/migrations/` (theo thứ tự tên file).
4. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:3000` (đổi thành domain thật khi deploy)
   - *Redirect URLs*: thêm `http://localhost:3000/auth/callback`
5. **Authentication → Sign In / Providers → Email**: bật/tắt *Confirm email*.
   Khi phát triển nên **tắt** (email miễn phí của Supabase chỉ gửi ~2 email/giờ); **bật lại trước khi cho người khác dùng**.

### Xác thực hoạt động thế nào
- `src/proxy.ts` chạy trước mọi trang: làm mới phiên, chưa đăng nhập → `/login?next=...`.
- `getCurrentUser()` (`src/lib/auth/current-user.ts`) là nơi duy nhất đọc user ở server.
- RLS trong Postgres là lớp bảo vệ cuối: kể cả code sai, user cũng không đọc được dữ liệu người khác.

### Font
Mockup dùng **DM Sans** cho chữ thường, nhưng DM Sans không có dấu tiếng Việt → app dùng **Be Vietnam Pro**. **JetBrains Mono** (tiêu đề, nhãn) giữ nguyên. **Silkscreen** (pixel) không có dấu tiếng Việt nên chỉ dùng cho số và chữ không dấu.

---

## 8. Lộ trình

- [x] **Bước 1** — Cấu trúc thư mục, README, CLAUDE.md
- [x] **Bước 2** — Khởi tạo Next.js 16 + Tailwind 4 + design tokens từ mockup
- [x] **Bước 3** — UI primitives pixel (`components/ui`) + AppShell responsive (xem tại `/ui` khi chạy dev)
- [x] **Bước 4** — Supabase: schema + RLS (`profiles`, `foods`, 5 bảng nhật ký), đăng nhập email/mật khẩu _(bảng `plans` dời sang Bước 5–6)_
- [x] **Bước 5** — `lib/calc` + test: BMR/TDEE/sàn calo/số tuần/5 kiểu macro (đã chốt công thức)
- [x] **Bước 6** — Onboarding 4 bước (xem trước trực tiếp, chọn kiểu macro) + trang Kế hoạch; bảng `plans` + RPC `start_plan`; đổi kế hoạch = tạo mới, giữ lịch sử; calo làm tròn số nguyên
- [ ] Bước 7 — Nhật ký: ăn uống, vận động, nước, ngủ, cân
- [ ] Bước 8 — Dashboard + Progress + biểu đồ
- [ ] Bước 9 — PWA, import Google Sheet, tính năng mở rộng
