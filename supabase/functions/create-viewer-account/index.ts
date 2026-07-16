import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body {
  organization_id: string;
  access_email: string;
  password: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const callerId = claimsData.claims.sub as string;

    const body = (await req.json()) as Body;
    if (!body?.organization_id || !body?.access_email || !body?.password) {
      return json({ error: 'organization_id, access_email e password são obrigatórios' }, 400);
    }
    if (body.password.length < 6) {
      return json({ error: 'A senha deve ter pelo menos 6 caracteres' }, 400);
    }
    if (!body.access_email.includes('@')) {
      return json({ error: 'Email inválido' }, 400);
    }

    // Verificar que o chamador é admin da organização
    const { data: memberRow, error: memberErr } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', body.organization_id)
      .eq('user_id', callerId)
      .maybeSingle();

    if (memberErr) throw memberErr;
    if (!memberRow || (memberRow.role !== 'admin' && memberRow.role !== 'owner')) {
      return json({ error: 'Apenas administradores podem criar credencial de visitante' }, 403);
    }

    const email = body.access_email.toLowerCase().trim();

    // Verificar se já existe uma credencial (para reaproveitar o user_id)
    const { data: existingKey } = await admin
      .from('organization_viewer_keys')
      .select('viewer_user_id, access_email')
      .eq('organization_id', body.organization_id)
      .maybeSingle();

    let viewerUserId: string | null = existingKey?.viewer_user_id ?? null;

    // Se existe user e o email mudou, atualizar email no auth
    if (viewerUserId) {
      const { error: updErr } = await admin.auth.admin.updateUserById(viewerUserId, {
        email,
        password: body.password,
        email_confirm: true,
      });
      if (updErr) {
        // Se o usuário não existe mais no auth, criar novo
        console.error('updateUserById failed, creating new:', updErr);
        viewerUserId = null;
      }
    }

    if (!viewerUserId) {
      // Tentar criar usuário; se já existe (outra org), buscar existente
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: { is_org_viewer: true, organization_id: body.organization_id },
      });

      if (createErr) {
        // Email pode já existir — tentar localizar
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
        const found = list?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
        if (!found) {
          return json({ error: `Não foi possível criar usuário visitante: ${createErr.message}` }, 400);
        }
        viewerUserId = found.id;
        // Reset password to informed one
        await admin.auth.admin.updateUserById(viewerUserId, {
          password: body.password,
          email_confirm: true,
        });
      } else {
        viewerUserId = created.user!.id;
      }
    }

    // Garantir membership como viewer
    const { data: existingMember } = await admin
      .from('organization_members')
      .select('id, role')
      .eq('organization_id', body.organization_id)
      .eq('user_id', viewerUserId)
      .maybeSingle();

    if (!existingMember) {
      const { error: insErr } = await admin.from('organization_members').insert({
        organization_id: body.organization_id,
        user_id: viewerUserId,
        role: 'viewer',
      });
      if (insErr) throw insErr;
    } else if (existingMember.role !== 'viewer') {
      const { error: upErr } = await admin
        .from('organization_members')
        .update({ role: 'viewer' })
        .eq('id', existingMember.id);
      if (upErr) throw upErr;
    }

    // Persistir credencial (hash + user_id) via RPC (SECURITY DEFINER cuida do hash)
    const { data: keyRows, error: rpcErr } = await admin.rpc('create_organization_viewer_key', {
      p_organization_id: body.organization_id,
      p_access_email: email,
      p_password: body.password,
      p_viewer_user_id: viewerUserId,
    });

    // A função checa auth.uid() como admin, mas aqui usamos service role — bypassa RLS mas auth.uid() é null.
    // Fallback: inserir direto se RPC falhar por causa da checagem.
    if (rpcErr) {
      console.log('RPC create_organization_viewer_key failed with service role, inserting directly:', rpcErr.message);
      // Hash via pgcrypto usando SQL direto não é possível pelo client. Chamar RPC com JWT do usuário (que é admin) em vez disso.
      const { data: keyRows2, error: rpcErr2 } = await userClient.rpc('create_organization_viewer_key', {
        p_organization_id: body.organization_id,
        p_access_email: email,
        p_password: body.password,
        p_viewer_user_id: viewerUserId,
      });
      if (rpcErr2) throw rpcErr2;
      return json({ success: true, viewer: keyRows2?.[0] ?? null }, 200);
    }

    return json({ success: true, viewer: keyRows?.[0] ?? null }, 200);
  } catch (err: any) {
    console.error('create-viewer-account error:', err);
    return json({ error: err?.message ?? 'Erro interno' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
