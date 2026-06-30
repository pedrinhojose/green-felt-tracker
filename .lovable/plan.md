## Objetivo

Quando a opção **"Recompensa por Eliminação"** estiver **ativa** e configurada com `rewardType = 'points'`, somar automaticamente esses pontos ao total do jogador no momento em que os prêmios são calculados (fim da partida). Quando estiver **desativada** (ou for `rewardType = 'money'`), manter o comportamento atual: apenas os pontos por posição contam.

Em qualquer caso, a tela da partida deverá **discriminar visualmente** quantos pontos vieram da colocação, quantos vieram de eliminações e qual o **total**.

## Resposta à sua dúvida

Sim — funciona exatamente como você descreveu, com uma ressalva técnica importante: hoje o `GamePlayer` tem **um único campo `points`**. Para discriminar sem quebrar nada (ranking, exports, histórico já gravado), vou armazenar a quebra em campos novos derivados e manter `points` como o **total final** (posição + eliminação). Assim:

- O ranking, exports Excel/PDF, `useRankingSync`, `useEditFinishedGame` e histórico continuam funcionando sem mudança porque continuam lendo `points` (que agora já é o total somado).
- A UI consegue mostrar a quebra lendo os dois campos novos.
- Partidas antigas (sem os campos novos) caem em fallback: `pointsFromPosition = points`, `pointsFromEliminations = 0`.

## Alterações

### 1. Modelo (`src/lib/db/models.ts`)
Adicionar dois campos opcionais ao `GamePlayer`:
- `pointsFromPosition?: number` — pontos do `scoreSchema` pela colocação final.
- `pointsFromEliminations?: number` — pontos ganhos pelas eliminações na partida (0 se recompensa desativada ou for em dinheiro).

Manter `points: number` como o **total** (`pointsFromPosition + pointsFromEliminations`). Nenhuma migração SQL é necessária — `games.players` já é JSONB.

### 2. Cálculo no fim da partida (`src/hooks/usePrizeDistribution.ts`)
No loop de cálculo de pontos (linhas 144-154):
1. Buscar eliminações desta partida agrupadas por `eliminator_id` (via `useEliminationData` ou consulta direta a `eliminations` por `game_id`).
2. Para cada jogador, calcular `pointsFromPosition` a partir do `scoreSchema` (como já faz hoje).
3. Chamar `calculateEliminationRewards(eliminacoesDoJogador, activeSeason.eliminationRewardConfig)`:
   - Se `result.type === 'points'` e `enabled`, `pointsFromEliminations = result.value`.
   - Caso contrário, `pointsFromEliminations = 0`.
4. `player.points = pointsFromPosition + pointsFromEliminations`.

O ranking (`useRankingSync`) já lê `gamePlayer.points`, então o total somado entra automaticamente — sem mexer no ranking.

### 3. UI da partida (`src/components/game/PlayersTable.tsx`, `PlayerTableRow.tsx`, `PlayerMobileCard.tsx`)
Na coluna de pontos:
- Se `pointsFromEliminations > 0`: mostrar **total em destaque** e abaixo um sub-texto pequeno do tipo `12 (pos) + 4 (elim)`.
- Caso contrário: mostrar só o número (comportamento atual).
- Adicionar um Badge ou ícone discreto (ex.: ⚔️) ao lado quando houver pontos de eliminação, com tooltip explicando.

Aplicar o mesmo tratamento ao `LivePrizePreview` se ele mostrar pontos.

### 4. Recalcular partidas existentes ao editar
`useEditFinishedGame.ts` e `usePositionSwap.ts` já chamam o recálculo de prêmios/pontos — ao migrar o cálculo para o passo 2, eles passam a popular os novos campos automaticamente. Nada extra a fazer ali além de garantir que o fluxo de recálculo dispare a soma de eliminações.

### 5. Fallback para partidas antigas
Onde a UI lê os novos campos, usar `pointsFromPosition ?? points` e `pointsFromEliminations ?? 0`, de forma que jogos finalizados antes desta mudança continuem exibindo apenas o número total como hoje.

## O que NÃO muda

- Schema SQL (nenhuma migração).
- `rankings`, `RankingTable`, exports de ranking, relatórios de temporada.
- `PlayerGameHistory` (continua exibindo `points` como total; pode receber a quebra num passo futuro, se você quiser).
- Recompensa em **dinheiro** (`rewardType = 'money'`) — fica fora do escopo desta tarefa, pois você pediu pontos. Posso tratar isso depois se quiser somar ao `balance`.

## Pontos de validação após implementar

1. Temporada com recompensa **desativada**: pontos exibidos = pontos do `scoreSchema` (sem mudança visual).
2. Temporada com recompensa ativa em **pontos**, frequência 1, valor 2: jogador que eliminou 3 = posição + 6 pts; UI mostra a quebra; ranking soma o total.
3. Temporada com recompensa ativa em **dinheiro**: `pointsFromEliminations = 0`, comportamento de pontos idêntico ao atual.
4. Editar uma partida finalizada (`useEditFinishedGame`) recalcula e mantém a quebra correta.
5. Partidas antigas (antes do deploy) continuam abrindo sem erro e mostram o total como antes.
