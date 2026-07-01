## Causa raiz
A tabela `seasons` no Supabase **não tem** a coluna `elimination_reward_config`. Verifiquei o schema:
```
blind_structure, caixinha_balance, created_at, end_date, expected_end_date,
financial_params, game_frequency, games_per_period, games_per_week,
host_schedule, house_rules, id, is_active, jackpot, name, organization_id,
public_share_token, score_schema, season_prize_schema, start_date, user_id,
weekly_prize_schema
```
Sem essa coluna, o campo enviado no upsert é descartado. A config só "existe" enquanto o objeto está em memória — no próximo reload volta `undefined`, e todo o resto da feature (pontos extras, quebra no ranking, badge de elim.) fica silencioso.

## Correção

### 1. Migration Supabase
Adicionar a coluna JSONB opcional:
```sql
ALTER TABLE public.seasons
ADD COLUMN IF NOT EXISTS elimination_reward_config jsonb;
```
Sem default e sem NOT NULL → temporadas antigas continuam válidas com `null`. Não mexo em RLS/GRANTs (a tabela já está OK).

### 2. `src/lib/db/repositories/SeasonRepository.ts`
Mapear o campo nos dois sentidos, em todos os pontos:
- **Leitura** (`getSeasons`, `getActiveSeason`, `getSeason`): incluir
  `eliminationRewardConfig: (data as any).elimination_reward_config ?? undefined`.
- **Escrita** (`saveSeason` e `migrateSeasonsFromIndexedDB`): incluir
  `elimination_reward_config: season.eliminationRewardConfig ?? null` no payload do upsert.

### 3. Nada mais no frontend
`useSeasonFormSubmitter`, `useSeasonFormInitializer`, `EliminationRewardConfig.tsx`, `usePrizeDistribution`, ranking/estatísticas/exports já usam `season.eliminationRewardConfig` corretamente. Assim que a coluna passar a persistir, tudo volta a funcionar.

### 4. Passo do usuário após deploy
1. Abrir "Configuração da Temporada" → aba "Recompensas por Eliminação".
2. Reconfigurar (1 ponto a cada 1 eliminação, no seu caso) e salvar.
3. A partir daí a config persiste entre reloads.

### 5. Validação
- Recarregar `/season-config`: a aba carrega os valores salvos.
- Criar jogo, eliminar jogador → pontos extras aparecem em `PlayerTableRow`/`PlayerMobileCard`.
- Finalizar → ranking mostra `Colocação` + `Elim. ⚔️` + `Total`, e o mesmo aparece em estatísticas, detalhe do jogador, views públicas e exportações.

## Fora de escopo
- Não altero `deleteGame` nem o recálculo de ranking — o "sumiço" do jogo Ricardo/Cesar foi consequência de o jogo ter sido apagado (rankings decrementaram corretamente para 0). Sem relação com a config de eliminação.
- Não crio colunas `points_from_position` / `points_from_eliminations` em `rankings` — o breakdown continua sendo calculado dos jogos em runtime.
