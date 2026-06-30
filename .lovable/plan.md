## Objetivo
No ranking, deixar claro quantos pontos cada jogador ganhou **por posição** e quantos **por eliminações**, mantendo o total como hoje.

## Como ficará a UI

Tabela de ranking (desktop) ganha duas colunas extras antes da coluna "Pontos":

```
#  Jogador     Jogos   Posição   Elim.   Pontos
🥇  RICARDO     1       10        +1      11
🥈  CESAR       1        9         0       9
```

- **Posição**: soma dos pontos vindos do `scoreSchema` (colocação final).
- **Elim.**: soma dos pontos ganhos pela recompensa por eliminação (mostrado com prefixo `+` e ícone ⚔️; fica `0` / em cinza quando não há).
- **Pontos**: total (igual hoje, destaque dourado).

Mobile (cards): abaixo do total dourado, uma linha pequena `10 pos • +1 elim` aparece somente quando há pontos de eliminação. Se não houver, o card continua idêntico ao atual.

Quando **nenhum jogador da temporada** tem pontos de eliminação (recompensa desativada ou em dinheiro), as duas colunas extras ficam ocultas para não poluir.

## Como será calculado

Hoje `RankingEntry.totalPoints` já contém posição + eliminação somados (vem de `GamePlayer.points`). Falta apenas expor a quebra.

1. Estender `RankingEntry` (`src/lib/db/models.ts`) com dois campos opcionais derivados:
   - `pointsFromPosition?: number`
   - `pointsFromEliminations?: number`
2. Em `useRankingSync.recalculateRankings` (`src/hooks/useRankingSync.ts`): ao percorrer `game.players`, somar `gamePlayer.pointsFromPosition ?? scoreSchema[position] ?? 0` e `gamePlayer.pointsFromEliminations ?? 0` por jogador, e gravar nos novos campos. `totalPoints` permanece `posição + eliminações` (consistente com o que já é mostrado).
3. Em `useRankingFunctions.updateRankings` (`src/contexts/useRankingFunctions.ts`): após buscar rankings do banco, complementar cada entrada lendo os jogos finalizados da temporada (já em memória via `pokerDB.getGames`) e calculando a mesma quebra. Isso garante que partidas antigas (anteriores à introdução dos campos no `GamePlayer`) caiam no fallback `pointsFromPosition = totalPoints` e `pointsFromEliminations = 0`, sem precisar de migração.
4. Persistência: não vamos alterar o schema SQL da tabela `rankings`. Os dois campos são calculados em runtime quando o ranking é carregado/recalculado — fica em memória apenas. O total persistido continua correto.

## UI

5. `src/components/ranking/RankingTable.tsx`: adicionar as duas colunas (desktop) e a sublinha (mobile) conforme descrito. Detectar `hasAnyElimPoints = sortedRankings.some(r => (r.pointsFromEliminations ?? 0) > 0)` para mostrar/ocultar as colunas extras.
6. Botão "Recalcular Rankings" já refaz tudo — nenhuma mudança necessária ali.

## O que NÃO muda

- Schema do banco (`rankings`, `games`).
- Cálculo do total (`totalPoints` continua igual).
- Export do ranking (`RankingExporter`) — fora do escopo desta tarefa; só a tabela na tela.
- Estatísticas individuais do jogador, relatórios e histórico.

## Validação

- Ricardo no print: deve aparecer `Posição: 10`, `Elim.: +1`, `Pontos: 11`.
- Cesar: `Posição: 9`, `Elim.: 0`, `Pontos: 9`.
- Temporada sem recompensa por eliminação: colunas extras ficam ocultas, layout idêntico ao atual.
- Partidas antigas (sem `pointsFromPosition`): caem no fallback e o total continua correto.
