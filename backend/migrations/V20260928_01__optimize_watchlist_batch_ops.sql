-- Migration: V20260928_01__optimize_watchlist_batch_ops.sql
-- Description: Mengoptimalkan operasi batch delete dan pencarian watchlist per pengguna dengan indeks eksplisit pada user_id

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
