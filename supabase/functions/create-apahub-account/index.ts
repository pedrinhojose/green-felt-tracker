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
  organization_name?: string;
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

    // Somente admin/owner da organização
    const { data: memberRow, error: memberErr } = await admin
      .from('organization_members')
      .select('role')
      .eq('organization_id', body.organization_id)
      .eq('user_id', callerId)
      .maybeSingle();

    if (memberErr) throw memberErr;
    if (!memberRow || (memberRow.role !== 'admin' && memberRow.role !== 'owner')) {
      return json({ error: 'Apenas administradores podem gerenciar a chave ApaHub' }, 403);
    }

    const email = body.access_email.toLowerCase().trim();

    const { data: org } = await admin
      .from('organizations')
      .select('name')
      .eq('id', body.organization_id)
      .maybeSingle();
    const organizationName = body.organization_name ?? org?.name ?? 'Clube';

    const { data: existingKey } = await admin
      .from('apahub_access_keys')
      .select('apahub_user_id')
      .eq('organization_id', body.organization_id)
      .maybeSingle();

    let apahubUserId: string | null = existingKey?.apahub_user_id ?? null;

    if (apahubUserId) {
      const { error: updErr } = await admin.auth.admin.updateUserById(apahubUserId, {
        email,
        password: body.password,
        email_confirm: true,
      });
      if (updErr) {
        console.error('updateUserById failed, creating new:', updErr);
        apahubUserId = null;
      }
    }

    if (!apahubUserId) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: { is_apahub_user: true, organization_id: body.organization_id },
      });

      if (createErr) {
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const found = list?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
        if (!found) {
          return json({ error: `Não foi possível criar a conta ApaHub: ${createErr.message}` }, 400);
        }
        apahubUserId = found.id;
        await admin.auth.admin.updateUserById(apahubUserId, {
          password: body.password,
          email_confirm: true,
        });
      } else {
        apahubUserId = created.user!.id;
      }
    }

    // Garantir membership somente-leitura na organização
    const { data: existingMember } = await admin
      .from('organization_members')
      .select('id, role')
      .eq('organization_id', body.organization_id)
      .eq('user_id', apahubUserId)
      .maybeSingle();

    if (!existingMember) {
      const { error: insErr } = await admin.from('organization_members').insert({
        organization_id: body.organization_id,
        user_id: apahubUserId,
        role: 'viewer',
      });
      if (insErr) throw insErr;
    } else if (existingMember.role === 'viewer') {
      // já ok
    }

    // Persistir chave (hash) — a RPC valida auth.uid(), então usamos o client do admin logado
    const { data: keyRows, error: rpcErr } = await userClient.rpc('create_apahub_access_key', {
      p_organization_id: body.organization_id,
      p_access_email: email,
      p_password: body.password,
      p_organization_name: organizationName,
    });
    if (rpcErr) throw rpcErr;

    const { error: linkErr } = await admin
      .from('apahub_access_keys')
      .update({ apahub_user_id: apahubUserId })
      .eq('organization_id', body.organization_id);
    if (linkErr) console.error('Erro ao vincular apahub_user_id:', linkErr);

    return json({ success: true, key: keyRows?.[0] ?? null }, 200);
  } catch (err: any) {
    console.error('create-apahub-account error:', err);
    return json({ error: err?.message ?? 'Erro interno' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
