
# Múltiplas temporadas + partidas avulsas

## Objetivo
- Permitir várias temporadas "em andamento" ao mesmo tempo no mesmo clube.
- Adicionar um **seletor de temporada** no topo (ao lado do seletor de clube) para trocar o contexto ativo.
- Permitir criar **partidas avulsas** sem vínculo com temporada (só placar/eliminações, sem caixinha, jackpot ou ranking).
- Manter todo o comportamento atual funcionando para quem só tem 1 temporada ativa.

## O que muda para o usuário

1. **Criar mais de uma temporada** sem que a anterior seja desativada automaticamente.
2. **Seletor no topo** ("Temporada atual: 2ª Temporada 2026 ▾") — troca instantânea de contexto (dashboard, ranking, caixinha, jackpot, timer, jogos).
3. Botão **"Nova partida avulsa"** na tela de Jogos, separado de "Novo jogo (temporada)".
4. Partidas avulsas aparecem numa aba/seção própria em Jogos, com badge visual "Avulsa".
5. Nada muda para clubes com 1 temporada — a única ativa fica pré-selecionada.

## O que NÃO muda (garantias de não-quebra)
- Estrutura de ranking, caixinha, jackpot e finalização de temporada permanece idêntica.
- Backup/restore Excel continua funcionando (partidas avulsas entram como linhas com `season_id` vazio).
- ApaHub, visitante e permissões continuam por clube.
- Nenhum dado histórico é migrado ou alterado.

## Detalhes técnicos

### Banco de dados (1 migration)
- Remover o gatilho/regra que desativa outras temporadas ao ativar uma (hoje em `SeasonRepository.saveSeason` e `useSeasonFunctions.activateSeason`).
- Confirmar que `games.season_id` aceita `NULL` (tornar nullable se ainda não for).
- Adicionar coluna `games.is_standalone BOOLEAN DEFAULT false` para marcar avulsas explicitamente (evita confusão com jogos legados órfãos).
- Ajustar RLS de `games`: partida avulsa pertence ao `organization_id` do criador; leitura/edição segue as políticas já existentes por org.
- Remover memory rule "Enforce single active season per org" após aprovar.

### Contexto e estado (frontend)
- `OrganizationContext`: adicionar `currentSeasonId` + `setCurrentSeasonId`, persistindo em `localStorage` por org (`selected-season:<orgId>`).
- `PokerContext`: `activeSeason` deixa de ser "a única ativa do banco" e passa a ser "a temporada atualmente selecionada pelo usuário". Fallback: se nenhuma selecionada, usa a primeira ativa.
- `useSeasonFunctions.createSeason`: parar de desativar outras temporadas.
- `useSeasonFunctions.activateSeason`: apenas marca `is_active=true` da temporada alvo, sem tocar nas outras.

### UI
- Novo componente `SeasonSelector` no cabeçalho (`AppLayout` / `DashboardHeader`), visível quando há ≥2 temporadas ativas. Escondido para viewer se ele só tem 1.
- `GamesList`: dois botões — "Nova partida (temporada atual)" e "Nova partida avulsa". Filtro/aba para ver "Todas / Da temporada / Avulsas".
- `GameManagement`: quando `game.is_standalone === true`, ocultar seções de contribuição de caixinha, jackpot, pontuação de ranking e prêmios ligados ao schema da temporada. Mostrar apenas: buy-in opcional, eliminações, ordem final e observações.
- `Dashboard`, `Ranking`, `Caixinha`, `SeasonReport`: continuam lendo a temporada selecionada via contexto — sem mudança de lógica interna.

### Criação/finalização de partida avulsa
- `useGameFunctions.createStandaloneGame(orgId)`: cria game com `season_id = null`, `is_standalone = true`, sem `scoreSchema`/`prizeSchema`.
- `finishGame`: se `is_standalone`, pula recálculo de ranking, caixinha e jackpot.
- `updateRankings` e agregadores de temporada já filtram por `season_id` — partidas avulsas ficam naturalmente fora.

### Ajustes secundários
- `useGameLoader` e telas de detalhe: tratar `season_id` nulo sem quebrar (mostrar "Partida avulsa" no lugar do nome da temporada).
- Backup Excel: incluir coluna `is_standalone`; import lida com `season_id` vazio.
- Timer/blinds: partida avulsa usa uma estrutura de blinds padrão (ou herda da temporada selecionada no momento da criação como snapshot, sem vínculo).

## Ordem de implementação
1. Migration (banco + RLS + coluna `is_standalone`).
2. Ajuste dos contextos (`OrganizationContext`, `PokerContext`) + `SeasonSelector`.
3. Remover lógica de desativação automática em `useSeasonFunctions` e `SeasonRepository`.
4. Fluxo de partida avulsa (criação, finalização, exibição).
5. Ajustes de UI em `GamesList`, `GameManagement`.
6. Backup/restore.
7. Teste manual: clube com 1 temporada (não quebra), clube com 2 temporadas ativas (troca contexto), partida avulsa (não contamina ranking/caixinha).

## Fora do escopo (fica pra depois se quiser)
- Ranking geral consolidado do clube.
- Dashboard combinado mostrando múltiplas temporadas ao mesmo tempo.
- Dropdown de temporada dentro do formulário de criação de partida (ficaria pro modelo "Opção 1").
- Vincular partida avulsa a uma temporada depois de finalizada.
