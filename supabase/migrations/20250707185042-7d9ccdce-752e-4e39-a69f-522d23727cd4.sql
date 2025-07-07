-- Política RLS para permitir acesso público às temporadas compartilhadas
CREATE POLICY "Public access to shared seasons" 
ON public.seasons 
FOR SELECT 
USING (public_share_token IS NOT NULL);