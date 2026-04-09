-- ============================================================
-- 編集共有機能 マイグレーション
-- Supabase ダッシュボードの SQL Editor で実行してください
-- ============================================================

-- trips に編集用トークンと編集共有フラグを追加
ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS edit_token      uuid    NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS is_edit_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS trips_edit_token_idx ON public.trips (edit_token);

-- ============================================================
-- edit_token でトリップを取得する関数 (SECURITY DEFINER で RLS をバイパス)
-- 匿名ユーザーが edit_token を知っている場合のみ取得可能
-- ============================================================
CREATE OR REPLACE FUNCTION public.load_trip_by_edit_token(p_edit_token uuid)
RETURNS SETOF public.trips
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT * FROM public.trips
  WHERE edit_token = p_edit_token AND is_edit_enabled = true;
$$;

-- ============================================================
-- 編集共有が有効な旅行の子テーブルへの匿名アクセスを許可
-- ============================================================

CREATE POLICY "edit enabled: flights all" ON public.flights
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND is_edit_enabled = true)
  );

CREATE POLICY "edit enabled: accommodations all" ON public.accommodations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND is_edit_enabled = true)
  );

CREATE POLICY "edit enabled: schedule_items all" ON public.schedule_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND is_edit_enabled = true)
  );

CREATE POLICY "edit enabled: wishlist_items all" ON public.wishlist_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND is_edit_enabled = true)
  );

CREATE POLICY "edit enabled: packing_items all" ON public.packing_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.trips WHERE id = trip_id AND is_edit_enabled = true)
  );
