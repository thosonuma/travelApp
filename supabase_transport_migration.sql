-- flights テーブルに transport_type カラムを追加
-- 既存データはすべて 'flight' として扱う

ALTER TABLE flights
  ADD COLUMN IF NOT EXISTS transport_type TEXT NOT NULL DEFAULT 'flight'
    CHECK (transport_type IN ('flight', 'shinkansen', 'train', 'bus', 'ferry', 'rental_car'));

ALTER TABLE flights
  ADD COLUMN IF NOT EXISTS seat_no TEXT NOT NULL DEFAULT '';
