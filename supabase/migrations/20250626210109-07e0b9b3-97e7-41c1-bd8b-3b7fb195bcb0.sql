
-- Adicionar coluna house_rules na tabela seasons
ALTER TABLE public.seasons 
ADD COLUMN house_rules TEXT DEFAULT '';
