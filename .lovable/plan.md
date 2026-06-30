Plano de correção e ampliação

1. Corrigir por que não aparece agora
- A tela de Ranking está recebendo `rankings` carregados diretamente por `pokerDB.getRankings`, que traz apenas `totalPoints`, `gamesPlayed` e `bestPosition`.
- A quebra `pointsFromPosition` / `pointsFromEliminations` é calculada em `updateRankings`, mas essa função não está sendo usada no carregamento inicial do contexto nem atualiza o estado após a validação automática.
- Além disso, ao finalizar partida, `useGameFunctions` recalcula e salva rankings sem incluir os campos de quebra, então a tela depende de derivar isso dos jogos finalizados.

2. Criar uma fonte única para calcular a quebra
- Criar/centralizar uma função utilitária que, para uma temporada, leia os jogos finalizados e retorne por jogador:
  - pontos por colocação
  - pontos por eliminação
  - total
- Regra:
  - se `gamePlayer.pointsFromPosition` e `gamePlayer.pointsFromEliminations` existirem, usar esses valores;
  - se não existirem, calcular posição pelo `scoreSchema` e eliminação como `max(0, points - pontosPosição)` quando possível;
  - partidas antigas sem informação caem como tudo em colocação e 0 em eliminação.

3. Fazer o ranking mostrar a quebra sempre que houver recompensa de eliminação
- Ajustar o carregamento inicial em `PokerContext` para usar rankings enriquecidos com a quebra.
- Ajustar `RankingPage` para, ao validar/recalcular, atualizar também o estado do ranking exibido.
- Ajustar `useRankingSync` e `useGameFunctions` para salvar/repassar rankings já com `pointsFromPosition` e `pointsFromEliminations` em memória.
- Na tabela de ranking, quando houver qualquer ponto de eliminação na temporada, mostrar:
  - `Colocação`
  - `Elim.`
  - `Total`
- Se não houver eliminação pontuada, manter a tabela simples como hoje.

4. Adicionar em todos os lugares com estatística/pontos
- Ranking principal (`/ranking`): colunas/sublinha com colocação, eliminação e total.
- Card Top 3 do painel: mostrar total e, quando houver eliminação, a linha `posição + eliminação`.
- Estatísticas gerais (`/statistics`): no card/lista do jogador, mostrar pontos totais e detalhamento.
- Detalhe do jogador (`/statistics/player/...`): no card de pontos e no histórico de partidas, mostrar:
  - pontos por colocação
  - pontos por eliminação
  - total da partida
- Detalhes da temporada (`SeasonDetails`): top jogadores e tabela de desempenho com a quebra.
- Relatório da temporada (`SeasonReport` / `PlayerPerformanceTable`): adicionar colunas ou subtítulo para colocação, eliminação e total.
- Views públicas (`PublicSeasonView`, `PublicGameView`): mostrar a quebra no ranking público quando houver eliminação pontuada.
- Exportações/PDF/imagem onde aparece `Pontos`: incluir a discriminação `Colocação`, `Eliminação`, `Total`.

5. Atualizar tipos de estatística
- Estender `PlayerPerformanceStats` com:
  - `pointsFromPosition`
  - `pointsFromEliminations`
- Atualizar cálculos em `playerStatsCalculations` para preencher esses campos a partir dos rankings enriquecidos e/ou dos jogos.

6. Validação esperada
- Ricardo deve aparecer no ranking como:
  - Colocação: 10
  - Elim.: +1
  - Total/Pontos: 11
- Cesar deve aparecer como:
  - Colocação: 9
  - Elim.: 0
  - Total/Pontos: 9
- Se recompensa por eliminação estiver desligada ou não houver pontos de eliminação, as telas continuam mostrando apenas pontos normais.