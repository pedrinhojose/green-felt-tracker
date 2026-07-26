## Diagnóstico confirmado

A recompensa é calculada **isoladamente por partida** em `src/hooks/usePrizeDistribution.ts` (linhas 146-189): conta as eliminações apenas daquela partida e faz `floor(kills / 4)`. O resto é descartado quando a partida encerra.

Dados reais do DANIEL CUNHA na 2ª Temporada 2026 (config: `frequency: 4`, `rewardValue: 1`, `rewardType: points`, `maxRewardsPerGame: 0`):
- Partida #1 (06/07): 3 kills → `floor(3/4) = 0`
- Partida #2 (20/07): 2 kills → `floor(2/4) = 0`
- Total 5 kills → 0 pontos de recompensa

Por isso a premiação não aparece.

## O que será feito

### 1. Nova regra: acumulado por temporada
Alterar a lógica para considerar o total de eliminações do jogador na temporada até aquela partida (ordenadas por data/número), e não só na partida atual:

```text
kills_antes  = eliminações do jogador em partidas anteriores da temporada
kills_ate    = kills_antes + kills_da_partida_atual
recompensas  = floor(kills_ate / freq) - floor(kills_antes / freq)
pontos       = recompensas * rewardValue
```

Com 3 kills na #1 e 2 na #2, o 4º kill acontece na partida #2 → 1 ponto lançado na #2, e sobra 1 kill para o próximo ciclo. O resto nunca se perde.

O limite `maxRewardsPerGame` continua como teto de recompensas lançadas em uma única partida (0 = sem limite).

### 2. Onde o ponto aparece
Atribuído à partida que fechou o ciclo, gravado em `pointsFromEliminations` do jogador naquela partida e somado ao `points` — igual a hoje. A exibição atual ("X coloc. + Y elim." no ranking, relatórios, views públicas e histórico do jogador) segue funcionando sem mudanças.

### 3. Correção única das partidas já encerradas (sem botão)
Faço o reprocessamento retroativo uma única vez, agora, direto nos dados — sem criar nenhum botão na interface:
- percorrer as partidas encerradas de cada temporada em ordem cronológica
- recalcular `pointsFromEliminations` e `points` de cada jogador com a regra acumulada
- atualizar a tabela `rankings` (pontos totais e pontos por eliminação) de acordo
- reportar o resumo do que mudou (quais jogadores ganharam pontos adicionais)

Nenhum valor financeiro é alterado — apenas pontuação.

### 4. Partidas avulsas
Partidas avulsas (`isStandalone`) não pertencem a uma temporada e não entram no acumulado; mantêm o comportamento por partida.

## Detalhes técnicos

- `src/hooks/useEliminationRewards.ts`: adicionar `calculateCumulativeEliminationRewards(killsBefore, killsInGame, config)`, mantendo a função atual para compatibilidade.
- `src/hooks/usePrizeDistribution.ts`: buscar eliminações da temporada inteira (join `eliminations` + `games` por `season_id`, considerando partidas com data anterior à atual) em vez de só `game_id`, e usar a nova função.
- Backfill executado como operação de dados pontual sobre `games.players` (jsonb) e `rankings`, validando antes com consultas de leitura.
- Sem mudanças de schema e sem novos componentes de UI.
