
# Aba Recebimentos — Módulo Financeiro

## Regra de corte (importante)
A funcionalidade de Recebimentos considera **apenas partidas com data ≥ 20/07/2026**. Partidas anteriores ficam fora do relatório (não aparecem como pendentes nem como pagas), preservando o histórico intacto. Daqui em diante, toda partida nova entra automaticamente no fluxo.

## Banco de dados
Nova tabela `game_player_settlements` para registrar a baixa de cada saldo por (partida, jogador):
- vínculo com clube, partida e jogador
- `amount` (negativo = jogador deve; positivo = prêmio a pagar)
- `status`: `pendente`, `a_receber`, `pago`, `premiado_pago`
- `payment_method`: Pix, Dinheiro, Outro
- `settled_at`, `settled_by`, `notes`
- Índice único por (game_id, player_id) para permitir upsert
- Realtime habilitado

Regras de acesso:
- Membros do clube visualizam
- Somente administradores dão baixa / editam / desfazem

## Tela `/finance/receivables`

### Cards de resumo (topo)
- **A Receber do Clube** — soma dos saldos negativos pendentes
- **A Pagar (Prêmios)** — soma dos prêmios ainda não pagos
- **Total Quitado no Período** — soma de tudo já baixado

### Filtros
- Seleção de partida (dropdown: "Todas" + lista de partidas ≥ 20/07/2026, mais recentes primeiro)
- Status: Todos / Pendentes / A Receber / Quitados
- Busca por nome do jogador

### Tabela
Colunas: Jogador (foto + nome) · Partida/Data · Valor (vermelho se devedor, verde se prêmio) · Status (badge colorido) · Ações
- Devedor → botão **Dar Baixa** (modal com método: Pix / Dinheiro / Outro)
- Ganhador → botão **Pagar Prêmio** (modal com método)
- Quitado → check verde + botão **Desfazer**

## Fonte dos dados
Cada partida finalizada guarda `players[]` (JSONB) com `balance` por jogador. A tela cruza esses saldos com `game_player_settlements` por (game_id, player_id): sem registro = pendente/a_receber conforme o sinal do saldo; com registro = usa o status salvo.

## Atualização em tempo real
Assinatura Supabase Realtime na tabela `game_player_settlements` — ao dar baixa, a UI recalcula os cards e a linha muda de status sem reload.

## Estilo
Mantém o tema escuro/roxo atual, `surface-card`, badges do design system, botões responsivos.

## Arquivos
- Migration: cria tabela, políticas, trigger updated_at, realtime
- `src/hooks/useReceivables.ts` — carrega partidas ≥ 2026-07-20, junta com settlements, assina realtime
- `src/pages/FinanceReceivables.tsx` — substitui o placeholder atual
- `src/components/finance/ReceivablesSummaryCards.tsx`
- `src/components/finance/ReceivablesFilters.tsx`
- `src/components/finance/ReceivablesTable.tsx`
- `src/components/finance/SettlePaymentDialog.tsx` (Dar Baixa / Pagar Prêmio / Desfazer)

## Fora do escopo
- Retroagir partidas anteriores a 20/07/2026
- Exportação PDF/Excel de recebimentos (pode virar próxima iteração)
