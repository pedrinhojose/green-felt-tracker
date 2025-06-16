
-- Criar o bucket 'fotos' se não existir e torná-lo público
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotos', 'fotos', true)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  name = 'fotos';

-- Remover políticas existentes se houverem e recriar
DROP POLICY IF EXISTS "Public can view player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update player photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete player photos" ON storage.objects;

-- Criar política para permitir que todos vejam as fotos (READ)
CREATE POLICY "Public can view player photos" ON storage.objects
FOR SELECT USING (bucket_id = 'fotos');

-- Criar política para permitir que usuários autenticados façam upload (INSERT)
CREATE POLICY "Authenticated users can upload player photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'fotos' AND 
  auth.uid() IS NOT NULL
);

-- Criar política para permitir que usuários autenticados atualizem suas fotos (UPDATE)
CREATE POLICY "Authenticated users can update player photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'fotos' AND 
  auth.uid() IS NOT NULL
);

-- Criar política para permitir que usuários autenticados deletem fotos (DELETE)
CREATE POLICY "Authenticated users can delete player photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'fotos' AND 
  auth.uid() IS NOT NULL
);
