-- =====================================================================
-- Kano Diary — schema khởi tạo (Bước 4)
-- Bảng: profiles, foods, food_logs, exercise_logs, water_logs, sleep_logs, weight_logs
-- Bảng plans sẽ thêm ở migration sau, khi chốt công thức (README §3).
--
-- Nguyên tắc:
--  * Mọi bảng bật RLS: người dùng chỉ đọc/ghi dòng có user_id = auth.uid().
--  * Đơn vị nằm trong tên cột (_kg, _cm, _ml, _min, _kcal, _g); tỉ lệ lưu 0–1 (_ratio).
--  * Ngày nhật ký là kiểu date theo giờ địa phương người dùng (log_date).
--  * Xóa tài khoản (auth.users) → xóa toàn bộ dữ liệu (on delete cascade).
-- Cách chạy: Supabase Dashboard → SQL Editor → dán toàn bộ file → Run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Hàm tiện ích: tự cập nhật updated_at
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles: thông tin cá nhân, 1-1 với auth.users
-- Các cột cơ thể để trống cho tới khi người dùng làm onboarding (Bước 6).
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  display_name  text check (char_length(display_name) between 1 and 50),
  sex           text check (sex in ('male', 'female')),
  birth_date    date check (birth_date >= '1900-01-01'), -- "không ở tương lai" kiểm tra bằng Zod (CHECK không nên phụ thuộc ngày hiện tại)
  height_cm     numeric(5, 1) check (height_cm between 100 and 250),
  timezone      text not null default 'Asia/Ho_Chi_Minh',
  onboarded_at  timestamptz,               -- null = chưa hoàn thành onboarding
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Tự tạo profile khi có user mới đăng ký; lấy tên từ metadata gửi lúc signUp.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer          -- chạy với quyền owner để ghi được vào public.profiles
set search_path = ''      -- chặn tấn công đổi search_path
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 50), ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- foods: thư viện món ăn. user_id null = món hệ thống (ai cũng xem được)
-- Dinh dưỡng tính cho 1 khẩu phần (serving_label, ví dụ "1 bát", "100 g").
-- ---------------------------------------------------------------------
create table public.foods (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users (id) on delete cascade,
  name           text not null check (char_length(name) between 1 and 100),
  serving_label  text not null default '1 phần' check (char_length(serving_label) between 1 and 40),
  serving_g      numeric(6, 1) check (serving_g > 0),
  energy_kcal    numeric(6, 1) not null check (energy_kcal >= 0),
  protein_g      numeric(5, 1) not null default 0 check (protein_g >= 0),
  carb_g         numeric(5, 1) not null default 0 check (carb_g >= 0),
  fat_g          numeric(5, 1) not null default 0 check (fat_g >= 0),
  created_at     timestamptz not null default now()
);

create index foods_user_id_idx on public.foods (user_id);

-- ---------------------------------------------------------------------
-- food_logs: mỗi dòng = 1 món ăn trong 1 bữa.
-- Lưu SNAPSHOT tên + dinh dưỡng lúc ghi → sửa/xóa món sau này không làm sai nhật ký cũ.
-- ---------------------------------------------------------------------
create table public.food_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date     date not null,
  meal         text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id      uuid references public.foods (id) on delete set null,
  food_name    text not null check (char_length(food_name) between 1 and 100),
  servings     numeric(5, 2) not null check (servings > 0 and servings <= 50),
  energy_kcal  numeric(7, 1) not null check (energy_kcal >= 0),   -- tổng = món × servings
  protein_g    numeric(6, 1) not null default 0 check (protein_g >= 0),
  carb_g       numeric(6, 1) not null default 0 check (carb_g >= 0),
  fat_g        numeric(6, 1) not null default 0 check (fat_g >= 0),
  created_at   timestamptz not null default now()
);

create index food_logs_user_date_idx on public.food_logs (user_id, log_date);
create index food_logs_food_id_idx on public.food_logs (food_id);

-- ---------------------------------------------------------------------
-- exercise_logs: vận động trong ngày (nhiều dòng/ngày)
-- ---------------------------------------------------------------------
create table public.exercise_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date       date not null,
  activity_name  text not null check (char_length(activity_name) between 1 and 100),
  met            numeric(4, 1) check (met > 0 and met <= 25),   -- null nếu người dùng tự nhập kcal
  duration_min   integer not null check (duration_min between 1 and 1440),
  energy_kcal    numeric(6, 1) not null check (energy_kcal >= 0),
  created_at     timestamptz not null default now()
);

create index exercise_logs_user_date_idx on public.exercise_logs (user_id, log_date);

-- ---------------------------------------------------------------------
-- water_logs: mỗi lần uống là 1 dòng (nhiều dòng/ngày, cộng dồn khi hiển thị)
-- ---------------------------------------------------------------------
create table public.water_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date    date not null,
  amount_ml   integer not null check (amount_ml between 1 and 5000),
  created_at  timestamptz not null default now()
);

create index water_logs_user_date_idx on public.water_logs (user_id, log_date);

-- ---------------------------------------------------------------------
-- sleep_logs: 1 dòng/ngày (ghi lại = cập nhật)
-- ---------------------------------------------------------------------
create table public.sleep_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date    date not null,
  hours       numeric(3, 1) not null check (hours >= 0 and hours <= 24),
  quality     smallint check (quality between 1 and 5),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, log_date)
);

create trigger sleep_logs_set_updated_at
  before update on public.sleep_logs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- weight_logs: cân buổi sáng, 1 dòng/ngày (ghi lại = cập nhật)
-- ---------------------------------------------------------------------
create table public.weight_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null default auth.uid() references auth.users (id) on delete cascade,
  log_date        date not null,
  weight_kg       numeric(5, 2) not null check (weight_kg between 20 and 400),
  body_fat_ratio  numeric(4, 3) check (body_fat_ratio > 0 and body_fat_ratio < 0.7),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, log_date)
);

create trigger weight_logs_set_updated_at
  before update on public.weight_logs
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Row Level Security
-- (select auth.uid()) thay vì auth.uid() để Postgres chỉ tính 1 lần/truy vấn (nhanh hơn).
-- Chỉ cấp cho role "authenticated"; khách (anon) không đọc được gì.
-- =====================================================================

alter table public.profiles      enable row level security;
alter table public.foods         enable row level security;
alter table public.food_logs     enable row level security;
alter table public.exercise_logs enable row level security;
alter table public.water_logs    enable row level security;
alter table public.sleep_logs    enable row level security;
alter table public.weight_logs   enable row level security;

-- profiles: xem & sửa hồ sơ của chính mình. Không có insert (trigger tạo) / delete (xóa theo user).
create policy "profiles: xem của mình" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: sửa của mình" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- foods: xem món hệ thống + món của mình; chỉ thêm/sửa/xóa món của mình.
create policy "foods: xem hệ thống và của mình" on public.foods
  for select to authenticated using (user_id is null or (select auth.uid()) = user_id);
create policy "foods: thêm của mình" on public.foods
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "foods: sửa của mình" on public.foods
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "foods: xóa của mình" on public.foods
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Quyền bảng (RLS vẫn lọc từng dòng). Khai báo tường minh thay vì dựa vào mặc định của project.
revoke all on public.profiles, public.foods, public.food_logs, public.exercise_logs,
  public.water_logs, public.sleep_logs, public.weight_logs from anon;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.foods, public.food_logs, public.exercise_logs,
  public.water_logs, public.sleep_logs, public.weight_logs to authenticated;

-- Các bảng nhật ký: cùng 4 policy "chỉ của mình" → tạo bằng vòng lặp cho gọn và đồng nhất.
do $$
declare
  t text;
begin
  foreach t in array array['food_logs', 'exercise_logs', 'water_logs', 'sleep_logs', 'weight_logs'] loop
    execute format(
      'create policy "%1$s: xem của mình" on public.%1$I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "%1$s: thêm của mình" on public.%1$I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "%1$s: sửa của mình" on public.%1$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "%1$s: xóa của mình" on public.%1$I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end;
$$;
