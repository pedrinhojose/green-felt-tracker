# Conferência dos pontos do DEIVIDE e visibilidade das recompensas por eliminação

## O que eu encontrei nos dados (2ª Temporada 2026)

Os 22 pontos do DEIVIDE estão corretos. Detalhe partida por partida:

| Partida | Posição | Pontos por posição | Pontos por eliminação | Total |
|---|---|---|---|---|
| 1 | 13º | 0 | 0 | 0 |
| 2 | 11º | 0 | 0 | 0 |
| 4 | 5º | 5 | 0 | 5 |
| 9 | 9º | 1 | 0 | 1 |
| 10 | 4º | 6 | 0 | 6 |
| 11 | 2º | 8 | 2 | 10 |

Soma: 20 por posição + 2 por eliminação = **22 pontos**, com 6 partidas jogadas e melhor posição 2º — exatamente o que o ranking mostra.

Sobre as eliminações: ele tem 8 eliminações registradas na temporada (3 na partida 10 e 5 na partida 11). Com a regra de 1 ponto a cada 4 eliminações, contando de forma acumulada na temporada, ele fez jus a 2 pontos — e os 2 pontos foram creditados na partida 11, quando o total passou de 4 e de 8. Nas partidas 1, 2, 4 e 9 ele não tem nenhuma eliminação registrada, por isso não gerou bônus lá.

Nas partidas 1 e 2 ele ficou em 13º e 11º; a tabela de pontuação da temporada premia só até o 9º lugar, então zero ponto nessas duas é o esperado.

## Por que parece inconsistente

O sistema mostra as eliminações (8) numa tela e os pontos (22) em outra, sem nenhum lugar que ligue as duas coisas. Não existe hoje nenhuma indicação de quantos pontos de bônus o jogador já ganhou por eliminação, nem quantas eliminações faltam para o próximo ponto. Isso faz parecer que o bônus não foi pago, quando na verdade foi.

## O que eu proponho fazer

Nada de recálculo nem alteração de dados — os números estão certos. A proposta é deixar isso visível:

1. **No card de estatísticas de eliminação da temporada**: junto do número de eliminações de cada jogador, mostrar os pontos de bônus já ganhos e o progresso até o próximo ("8 eliminações · 2 pontos · faltam 4 para o próximo").
2. **No histórico de eliminações do jogador**: um resumo no topo com total de eliminações, bônus recebido e regra vigente ("1 ponto a cada 4 eliminações, acumulado na temporada").
3. **No detalhe do jogador e no ranking**: manter a divisão já existente entre pontos por posição e pontos por eliminação, e adicionar a explicação em texto curto de onde vem o bônus.
4. **Na lista de partidas do jogador**: indicar em quais partidas houve bônus por eliminação, para conferência rápida.

## Detalhes técnicos

- Nenhuma migração de banco e nenhuma escrita de dados; alterações apenas de apresentação.
- Reaproveitar `calculateEliminationRewards` / `calculateCumulativeEliminationRewards` de `src/hooks/useEliminationRewards.ts` para calcular bônus e resto acumulado a partir de `useEliminationData`.
- Ajustes em `src/components/elimination/EliminationStatsCard.tsx`, `src/components/elimination/PlayerEliminationHistory.tsx` e no detalhe/estatísticas do jogador, lendo `eliminationRewardConfig` da temporada.
- Manter os valores de `pointsFromPosition` / `pointsFromEliminations` como fonte de exibição, sem recalcular rankings.
