-- ============================================================
-- 旅行プランナー - Supabase スキーマ
-- Supabase ダッシュボードの SQL Editor で実行してください
-- ============================================================

-- trips テーブル
create table public.trips (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  destination text not null,
  start_date  text not null,
  end_date    text not null,
  cover_emoji text not null default '✈️',
  created_at  timestamptz default now()
);

-- flights テーブル
create table public.flights (
  id                 uuid primary key default gen_random_uuid(),
  trip_id            uuid references public.trips(id) on delete cascade not null,
  direction          text not null default 'outbound',
  airline            text not null default '',
  flight_no          text not null default '',
  departure_airport  text not null default '',
  arrival_airport    text not null default '',
  date               text not null default '',
  departure_time     text not null default '',
  arrival_time       text not null default '',
  booking_ref        text not null default '',
  notes              text not null default ''
);

-- accommodations テーブル
create table public.accommodations (
  id        uuid primary key default gen_random_uuid(),
  trip_id   uuid references public.trips(id) on delete cascade not null,
  name      text not null,
  address   text not null default '',
  check_in  text not null default '',
  check_out text not null default '',
  notes     text not null default ''
);

-- schedule_items テーブル
create table public.schedule_items (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid references public.trips(id) on delete cascade not null,
  date        text not null,
  start_time  text not null default '',
  end_time    text not null default '',
  category    text not null default 'tour',
  title       text not null,
  location    text not null default '',
  notes       text not null default '',
  status      text not null default 'tentative',
  price       text not null default ''
);

-- wishlist_items テーブル
create table public.wishlist_items (
  id       uuid primary key default gen_random_uuid(),
  trip_id  uuid references public.trips(id) on delete cascade not null,
  category text not null default 'spot',
  name     text not null,
  notes    text not null default '',
  priority text not null default 'medium'
);

-- ============================================================
-- Row Level Security (RLS) - 自分のデータのみ操作可能にする
-- ============================================================

alter table public.trips           enable row level security;
alter table public.flights         enable row level security;
alter table public.accommodations  enable row level security;
alter table public.schedule_items  enable row level security;
alter table public.wishlist_items  enable row level security;

-- trips: 自分のデータのみ
create policy "trips: own data only" on public.trips
  for all using (auth.uid() = user_id);

-- flights: 自分の旅行に紐づくもののみ
create policy "flights: own trip only" on public.flights
  for all using (
    exists (select 1 from public.trips where id = trip_id and user_id = auth.uid())
  );

-- accommodations: 自分の旅行に紐づくもののみ
create policy "accommodations: own trip only" on public.accommodations
  for all using (
    exists (select 1 from public.trips where id = trip_id and user_id = auth.uid())
  );

-- schedule_items: 自分の旅行に紐づくもののみ
create policy "schedule_items: own trip only" on public.schedule_items
  for all using (
    exists (select 1 from public.trips where id = trip_id and user_id = auth.uid())
  );

-- wishlist_items: 自分の旅行に紐づくもののみ
create policy "wishlist_items: own trip only" on public.wishlist_items
  for all using (
    exists (select 1 from public.trips where id = trip_id and user_id = auth.uid())
  );
