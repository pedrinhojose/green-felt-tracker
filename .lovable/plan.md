# Caixinha automática por mês

Hoje, ao montar uma partida da temporada, todos os jogadores entram com o caixinha **desmarcado** e o admin precisa marcar manualmente quem paga. A ideia é o sistema decidir sozinho.

## Regra de negócio

- O caixinha é cobrado **uma vez por mês** de cada jogador.
- Ao iniciar uma partida da temporada, cada jogador selecionado entra com o caixinha:
  - **marcado** se ele ainda não pagou no mês da data da partida;
  - **desmarcado** se já pagou em alguma partida daquele mesmo mês.
- Exemplo: partida do dia 07/08 → todos marcados. Partida do dia 14/08 → quem jogou no dia 07 vem desmarcado; quem não jogou no dia 07 vem marcado.
- Sem cobrança retroativa: só conta o mês da data da própria partida (nunca meses anteriores).
- Partidas avulsas não têm caixinha: continuam sempre desmarcadas e **não** contam como pagamento do mês.
- O admin continua podendo marcar/desmarcar manualmente na mesa (comportamento atual mantido).

## Onde aparece

1. **Ao iniciar a partida** (`Iniciar Partida`): os jogadores já entram com o caixinha correto.
2. **Jogador adicionado depois** (entrada atrasada / late player): mesma regra aplicada no momento da inclusão.
3. **Tela de seleção de jogadores**: cada jogador que já pagou o caixinha no mês recebe um selo discreto "Caixinha do mês paga", para o admin entender por que ele virá desmarcado.

## Detalhes técnicos

- Novo hook `src/hooks/useCaixinhaMonthlyStatus.ts`: recebe a data de referência da partida e retorna um `Set<playerId>` de quem já pagou no mês.
  - Fonte: tabela `games` da organização atual, filtrando `is_standalone = false`, data dentro do mês de referência (limites locais, via `parseLocalDate`/início e fim do mês local para evitar deslocamento de fuso), e o jogo atual excluído.
  - Considera pago quando, no JSONB `players`, o jogador tem `participatesInClubFund = true` e `clubFundContribution > 0`.
  - Inclui partidas ainda não finalizadas do mês (o caixinha já foi lançado), evitando cobrança dupla se duas partidas do mês estiverem abertas.
- `src/hooks/player-actions/useStartGame.ts`: substituir `participatesInClubFund: false` por `!alreadyPaidThisMonth(playerId)` quando não for partida avulsa (avulsa permanece `false`), e já calcular `clubFundContribution` coerente com `effectiveSeason.financialParams.clubFundContribution`.
- `src/hooks/player-actions/useLatePlayerActions.ts`: mesma lógica para o jogador que entra depois.
- `src/components/game/PlayerSelection.tsx`: exibir o selo "Caixinha do mês paga" usando o mesmo `Set`, sem alterar a lógica de seleção de jogadores.
- Nenhuma mudança de banco de dados, nenhuma alteração em partidas já existentes ou em cálculo de ranking/jackpot.
