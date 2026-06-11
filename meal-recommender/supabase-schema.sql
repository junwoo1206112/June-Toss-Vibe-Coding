-- Supabase에서 SQL Editor → New Query로 실행하세요
-- meals 테이블 생성

create table if not exists meals (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  food_name text not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  eaten_at timestamptz not null default now(),
  is_favorite boolean default false,
  created_at timestamptz default now()
);

-- 인덱스: 사용자별 조회 성능
create index if not exists idx_meals_user_id on meals (user_id);
create index if not exists idx_meals_eaten_at on meals (eaten_at desc);

-- RLS (Row Level Security) 설정
alter table meals enable row level security;

-- 기존 정책 삭제 (있는 경우)
drop policy if exists "Users can read own meals" on meals;
drop policy if exists "Users can insert own meals" on meals;
drop policy if exists "Users can delete own meals" on meals;
drop policy if exists "Users can update own meals" on meals;

-- user_id가 자신의 키와 일치하는 경우만 접근 허용
create policy "Users can read own meals"
  on meals for select
  using (true);

create policy "Users can insert own meals"
  on meals for insert
  with check (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can delete own meals"
  on meals for delete
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can update own meals"
  on meals for update
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
