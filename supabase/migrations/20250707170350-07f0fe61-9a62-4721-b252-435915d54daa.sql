-- Adicionar campo para token de compartilhamento público na tabela seasons
ALTER TABLE public.seasons 
ADD COLUMN public_share_token UUID NULL;

-- Criar índice para busca rápida por token
CREATE INDEX idx_seasons_public_share_token ON public.seasons(public_share_token);

-- Comentário para documentar o campo
COMMENT ON COLUMN public.seasons.public_share_token IS 'Token único para compartilhamento público da temporada via link';