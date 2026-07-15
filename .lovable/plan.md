
## Contexto

Os dois requisitos principais já existem:

- **Onboarding obrigatório**: `App.tsx` envolve as rotas protegidas com `RequireAuth > OrganizationRequired`. Se o usuário não tem organização, ele fica travado na tela `CreateFirstOrganization` (usa a RPC `create_organization_with_admin`).
- **Filtro por organização**: os repositórios (`PlayerRepository`, `GameRepository`, `SeasonRepository`, `RankingRepository`, `JackpotDistributionRepository`) já usam `getUserAndOrgIds()` e aplicam `.eq('organization_id', orgId)` em SELECTs/INSERTs, com RLS reforçando no servidor.

A auditoria encontrou pontos fora dos repositórios que **fazem queries diretas sem filtrar por `organization_id`**. Esses são os focos da correção.

## Correções

### 1. Hooks de leitura sem filtro por organização

Adicionar `.eq('organization_id', currentOrganization.id)` (obtido via `useOrganization()`) e abortar cedo se não houver organização:

- `src/hooks/useCaixinhaUnifiedTransactions.ts` — queries em `caixinha_transactions`, `players`, `games`.
- `src/hooks/elimination/useEliminationData.ts` — queries em `games` e `eliminations` (linhas 34, 52, 65, 93, 107, 122).
- `src/hooks/usePrizeDistribution.ts` (linha 149) — leitura de `eliminations` para calcular recompensa.
- `src/hooks/useShareableLink.ts` e `src/hooks/useGameShareableLink.ts` — operações em `seasons`/`games` para gerar/consumir tokens de compartilhamento: filtrar por org em quem cria/edita; a leitura pública por token permanece sem filtro (é o caso de uso público).

### 2. Restore de Excel

`src/components/ExcelRestoreButton.tsx` hoje usa `p.organization_id || orgId`, o que permite que uma planilha exportada de outro clube seja importada mantendo o `organization_id` original (vaza dados entre tenants). Forçar sempre `organization_id: orgId` (ignorar o valor do arquivo) em todos os `upsert` (players, seasons, games, rankings, caixinha, eliminations, jackpot). Idem para `user_id`, usar sempre o usuário logado.

### 3. Public views (fora do escopo, apenas confirmar)

`src/pages/PublicGameView.tsx` faz queries em `seasons`/`games` sem filtro — é intencional (acesso público por token). Não alterar, apenas registrar.

### 4. Verificação final

Após as edições, rodar `rg` para reconfirmar que não sobrou nenhuma chamada `supabase.from('players'|'games'|'seasons'|'rankings'|'eliminations'|'caixinha_transactions'|'club_fund_transactions'|'season_jackpot_distributions')` fora dos repositórios/públicos sem `organization_id`.

## O que NÃO muda

- Estrutura do banco, RLS e migrations (o modelo já suporta multi-tenancy corretamente).
- Fluxo de onboarding (`OrganizationRequired` + `CreateFirstOrganization`).
- Repositórios em `src/lib/db/repositories/*` (já corretos).
- Rotas públicas por token.
