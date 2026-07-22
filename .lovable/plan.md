
## Objetivo

Transformar recebimentos de "por partida" em "por jogador", com aviso visual na abertura de partida e compensação automática do saldo pendente ao encerrar uma nova partida.

## 1. Visão consolidada por jogador (aba Recebimentos)

Adicionar um toggle no topo da aba: **"Por partida" | "Por jogador"** (default: por jogador).

**Modo "Por jogador"** — nova tabela agrupada:
- Colunas: Jogador, Saldo Total (soma de `amount` das linhas em aberto), Partidas em aberto (contador), Última partida, Ações.
- Linha expansível mostra as partidas individuais que compõem o saldo (mesmo layout atual com o breakdown).
- Ação **"Quitar tudo"** dá baixa em lote em todas as linhas pendentes do jogador (mesmo `payment_method`, mesma `settled_at`).
- Cards de resumo do topo continuam iguais.

Modo "Por partida" mantém o comportamento atual sem mudanças.

## 2. Aviso visual em PlayerSelection

Ao abrir a tela de seleção de jogadores:
- Buscar em `game_player_settlements` (via novo hook `usePlayerOpenBalances`) todas as pendências em aberto (`status in ('pendente','a_receber')`) da organização, agrupadas por `player_id`.
- No card de cada jogador com pendência: badge no canto superior com valor consolidado.
  - Vermelho `-R$ X` se devedor
  - Verde `+R$ X` se credor de prêmio
- Tooltip ao passar o mouse: "3 partidas em aberto — clique em Recebimentos para detalhes".
- Nenhum bloqueio; apenas informativo.

## 3. Compensação automática ao finalizar partida

Quando a partida é marcada como finalizada (`is_finished = true`) e as linhas de `game_player_settlements` da nova partida são criadas:

Para cada jogador da partida recém-finalizada:
1. Buscar todas as `settlements` em aberto anteriores do mesmo jogador (`pendente` ou `a_receber`).
2. Se o jogador tem saldo antigo com sinal oposto ao da partida nova, compensar do mais antigo para o mais novo até esgotar:
   - Ex.: devia R$ 50 (antigo) + ganhou R$ 80 (novo) → quita a linha antiga com `payment_method = 'compensacao_automatica'` e `notes = 'Compensado com partida #NN'`; a linha nova passa para status `a_receber` com valor original R$ 80 (mantido, para rastreio) mas ganha um campo `offset_amount = 50` para exibição do líquido.
   - Ex. inverso: prêmio antigo R$ 30 + devedor novo R$ 100 → quita a linha antiga como `premiado_pago (compensacao)`, nova linha permanece `pendente`.
3. Se sinais iguais (dois débitos, dois prêmios) → nada a compensar.

Todo o passo roda em uma função Postgres `settle_game_with_offsets(p_game_id uuid)` chamada imediatamente após a criação das linhas da partida nova. Assim, é atômico e não depende do cliente.

Regra: só compensa partidas com data ≥ 20/07/2026 (mantém corte histórico já em vigor).

## 4. Alterações técnicas

### Banco
- Migration:
  - Adicionar coluna `offset_amount numeric default 0` em `game_player_settlements` (para mostrar quanto do valor foi abatido por compensação).
  - Adicionar `'compensacao_automatica'` como valor válido em `payment_method` (texto livre, só documentar).
  - Criar função `public.settle_game_with_offsets(p_game_id uuid)` com `SECURITY DEFINER` que percorre os jogadores da partida, encontra pendências opostas anteriores e atualiza status/offset. Retorna JSON com o resumo do que foi compensado.
- RLS: nenhuma mudança (função roda como definer).

### Frontend
- `src/hooks/usePlayerOpenBalances.ts` (novo): lê pendências agrupadas por `player_id` da organização atual, com realtime.
- `src/components/game/PlayerSelection.tsx`: consumir o hook e renderizar badge no card do jogador.
- `src/pages/FinanceReceivables.tsx`: adicionar toggle "Por partida | Por jogador" e a tabela agrupada; ação "Quitar tudo" abre o `SettlePaymentDialog` existente em modo lote.
- `src/hooks/useReceivables.ts`: expor um segundo memo `receivablesByPlayer` agregando `rows`; incluir `offset_amount` na leitura para exibir "líquido após compensação" no breakdown.
- `src/lib/db/repositories/GameRepository.ts` ou onde a partida é finalizada: após inserir as linhas em `game_player_settlements`, chamar `supabase.rpc('settle_game_with_offsets', { p_game_id })` e mostrar toast com o resumo ("2 pendências compensadas automaticamente").
- Breakdown (`PlayerReceivableBreakdown.tsx`): quando `offset_amount > 0`, adicionar linha "Compensação de saldo anterior" e recalcular o "Resultado líquido a receber/pagar".

## 5. Fora do escopo

- Bloqueio de buy-in por dívida (foi descartado).
- Migração retroativa de compensações em partidas já finalizadas antes desta feature — só passa a valer nas próximas partidas finalizadas.
