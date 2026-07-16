import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body {
  action: 'list' | 'update_password' | 'remove';
  organization_id: string;
  user_id?: string;
  password?: string;
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
    if (!body?.action || !body?.organization_id) {
      return json({ error: 'action e organization_id são obrigatórios' }, 400);
    }

    // Autorização
    const { data: rolesRows } = await admin
      .from('user_roles').select('role').eq('user_id', callerId);
    const isSuper = (rolesRows ?? []).some((r) => r.role === 'super_admin');
    if (!isSuper) {
      const { data: memberRow } = await admin
        .from('organization_members')
        .select('role')
        .eq('organization_id', body.organization_id)
        .eq('user_id', callerId)
        .maybeSingle();
      if (!memberRow || (memberRow.role !== 'admin' && memberRow.role !== 'owner')) {
        return json({ error: 'Sem permissão' }, 403);
      }
    }

    if (body.action === 'list') {
      const { data: members, error: mErr } = await admin
        .from('organization_members')
        .select('user_id, role, created_at')
        .eq('organization_id', body.organization_id)
        .in('role', ['admin', 'owner']);
      if (mErr) throw mErr;

      const userIds = (members ?? []).map((m) => m.user_id);
      if (userIds.length === 0) return json({ admins: [] });

      const { data: profiles } = await admin
        .from('profiles').select('id, full_name, username').in('id', userIds);

      // Buscar emails via auth admin
      const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const emailMap = new Map<string, string>();
      (authList?.users ?? []).forEach((u) => { if (u.id) emailMap.set(u.id, u.email ?? ''); });

      const admins = (members ?? []).map((m) => {
        const p = profiles?.find((x) => x.id === m.user_id);
        return {
          user_id: m.user_id,
          role: m.role,
          created_at: m.created_at,
          full_name: p?.full_name ?? p?.username ?? null,
          email: emailMap.get(m.user_id) ?? null,
        };
      });
      return json({ admins });
    }

    if (body.action === 'update_password') {
      if (!body.user_id || !body.password) return json({ error: 'user_id e password obrigatórios' }, 400);
      if (body.password.length < 6) return json({ error: 'Senha mínima 6 caracteres' }, 400);
      const { error } = await admin.auth.admin.updateUserById(body.user_id, {
        password: body.password,
      });
      if (error) throw error;
      return json({ success: true });
    }

    if (body.action === 'remove') {
      if (!body.user_id) return json({ error: 'user_id obrigatório' }, 400);
      if (body.user_id === callerId) return json({ error: 'Você não pode remover a si mesmo' }, 400);
      const { error } = await admin
        .from('organization_members')
        .delete()
        .eq('organization_id', body.organization_id)
        .eq('user_id', body.user_id);
      if (error) throw error;
      return json({ success: true });
    }

    return json({ error: 'Ação inválida' }, 400);
  } catch (err: any) {
    console.error('club-admins error:', err);
    return json({ error: err?.message ?? 'Erro interno' }, 500);
  }
});
