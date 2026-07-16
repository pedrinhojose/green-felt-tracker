import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body {
  organization_id: string;
  email: string;
  password: string;
  full_name: string;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: 'Unauthorized' }, 401);
    const callerId = claimsData.claims.sub as string;

    const body = (await req.json()) as Body;
    if (!body?.organization_id || !body?.email || !body?.password || !body?.full_name) {
      return json({ error: 'organization_id, email, password e full_name são obrigatórios' }, 400);
    }
    if (body.password.length < 6) return json({ error: 'A senha deve ter pelo menos 6 caracteres' }, 400);
    if (!body.email.includes('@')) return json({ error: 'Email inválido' }, 400);
    if (body.full_name.trim().length < 2) return json({ error: 'Nome muito curto' }, 400);

    // Autorização: caller precisa ser super_admin OU admin/owner do clube
    const { data: rolesRows } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId);
    const isSuper = (rolesRows ?? []).some((r) => r.role === 'super_admin');

    if (!isSuper) {
      const { data: memberRow } = await admin
        .from('organization_members')
        .select('role')
        .eq('organization_id', body.organization_id)
        .eq('user_id', callerId)
        .maybeSingle();
      if (!memberRow || (memberRow.role !== 'admin' && memberRow.role !== 'owner')) {
        return json({ error: 'Sem permissão para adicionar admin neste clube' }, 403);
      }
    }

    const email = body.email.toLowerCase().trim();
    const fullName = body.full_name.trim();

    // Criar usuário (ou reutilizar existente pelo email)
    let userId: string | null = null;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createErr) {
      const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found = list?.users?.find((u) => (u.email ?? '').toLowerCase() === email);
      if (!found) return json({ error: `Não foi possível criar usuário: ${createErr.message}` }, 400);
      userId = found.id;
    } else {
      userId = created.user!.id;
    }

    // Garantir profile com nome
    await admin.from('profiles').upsert(
      { id: userId, full_name: fullName, default_role: 'player' },
      { onConflict: 'id' },
    );

    // Garantir role global 'player' (NUNCA super_admin/admin globais)
    await admin
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .in('role', ['admin', 'super_admin', 'viewer']);
    await admin
      .from('user_roles')
      .upsert({ user_id: userId, role: 'player' }, { onConflict: 'user_id,role' });

    // Vincular como admin do clube
    const { data: existingMember } = await admin
      .from('organization_members')
      .select('id, role')
      .eq('organization_id', body.organization_id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingMember) {
      const { error: insErr } = await admin.from('organization_members').insert({
        organization_id: body.organization_id,
        user_id: userId,
        role: 'admin',
      });
      if (insErr) throw insErr;
    } else if (existingMember.role !== 'admin' && existingMember.role !== 'owner') {
      const { error: upErr } = await admin
        .from('organization_members')
        .update({ role: 'admin' })
        .eq('id', existingMember.id);
      if (upErr) throw upErr;
    }

    return json({ success: true, user_id: userId }, 200);
  } catch (err: any) {
    console.error('create-club-admin error:', err);
    return json({ error: err?.message ?? 'Erro interno' }, 500);
  }
});
