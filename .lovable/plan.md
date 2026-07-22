## Objetivo

Tornar **partidas avulsas 100% independentes** de temporada — hoje elas exigem uma temporada ativa para calcular buy-in, rebuy, addon e prize pool inicial.

## Mudanças

### 1. Configuração global de "Partida Avulsa" (padrão do clube)
Nova aba em **Configurações** (ou seção no Dashboard) para definir os valores padrão de partida avulsa por organização:
- Buy-in, Rebuy, Add-on
- Distribuição de prêmios (schema semanal simplificado — 1º, 2º, 3º %)
- Contribuição para caixinha (opcional, padrão 0)

Armazenado em nova tabela `organization_standalone_config` (org_id, buy_in, rebuy, addon, prize_schema jsonb, caixinha_contribution, updated_at) com RLS por organização e os GRANTs padrão.

### 2. Diálogo ao iniciar partida avulsa
Ao clicar em **"Iniciar partida avulsa"**, abrir modal com:
- Valores pré-preenchidos do padrão do clube (editáveis só para esta partida).
- Botão "Salvar como novo padrão" (opcional).
- Confirmar → cria a partida com esses valores no snapshot.

### 3. Snapshot no `games`
Adicionar coluna `standalone_config jsonb` na tabela `games` para armazenar buy-in/rebuy/addon/prize_schema usados naquela partida específica. Assim a partida avulsa não depende mais de `activeSeason` nem do padrão futuro do clube.

### 4. Refatorar hooks
- `useStartGame`: quando `isStandalone`, ler do `standalone_config` da partida (ou do modal) em vez de `activeSeason`.
- `usePrizeDistribution` / cálculo de prêmios: quando `isStandalone`, usar `game.standalone_config.prize_schema`.
- Remover o fallback silencioso para `activeSeason` em partidas avulsas.

### 5. Permitir partida avulsa sem nenhuma temporada
Hoje, se não há temporada ativa, o botão "Iniciar partida avulsa" ainda depende de dados de temporada em segundo plano. Após a mudança, será possível criar partida avulsa mesmo em clubes que nunca criaram uma temporada.

## Detalhes técnicos

- Migração: nova tabela `organization_standalone_config` + coluna `standalone_config jsonb` em `games` + GRANTs + RLS.
- Novo hook `useStandaloneConfig(orgId)` para ler/salvar padrão.
- Novo componente `StandaloneGameDialog.tsx` (formulário buy-in/rebuy/addon/prêmios).
- Editar `QuickGameCard.tsx` para abrir o diálogo em vez de iniciar direto.
- Editar `useStartGame.ts` para aceitar `standaloneConfig` como parâmetro e persistir no `games.standalone_config`.
- Editar `usePrizeDistribution.ts` (e onde mais consumir buy-in/prêmios) para checar `game.isStandalone` e usar o snapshot.
- Sem impacto em partidas de temporada: fluxo atual preservado.

## Fora do escopo

- Ranking próprio de avulsas (continuam sem ranking).
- Contribuição para jackpot em avulsas (continua sem).
- Snapshot de config por partida de temporada (item 4 do plano anterior, ainda pendente).
