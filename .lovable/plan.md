## Objetivo

Permitir cadastrar um jogador novo direto da tela de seleção de jogadores (ao abrir uma partida), sem precisar cancelar e sair para a tela de Jogadores.

## Mudanças

### 1. `src/components/game/PlayerSelection.tsx`
- Adicionar botão **"+ Novo jogador"** ao lado do campo de busca (no topo do card, junto do `PlayerSearch`).
- Ao clicar, abre o `AddPlayerDialog` já existente (mesmo componente usado em `PlayersManagement`).
- Estado local no `PlayerSelection`:
  - `isAddDialogOpen`
  - `newPlayer` (name, photoUrl, phone, city)
  - `isSaving`
- Usar o hook `usePlayerPhotoManager` (mesmo padrão do `PlayersManagement`) para foto/câmera/upload.
- Usar `usePoker().addPlayer` para persistir. Após salvar com sucesso:
  - Fechar o diálogo, limpar o form.
  - **Pré-selecionar automaticamente** o novo jogador (adicionar o `id` retornado ao `selectedPlayers`), para que já entre na partida sem exigir clique extra.
  - O `players` do contexto atualiza sozinho, então ele aparecerá na grade filtrada.
- Toast de sucesso/erro.

### 2. Nada mais precisa mudar
- `AddPlayerDialog` e `PlayerForm` são reutilizados como estão.
- `GameManagement.tsx` já passa `players` do contexto, que reflete a inclusão automaticamente.

## Detalhes técnicos

- `addPlayer` no `PokerContext` retorna o registro criado (ou seu `id`) — se não retornar, buscar o jogador recém-criado por nome/`createdAt` no `players` atualizado, ou ajustar o retorno do hook `addPlayer` para expor o id. Verificar `useGameFunctions`/`usePlayerFunctions` antes de implementar; se necessário, retornar o id do jogador criado.
- Manter o layout responsivo: no mobile o botão fica em linha própria abaixo da busca; no desktop, ao lado direito da busca.
- Sem alterações de schema, RLS ou backend.

## Fora de escopo

- Edição/exclusão de jogador a partir dessa tela.
- Importação em massa.
