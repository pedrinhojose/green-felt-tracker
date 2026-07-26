## Problema (confirmado nos dados)

O modal de detalhes do jogador busca todas as partidas da organização sem filtrar status nem tipo. Por isso a partida avulsa aberta hoje (26/07/2026, ainda em andamento) passou a contar como participação.

Exemplo real verificado no banco:

- ANDRÉ — última partida encerrada de temporada: **08/06/2026**
- ANDRÉ — o que o app mostra hoje: **há ~17 minutos** (a avulsa em andamento)

A última partida oficial de temporada registrada no clube é a de **20/07/2026**, então quem jogou nela deve aparecer com essa data — e não com a avulsa de hoje.

## Correção

Em `src/components/players/PlayerDetailsDialog.tsx`, restringir a consulta de participações a partidas que sejam, ao mesmo tempo:

- **encerradas** (`is_finished = true`), e
- **de temporada** (`is_standalone = false` e `season_id` preenchido).

Com isso:

- "Última participação" volta a refletir a última partida oficial encerrada (ex.: André → 08/06/2026, "há cerca de 1 mês").
- Partidas avulsas e partidas em andamento deixam de influenciar a métrica, conforme sua escolha.
- "Temporada atual" continua funcionando igual, apenas sem partidas em andamento contaminando a data.

## Detalhes técnicos

- Adicionar `.eq("is_finished", true)`, `.eq("is_standalone", false)` e `.not("season_id", "is", null)` à query do `useEffect`, mantendo o filtro por `organization_id` e a ordenação por data desc.
- Ajustar os textos de vazio para ficarem precisos: "Sem participação em partidas de temporada" quando não houver nenhuma.
- Revisar se algum outro ponto usa a mesma métrica (ex.: cards de jogador na listagem) e aplicar o mesmo critério, para não haver duas leituras diferentes na mesma tela.

Nenhuma alteração de banco, RLS ou de lógica financeira é necessária — é só o critério de leitura da métrica.