

## Reforçar Bloqueio de Encerramento sem Cálculo de Prêmios

### Situação Atual
A validação já existe parcialmente: `canFinishGame` no `GameManagement.tsx` verifica se prêmios foram calculados e o botão fica `disabled`. Porém há **duas falhas**:

1. **O AlertDialog abre mesmo com botão disabled** — no Radix UI, `disabled` no trigger não impede a abertura do dialog, então o usuário vê a confirmação e pode tentar encerrar.
2. **O `handleFinishGame` não valida nada** — se chamado diretamente (por qualquer caminho), encerra sem verificar prêmios.

### Plano

**Arquivo 1: `src/components/game/GameHeader.tsx`**
- Quando `canFinishGame` for `false`, em vez de usar `AlertDialog` com botão disabled, mostrar um **toast de aviso** ao clicar, explicando o motivo do bloqueio (ex: "Clique em 'Calcular Prêmios' primeiro"). O dialog de confirmação só abre se `canFinishGame` for `true`.
- Mostrar visualmente a razão do bloqueio abaixo do botão ou como tooltip mais visível.

**Arquivo 2: `src/hooks/game-management/useGameActions.ts`**
- Adicionar validação de segurança no `handleFinishGame`: verificar se o game tem pelo menos um jogador com `prize > 0` antes de prosseguir. Se não tiver, exibir toast de erro e abortar.

### Resultado
- Dupla proteção: UI impede o clique E a lógica de negócio valida antes de executar.
- Mensagem clara para o usuário sobre o que falta fazer.

