-- ============================================================
-- 持ち物リスト マイグレーション
-- Supabase ダッシュボードの SQL Editor で実行してください
-- ============================================================

-- packing_items テーブル
create table public.packing_items (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid references public.trips(id) on delete cascade not null,
  category   text not null default 'other',
  name       text not null,
  notes      text not null default '',
  is_checked boolean not null default false
);

-- RLS 有効化
alter table public.packing_items enable row level security;

-- 自分の旅行に紐づくもののみ操作可
create policy "packing_items: own trip only" on public.packing_items
  for all using (
    exists (select 1 from public.trips where id = trip_id and user_id = auth.uid())
  );

-- 共有トリップの持ち物は匿名でも閲覧可
create policy "shared packing_items: public read" on public.packing_items
  for select using (
    exists (select 1 from public.trips where id = trip_id and is_shared = true)
  );
