-- Adicionar campo para token de compartilhamento público na tabela games
ALTER TABLE public.games 
ADD COLUMN public_share_token UUID NULL;

-- Criar índice para busca rápida por token
CREATE INDEX idx_games_public_share_token ON public.games(public_share_token);

-- Comentário para documentar o campo
COMMENT ON COLUMN public.games.public_share_token IS 'Token único para compartilhamento público da partida via link';

-- Política RLS para permitir acesso público aos jogos compartilhados
CREATE POLICY "Public access to shared games" 
ON public.games 
FOR SELECT 
USING (public_share_token IS NOT NULL);