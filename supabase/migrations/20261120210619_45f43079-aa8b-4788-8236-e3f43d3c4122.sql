DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='games') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.games';
  END IF;
END $$;