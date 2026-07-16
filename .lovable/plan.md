
## Ideia geral

Cada clube gera **uma credencial de visitante** (email + senha, gerenciada pelo admin) que loga como um **usuário Supabase real** com papel `viewer` na organização daquele clube. Todo o resto do app respeita esse papel — no banco (RLS bloqueia escrita) e na UI (esconde configurações e botões de edição).

Isso reaproveita o padrão já existente da "Chave ApaHub", só que agora com sessão Supabase real para que o RLS funcione naturalmente.

## Banco de dados (migração)

**1. Novo enum member role**
- Adicionar valor `'viewer'` ao tipo usado em `organization_members.role` (hoje é `text`, então basta aceitar o novo valor — sem alterar coluna).

**2. Tabela `organization_viewer_keys`** (espelho da `apahub_access_keys`)
- Campos: `organization_id` (uniq), `access_email` (uniq), `password_hash`, `viewer_user_id` (uuid do usuário Supabase criado), `is_active`, `created_by`, timestamps.
- GRANTs padrão + RLS: só admin da org lê/escreve.

**3. Funções SQL (SECURITY DEFINER)**
- `create_organization_viewer_key(p_organization_id, p_access_email, p_password, p_viewer_user_id)` — só admin da org pode chamar; faz upsert com `crypt(p_password, gen_salt('bf'))`.
- `update_organization_viewer_password(p_organization_id, p_new_password)`.
- `toggle_organization_viewer_key(p_organization_id)`.
- `verify_organization_viewer_login(p_email, p_password)` → retorna `organization_id`, `viewer_user_id`, `access_email` se `is_active` e senha bate.
- `is_viewer_of_organization(org_id)` → `role = 'viewer'` em `organization_members`; usada nas policies e no front.

**4. Ajuste das policies RLS de escrita**
Nas tabelas `players`, `seasons`, `games`, `rankings`, `eliminations`, `caixinha_transactions`, `club_fund_transactions`, `season_jackpot_distributions`:
- SELECT: manter membership atual (viewer entra normalmente porque é membro).
- INSERT/UPDATE/DELETE: adicionar `AND NOT public.is_viewer_of_organization(organization_id)` a todas as policies existentes que autorizam mutação. Isso bloqueia o viewer no servidor, independente do que a UI mostre.

## Edge function

Criar `supabase/functions/create-viewer-account/index.ts`:
- Auth: valida JWT do admin chamador; confere via `user_can_admin_organization(org_id)`.
- Input (Zod): `organization_id`, `access_email`, `password`.
- Ações:
  1. Usa `SUPABASE_SERVICE_ROLE_KEY` para criar (ou atualizar senha de) usuário Supabase Auth com `email_confirm: true`.
  2. Insere/atualiza `organization_members` com `role = 'viewer'` para esse usuário nessa org.
  3. Chama `create_organization_viewer_key` (armazena o hash + `viewer_user_id`).
- Response: dados do viewer (sem senha).

Necessário porque criar usuário Auth requer service role — não pode ser feito só via SQL do cliente.

## Front-end

**Hook novo `useOrgMemberRole()`**
- Lê `role` do usuário atual em `organization_members` para `currentOrganization.id`.
- Expõe: `role`, `isViewer`, `isAdmin`, `isOwner`, `canEdit` (= `!isViewer`).

**Substituir botão atual**
- `GuestAccessButton` deixa de fazer login hardcoded. Vira "Entrar como Visitante", abre modal (`ViewerLoginModal`) pedindo email + senha do clube; chama `signInWithPassword`.
- Remover `useGuestAccess.ts` e credenciais hardcoded `visitante@apapoker.com/123456`.

**Gate de UI (usando `isViewer`)**
- `PokerNav`: esconder itens **Configuração** (`/season-config`), **Usuários** (`/users`), **Caixinha** (edição), e o **botão de criar/editar/apagar** em toda a app.
- Rotas: adicionar `RequireEditor` que redireciona viewer para `/dashboard`; envolver as rotas `/season-config/*`, `/users`, edição de partidas, edição de temporadas, `/caixinha` (ações), gestão de jogadores.
- Componentes com botões de ação (`Editar`, `Excluir`, `Adicionar`, `Nova partida`, etc.): ocultar quando `isViewer` for verdadeiro.
- Cards do Dashboard, `Ranking`, `PlayerStatistics`, `SeasonReport`, `HouseRules`, `GamesList` (visualização) continuam visíveis normalmente.

**Nova tela de gestão da credencial (para admin)**
- Em `UserManagement` (ou junto do `ApahubAccessKeyCard`), acrescentar card **"Credencial de Visitante"** com:
  - Formulário para definir email + senha (chama a edge function).
  - Botão para trocar senha, ativar/desativar.
  - Mensagem explicando que qualquer pessoa com essa credencial poderá **ver** os dados do clube mas não editar.

## Fluxo completo

1. Admin do clube abre gestão de usuários → cria credencial de visitante (`visitantes@meuclube.com` + senha).
2. Admin compartilha a credencial com quem quiser.
3. Visitante clica em **Entrar como Visitante** na tela de login → digita email/senha → é autenticado como usuário Supabase real com papel `viewer` naquele clube.
4. Ao entrar, `OrganizationContext` seleciona o único clube dele; `useOrgMemberRole` marca `isViewer = true`.
5. Nav mostra apenas: Dashboard, Temporadas, Partidas, Ranking, Estatísticas, Regras da Casa.
6. Nenhum botão de editar/criar/apagar aparece. Se alguém forçar rota, `RequireEditor` redireciona.
7. Caso um viewer tente uma mutação (via devtools, por exemplo), o RLS derruba a request no servidor.

## Segurança — pontos importantes

- Senha do visitante nunca vai para o cliente em texto: hash bcrypt via `pgcrypto`.
- Criação do usuário Auth só pela edge function autenticada e restrita a admin da org.
- Bloqueio de escrita é **duplo**: RLS (servidor) + UI (cliente).
- Um viewer é membro de apenas uma organização — o `organization_members` já isola dados por org.

## Fora do escopo

- Contas Supabase individuais por visitante (fica para depois se quiser rastrear por pessoa).
- Acesso público sem senha (link mágico) — se precisar depois, dá para gerar via a mesma tabela.
- Alterar visibilidade de módulos além do que foi listado (permanecem visíveis: Dashboard, Temporadas, Partidas, Ranking, Estatísticas, Regras).
