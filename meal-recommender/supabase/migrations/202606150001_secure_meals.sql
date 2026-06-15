create table if not exists public.meals (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  food_name text not null check (char_length(food_name) between 1 and 100),
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  eaten_at timestamptz not null default now(),
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_meals_user_eaten_at
  on public.meals (user_id, eaten_at desc);

create index if not exists idx_meals_user_favorite
  on public.meals (user_id, is_favorite)
  where is_favorite = true;

alter table public.meals enable row level security;
alter table public.meals force row level security;

drop policy if exists "Users can read own meals" on public.meals;
drop policy if exists "Users can insert own meals" on public.meals;
drop policy if exists "Users can delete own meals" on public.meals;
drop policy if exists "Users can update own meals" on public.meals;

revoke all on table public.meals from anon, authenticated;
grant all on table public.meals to service_role;
