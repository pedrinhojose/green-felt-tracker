ALTER TABLE public.cash_tables REPLICA IDENTITY FULL;
ALTER TABLE public.cash_players_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.cash_transactions REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_players_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_transactions;
