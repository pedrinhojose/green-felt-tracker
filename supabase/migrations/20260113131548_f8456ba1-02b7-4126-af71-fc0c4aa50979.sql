-- Habilitar extensão pgcrypto para criptografia de senhas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela para armazenar chaves de acesso do ApaHub
CREATE TABLE public.apahub_access_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  access_email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.apahub_access_keys ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: apenas admins da organização podem gerenciar
CREATE POLICY "Admins can view their organization key"
ON public.apahub_access_keys
FOR SELECT
USING (user_can_admin_organization(organization_id));

CREATE POLICY "Admins can create their organization key"
ON public.apahub_access_keys
FOR INSERT
WITH CHECK (user_can_admin_organization(organization_id) AND auth.uid() = created_by);

CREATE POLICY "Admins can update their organization key"
ON public.apahub_access_keys
FOR UPDATE
USING (user_can_admin_organization(organization_id));

CREATE POLICY "Admins can delete their organization key"
ON public.apahub_access_keys
FOR DELETE
USING (user_can_admin_organization(organization_id));

-- Função para criar/atualizar chave de acesso ApaHub
CREATE OR REPLACE FUNCTION public.create_apahub_access_key(
  p_organization_id UUID,
  p_access_email TEXT,
  p_password TEXT,
  p_organization_name TEXT
)
RETURNS TABLE(
  id UUID,
  organization_id UUID,
  access_email TEXT,
  organization_name TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_password_hash TEXT;
BEGIN
  -- Validar autenticação
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Validar que é admin da organização
  IF NOT user_can_admin_organization(p_organization_id) THEN
    RAISE EXCEPTION 'User must be admin of the organization';
  END IF;
  
  -- Criptografar senha
  v_password_hash := crypt(p_password, gen_salt('bf'));
  
  -- Inserir ou atualizar (UPSERT)
  INSERT INTO public.apahub_access_keys (
    organization_id,
    access_email,
    password_hash,
    organization_name,
    created_by,
    updated_at
  )
  VALUES (
    p_organization_id,
    lower(p_access_email),
    v_password_hash,
    p_organization_name,
    v_user_id,
    now()
  )
  ON CONFLICT (organization_id) DO UPDATE SET
    access_email = lower(p_access_email),
    password_hash = v_password_hash,
    organization_name = p_organization_name,
    updated_at = now();
  
  -- Retornar dados (sem password_hash)
  RETURN QUERY
  SELECT 
    ak.id,
    ak.organization_id,
    ak.access_email,
    ak.organization_name,
    ak.is_active,
    ak.created_at,
    ak.updated_at
  FROM public.apahub_access_keys ak
  WHERE ak.organization_id = p_organization_id;
END;
$$;

-- Função para atualizar apenas a senha
CREATE OR REPLACE FUNCTION public.update_apahub_access_key_password(
  p_organization_id UUID,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_password_hash TEXT;
BEGIN
  -- Validar autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Validar que é admin da organização
  IF NOT user_can_admin_organization(p_organization_id) THEN
    RAISE EXCEPTION 'User must be admin of the organization';
  END IF;
  
  -- Criptografar nova senha
  v_password_hash := crypt(p_new_password, gen_salt('bf'));
  
  -- Atualizar senha
  UPDATE public.apahub_access_keys
  SET 
    password_hash = v_password_hash,
    updated_at = now()
  WHERE organization_id = p_organization_id;
  
  RETURN FOUND;
END;
$$;

-- Função para ativar/desativar chave
CREATE OR REPLACE FUNCTION public.toggle_apahub_access_key(
  p_organization_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_status BOOLEAN;
BEGIN
  -- Validar autenticação
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Validar que é admin da organização
  IF NOT user_can_admin_organization(p_organization_id) THEN
    RAISE EXCEPTION 'User must be admin of the organization';
  END IF;
  
  -- Toggle status
  UPDATE public.apahub_access_keys
  SET 
    is_active = NOT is_active,
    updated_at = now()
  WHERE organization_id = p_organization_id
  RETURNING is_active INTO v_new_status;
  
  RETURN v_new_status;
END;
$$;

-- Função PÚBLICA para verificar login do ApaHub (usada pelo app ApaHub)
CREATE OR REPLACE FUNCTION public.verify_apahub_login(
  p_email TEXT,
  p_password TEXT
)
RETURNS TABLE(
  organization_id UUID,
  organization_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.organization_id,
    ak.organization_name
  FROM public.apahub_access_keys ak
  WHERE 
    ak.access_email = lower(p_email)
    AND ak.is_active = true
    AND ak.password_hash = crypt(p_password, ak.password_hash);
END;
$$;