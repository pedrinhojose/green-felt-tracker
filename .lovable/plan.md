## Problema

Ao tentar excluir a partida `f2893f9f-...`, o console mostra:
```
GameRepository.getGame: Game encontrado: false
Error: Game not found
```

Consultando o Supabase, essa partida **não existe mais no banco** (foi removida em cascata quando a temporada foi excluída), mas continua aparecendo na lista local (`gamesCount: 2`) porque o estado em memória do `PokerContext` não foi ressincronizado após a exclusão da temporada.

O `deleteGame` em `src/contexts/useGameFunctions.ts` faz `pokerDB.getGame(gameId)` e, se não encontrar, lança `Error('Game not found')` — impedindo a limpeza da lista. Ou seja, é uma partida "fantasma" que nunca pode ser removida pela UI.

## Solução

Tornar o `deleteGame` **idempotente** e resiliente a partidas órfãs, e garantir que a lista local reflita o banco.

### Alterações

**1. `src/contexts/useGameFunctions.ts` — função `deleteGame`**
- Se `pokerDB.getGame(gameId)` retornar `undefined`, **não lançar erro**. Em vez disso:
  - Pular toda a lógica de reversão de rankings/jackpot (não há o que reverter).
  - Ainda chamar `pokerDB.deleteGame(gameId)` (best-effort, ignorando erro caso a linha realmente não exista).
  - Remover o jogo do estado local (`setGames(prev => prev.filter(g => g.id !== gameId))`).
  - Atualizar `lastGame` se necessário.
  - Exibir toast de sucesso ("Partida removida da lista").
- Mantém o comportamento atual quando a partida existe no banco.

**2. `src/pages/GamesList.tsx` — `handleDeleteGame`**
- Ajustar o tratamento de erro para não exibir toast de erro quando o motivo era "Game not found" (agora resolvido internamente, mas defensivo).

### Resultado

O usuário conseguirá excluir a partida órfã que sobrou da temporada apagada. Além disso, o sistema fica protegido contra futuras inconsistências entre cache local e banco.

### Observação

Não é necessária alteração de RLS — as políticas de `DELETE` da tabela `games` já funcionam (as outras partidas foram excluídas com sucesso). O problema é puramente de estado local vs. banco.
