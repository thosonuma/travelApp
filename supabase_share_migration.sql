-- ============================================================
-- 共有機能マイグレーション
-- Supabase ダッシュボードの SQL Editor で実行してください
-- ============================================================

-- trips テーブルに共有用カラムを追加
alter table public.trips
  add column if not exists is_shared   boolean not null default false,
  add column if not exists share_token uuid    not null default gen_random_uuid();

-- share_token にユニークインデックスを作成（高速検索用）
create unique index if not exists trips_share_token_idx on public.trips (share_token);

-- ============================================================
-- 匿名ユーザー（未ログイン）が共有トリップを読めるポリシー
-- ============================================================

create policy "shared trips: public read" on public.trips
  for select using (is_shared = true);

create policy "shared flights: public read" on public.flights
  for select using (
    exists (select 1 from public.trips where id = trip_id and is_shared = true)
  );

create policy "shared accommodations: public read" on public.accommodations
  for select using (
    exists (select 1 from public.trips where id = trip_id and is_shared = true)
  );

create policy "shared schedule_items: public read" on public.schedule_items
  for select using (
    exists (select 1 from public.trips where id = trip_id and is_shared = true)
  );

create policy "shared wishlist_items: public read" on public.wishlist_items
  for select using (
    exists (select 1 from public.trips where id = trip_id and is_shared = true)
  );
