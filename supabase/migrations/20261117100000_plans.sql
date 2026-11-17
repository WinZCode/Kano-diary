-- =====================================================================
-- Kano Diary — Bước 6: bảng plans + hàm start_plan
-- Mỗi kế hoạch lưu ĐẦU VÀO (onboarding) và SNAPSHOT kết quả tính lúc tạo
-- → đổi công thức sau này không làm sai lịch sử. Đổi kế hoạch = tạo dòng mới,
-- dòng cũ chuyển 'archived' (người dùng chọn giữ lịch sử, 2026-11-17).
-- Cách chạy: SQL Editor → dán toàn bộ file → Run (sau migration initial_schema).
-- =====================================================================

create table public.plans (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status              text not null default 'active' check (status in ('active', 'archived')),
  start_date          date not null,

  -- Đầu vào
  sex                 text not null check (sex in ('male', 'female')),
  age_years           smallint not null check (age_years between 13 and 100),
  height_cm           numeric(5, 1) not null check (height_cm between 100 and 250),
  start_weight_kg     numeric(5, 2) not null check (start_weight_kg between 20 and 400),
  body_fat_ratio      numeric(4, 3) check (body_fat_ratio > 0 and body_fat_ratio < 0.7),
  activity_level      text not null check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  goal_type           text not null check (goal_type in ('lose', 'maintain', 'gain')),
  target_weight_kg    numeric(5, 2) not null check (target_weight_kg between 20 and 400),
  speed               text not null check (speed in ('slow', 'medium', 'fast')),
  macro_preset        text not null check (macro_preset in ('sheet', 'balanced', 'low-fat', 'low-carb', 'high-protein')),

  -- Snapshot kết quả (src/lib/calc/plan.ts)
  bmr_kcal            numeric(7, 1) not null,
  bmr_method          text not null check (bmr_method in ('katch-mcardle', 'mifflin-st-jeor')),
  tdee_kcal           numeric(7, 1) not null,
  daily_delta_kcal    numeric(7, 1) not null,          -- âm = thâm hụt, dương = thặng dư
  target_kcal         numeric(7, 1) not null check (target_kcal > 0),
  protein_g           numeric(6, 1) not null check (protein_g >= 0),
  carb_g              numeric(6, 1) not null check (carb_g >= 0),
  fat_g               numeric(6, 1) not null check (fat_g >= 0),
  weeks_to_goal       integer check (weeks_to_goal > 0),
  estimated_end_date  date,
  warnings            text[] not null default '{}',
  formula_version     smallint not null default 1,     -- tăng khi đổi công thức trong lib/calc

  created_at          timestamptz not null default now(),
  archived_at         timestamptz
);

-- Mỗi người chỉ có 1 kế hoạch đang dùng.
create unique index plans_one_active_per_user on public.plans (user_id) where status = 'active';
-- Tra kế hoạch áp dụng cho một ngày nhật ký (Bước 7–8).
create index plans_user_start_idx on public.plans (user_id, start_date desc);

alter table public.plans enable row level security;

create policy "plans: xem của mình" on public.plans
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "plans: thêm của mình" on public.plans
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "plans: sửa của mình" on public.plans
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.plans from anon;
grant select, insert, update on public.plans to authenticated;

-- ---------------------------------------------------------------------
-- start_plan: tạo kế hoạch mới trong 1 transaction:
--   1. lưu trữ kế hoạch đang dùng   2. thêm kế hoạch mới
--   3. cập nhật hồ sơ (giới tính, ngày sinh, chiều cao, đánh dấu đã onboarding)
--   4. ghi cân nặng ngày bắt đầu vào weight_logs
-- security invoker → chạy với quyền người gọi, RLS vẫn áp dụng.
-- p_plan: object JSON với key trùng tên cột của plans (trừ id, user_id, status, created_at, archived_at).
-- ---------------------------------------------------------------------
create or replace function public.start_plan(p_plan jsonb, p_birth_date date)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_plan public.plans;
  v_id   uuid;
begin
  if v_user is null then
    raise exception 'Chưa đăng nhập' using errcode = '28000';
  end if;

  v_plan := jsonb_populate_record(null::public.plans, p_plan);

  update public.plans
     set status = 'archived', archived_at = now()
   where user_id = v_user and status = 'active';

  insert into public.plans (
    user_id, start_date, sex, age_years, height_cm, start_weight_kg, body_fat_ratio,
    activity_level, goal_type, target_weight_kg, speed, macro_preset,
    bmr_kcal, bmr_method, tdee_kcal, daily_delta_kcal, target_kcal,
    protein_g, carb_g, fat_g, weeks_to_goal, estimated_end_date, warnings, formula_version
  ) values (
    v_user, v_plan.start_date, v_plan.sex, v_plan.age_years, v_plan.height_cm, v_plan.start_weight_kg,
    v_plan.body_fat_ratio, v_plan.activity_level, v_plan.goal_type, v_plan.target_weight_kg, v_plan.speed,
    v_plan.macro_preset, v_plan.bmr_kcal, v_plan.bmr_method, v_plan.tdee_kcal, v_plan.daily_delta_kcal,
    v_plan.target_kcal, v_plan.protein_g, v_plan.carb_g, v_plan.fat_g, v_plan.weeks_to_goal,
    v_plan.estimated_end_date, coalesce(v_plan.warnings, '{}'), coalesce(v_plan.formula_version, 1)
  )
  returning id into v_id;

  update public.profiles
     set sex = v_plan.sex,
         birth_date = p_birth_date,
         height_cm = v_plan.height_cm,
         onboarded_at = coalesce(onboarded_at, now())
   where id = v_user;

  insert into public.weight_logs (user_id, log_date, weight_kg, body_fat_ratio)
  values (v_user, v_plan.start_date, v_plan.start_weight_kg, v_plan.body_fat_ratio)
  on conflict (user_id, log_date)
  do update set weight_kg = excluded.weight_kg, body_fat_ratio = excluded.body_fat_ratio;

  return v_id;
end;
$$;

revoke all on function public.start_plan(jsonb, date) from public, anon;
grant execute on function public.start_plan(jsonb, date) to authenticated;
