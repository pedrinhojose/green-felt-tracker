## Diagnóstico (confirmado no banco)

Consultei a partida aberta (`b2328762…`): o campo `standalone_config` está **NULL**.

```text
is_standalone: true
standalone_config: NULL
players: [ rebuys: 9, addons: 1, balance: -33.33 ]  <- só a janta entrou
```

Sem essa config, `useEffectiveSeason` monta uma temporada sintética com `buyIn: 0, rebuy: 0, addon: 0`. Os rebuys/add-ons **estão sendo contados** (9 rebuys, 1 add-on), mas cada um vale R$ 0,00. A janta aparece porque o custo dela é digitado direto na partida (`dinner_cost: 200`).

Causa: existem dois caminhos de criação de partida avulsa e só um passa a configuração.
- `QuickGameCard` (Dashboard): abre o diálogo e chama `createStandaloneGame(config)` — correto.
- `GamesList` (tela Partidas): chama `createStandaloneGame()` **sem argumento** (`src/pages/GamesList.tsx:75`) — nasce sem valores.

**Partidas de temporada não têm esse problema**: usam os `financialParams` da temporada ativa. O único risco lá é `useEffectiveSeason` sempre devolver a temporada *ativa*, então uma partida de temporada encerrada usaria parâmetros errados — corrigir junto.

## Plano de correção

### 1. Bloqueio + escolha ao iniciar partida avulsa
Nenhuma partida avulsa poderá ser criada/iniciada sem valores. Ao clicar em "Nova partida avulsa" (tanto no Dashboard quanto na tela Partidas), aparece um diálogo:

> **Partida sem configuração** — é preciso definir os valores antes de iniciar.
> [ Usar valores da temporada atual ]  [ Configurar manualmente ]

- **Usar valores da temporada atual**: copia da temporada ativa buy-in, rebuy, add-on, esquema de premiação semanal e estrutura de blinds. **Ignora** jackpot, caixinha, pontuação/ranking e recompensas de eliminação (ficam zerados/vazios). O snapshot é gravado no `standalone_config` da partida — se a temporada mudar depois, a partida avulsa não muda.
- **Configurar manualmente**: abre o `StandaloneGameDialog` atual.
- Se não houver temporada ativa, o botão "Usar valores da temporada atual" fica desabilitado com aviso.

### 2. Nunca gravar config nula
Em `useGameFunctions.createStandaloneGame`, se nenhuma config chegar, lançar erro em vez de criar a partida zerada. Assim o bug não pode se repetir por nenhum caminho.

### 3. Ajustar/consertar partida avulsa já criada
No `GameHeader`, para partidas avulsas não encerradas, botão **"Configurar partida"** com as mesmas duas opções. Ao salvar, o sistema recalcula pote, prêmios e saldos usando os contadores já existentes — é assim que a partida atual (rebuys 9/5/2/1/1/1) será recuperada sem refazer nada.

### 4. Aviso visual
Banner de alerta na partida avulsa sem configuração: "Esta partida não tem buy-in/rebuy/add-on definidos — os valores ficarão zerados."

### 5. Temporada correta em partidas antigas
`useEffectiveSeason` passa a resolver a temporada pelo `game.seasonId` (fallback para a ativa) em vez de sempre usar a ativa.

## Detalhes técnicos

- Ampliar `StandaloneGameConfig` (`src/lib/db/models.ts`) com `blindStructure?: BlindLevel[]` para o snapshot dos blinds.
- `useEffectiveSeason` passa a usar `cfg.blindStructure` na temporada sintética; jackpot/caixinha/scoreSchema permanecem zerados, garantindo que avulsa não afete ranking nem jackpot.
- Novo componente `StandaloneGameSetupDialog` (escolha das duas opções) reutilizando o `StandaloneGameDialog` existente para o modo manual.
- Arquivos: `src/pages/GamesList.tsx`, `src/components/QuickGameCard.tsx`, `src/contexts/useGameFunctions.ts`, `src/hooks/useEffectiveSeason.ts`, `src/components/game/GameHeader.tsx`, `src/components/game/StandaloneGameDialog.tsx`, `src/lib/db/models.ts`.
- Sem migração de banco: `standalone_config` é JSONB e já é persistido pelo `GameRepository`.
- O recálculo reaproveita `usePrizeDistribution` e o cálculo de saldo existentes — sem mudar regras de negócio.
