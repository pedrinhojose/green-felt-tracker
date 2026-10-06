# Corrigir a partida "#7" de 05/10 (2ª Temporada 2026)

## O que aconteceu
A data está certa: a partida foi jogada hoje, 05/10. O que está errado é o **número**: devia ser **#14**.

Linha do tempo da temporada:
```text
#1 06/07 ... #6 17/08 | (sem #7) | #8 24/08 ... #13 28/09 | "#7" 05/10
```
Em agosto, uma partida #7 foi aberta e depois cancelada ou excluída. Ficou um "buraco" no número 7. Hoje o sistema procura o primeiro número livre, em vez de pegar o próximo depois do maior. Por isso a partida nova ficou com o 7 e aparece fora da ordem.

## Correção (sem perder dados)
1. **Ajustar só o número** da partida de 05/10, de 7 para 14. Jogadores, colocações, pontos, prêmios, eliminações, caixinha e jackpot continuam iguais. O ranking não muda, porque os pontos não dependem do número da partida.
2. **Evitar que aconteça de novo**: partidas novas passam a receber sempre o maior número da temporada + 1. Buracos deixados por partidas canceladas não são mais reaproveitados.

## Detalhes técnicos
- Dado: `UPDATE games SET number = 14 WHERE id = 'b529d7b3-74dd-4b12-be08-a959dc588073'` (só a coluna `number`).
- Código: em `src/contexts/useGameFunctions.ts`, `findNextAvailableNumber` passa a retornar `max(numbers) + 1` (ou 1 se a temporada não tiver partidas).
- Depois, conferir pelo app se a lista de partidas e o relatório mostram a sequência #1–#6, #8–#14.
