# Corrigir saldo da caixinha e ajustar para R$ 64,00

## Diagnóstico confirmado no banco

Organização ativa (`3ae276b2...`):

- Contribuições de jogos (todas as temporadas + avulsas): **R$ 880,00**
- Depósitos manuais (todas as temporadas): **R$ 665,00**
- Saques manuais (todas as temporadas): **R$ 1.421,00**

**Saldo correto pela regra org-wide contínua:** 880 + 665 − 1.421 = **R$ 124,00**

**O que a UI mostra hoje (R$ 616,00) é um bug:** na página `CaixinhaManagement`, `totalAccumulated` usa o array `games` do `PokerContext`, que só carrega jogos da temporada ativa (R$ 140,00). Já os depósitos/saques vêm do hook org-wide (665/1421). Resultado híbrido: 140 + 665 − 1.421 = **−616** (exibido como 616 sem sinal). Cards do Dashboard (`CaixinhaCard`, `FinancialSummaryCard`) já estão corretos e usam org-wide.

## O que será feito

### 1. Corrigir o bug de escopo em CaixinhaManagement (frontend)

Arquivo `src/pages/CaixinhaManagement.tsx`:
- Substituir o `totalAccumulated` (que hoje soma `game.players` do `games` filtrado por temporada) por uma consulta org-wide, seguindo o mesmo padrão do `useCaixinhaUnifiedTransactions` (todos os jogos finalizados da organização, em qualquer temporada).
- Fazer o mesmo para `participatingPlayersCount`, para que o card "Jogadores" também seja org-wide.

Nenhuma mudança em `CaixinhaCard`, `FinancialSummaryCard` ou no hook `useCaixinhaUnifiedTransactions` — já estão corretos.

### 2. Ajustar o saldo atual para R$ 64,00 via lançamento de conciliação (banco)

Após a correção acima, o saldo passaria a R$ 124,00. Para chegar em R$ 64,00 conforme sua definição, inserir **um único lançamento de saque de R$ 60,00** na tabela `caixinha_transactions`:

- `type`: `withdrawal`
- `amount`: `60.00`
- `description`: `Ajuste de conciliação inicial da caixinha (saldo definido em R$ 64,00)`
- `withdrawal_date`: data atual
- `organization_id`: organização "3ae276b2..."
- `season_id`: temporada ativa (só para histórico, não afeta cálculo)
- `created_by` / `user_id`: seu usuário admin

Isso aparecerá no histórico como qualquer outra transação, preservando rastreabilidade. Depósitos, saques e contribuições históricas ficam intactos, como você pediu.

### 3. Daqui pra frente

Regra org-wide contínua permanece: nenhum reset entre temporadas, saldo é global da organização.

## Cálculo final esperado

```text
Contribuições de jogos (org):  R$   880,00
+ Depósitos (org):             R$   665,00
- Saques (org, incl. ajuste):  R$ 1.481,00
─────────────────────────────────────────
Saldo Disponível:              R$    64,00
```

## Confirmação necessária

Confirma que posso inserir o lançamento de saque de R$ 60,00 com essa descrição de conciliação? Se preferir outro texto ou outra data, me diga antes de aprovar.
