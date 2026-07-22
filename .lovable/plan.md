
# Reorganização das Configurações de Temporada

Objetivo: eliminar a confusão entre "criar nova temporada" vs "editar temporada existente", proteger configurações de temporadas já em andamento e mover o botão **Encerrar Temporada** para um local mais adequado.

## O que muda

### 1. Clareza visual (qual temporada estou editando)
- No topo da tela `/season`, mostrar um banner grande e destacado com o nome da temporada sendo editada, seu status (Ativa / Encerrada / Nova) e as datas.
- Ao trocar a temporada no seletor global, se houver alterações não salvas no formulário, exibir confirmação ("Descartar alterações?") antes de recarregar.

### 2. Separar "Criar nova" do fluxo de edição
- Remover o botão **"Nova Temporada"** de dentro da tela de edição.
- A criação passa a acontecer apenas a partir de `/seasons` (lista) via botão dedicado, que abre `/season?new=1` num modo claramente identificado como "Criação".
- No modo criação, o cabeçalho fica em outra cor e mostra "Nova Temporada — não salva ainda".

### 3. Bloquear/avisar edição quando a temporada já tem partidas
- Se a temporada tem 1+ partidas finalizadas, campos estruturais (esquema de pontuação, prêmios, parâmetros financeiros, eliminações) ficam **somente leitura por padrão**, com um botão "Desbloquear edição avançada" que exibe aviso: "Alterações NÃO afetam partidas já jogadas — apenas as próximas".
- Campos livres (nome, regras da casa, blinds, jantares, cronograma) continuam editáveis normalmente.

### 4. Congelar a configuração no momento da partida
- Cada partida (`games`) passa a guardar um snapshot da configuração relevante no momento em que é iniciada (esquema de pontuação, prêmios semanais, parâmetros financeiros, config de eliminação).
- Cálculos de pontuação, prêmios e ranking da partida usam o snapshot da própria partida, não a config atual da temporada.
- Partidas antigas ficam imunes a mudanças posteriores nas configurações.

### 5. Mover botão "Encerrar Temporada"
- Remover o botão **"Encerrar Temporada"** da tela `/season` (Configuração).
- Adicionar em `/seasons/:seasonId` (Detalhes da Temporada), no cabeçalho, visível apenas quando a temporada está ativa e o usuário é admin/editor.
- Mantém o mesmo diálogo de confirmação atual.

## Detalhes técnicos

- **Snapshot da partida**: adicionar coluna JSONB `config_snapshot` em `games` (contendo `scoreSchema`, `weeklyPrizeSchema`, `financialParams`, `eliminationRewardConfig`). Preencher em `useStartGame` no momento da criação. Ajustar `usePrizeDistribution`, `useEliminationRewards` e cálculos de ranking para preferir `game.config_snapshot` quando presente, caindo pra `season.*` como fallback (compatível com partidas antigas).
- **Bloqueio de edição avançada**: em `SeasonConfig.tsx`, checar se `games.length > 0` para a temporada aberta e passar `readOnly` para `ScoreSchemaConfig`, `PrizeSchemaConfig` (semanal e final), `FinancialParamsConfig` e `EliminationRewardConfig`. Estado local `advancedUnlocked` libera após confirmação.
- **Confirmação ao trocar temporada**: `SeasonSelector` recebe callback `onBeforeChange` do form (via contexto leve ou prop), que consulta `formState.isDirty`.
- **Botão Encerrar**: mover o bloco `AlertDialog` de `SeasonConfig.tsx` (linhas 102–120) para o cabeçalho de `SeasonDetails.tsx`, reutilizando `endSeason` do `usePoker()`.

## Fora de escopo
- Recalcular retroativamente pontuação/prêmios de partidas antigas usando snapshot.
- Versionamento/histórico das configurações da temporada (só o snapshot por partida).
