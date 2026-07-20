## Objetivo

Adicionar um novo card no Dashboard (mesmo estilo do card Financeiro — dividido em duas metades) com atalhos para iniciar partidas, preenchendo o quarto slot da grade.

## Layout do novo card

Título: **Partidas**

- **Metade superior** — "Abrir partida da temporada"
  - Cria uma partida vinculada à temporada selecionada (mesma lógica de `handleCreateGame` em `GamesList.tsx` → chama `createGame(activeSeason.id)` e navega para `/games/{id}`).
  - Desabilitado (com mensagem/tooltip discreto) se não houver `activeSeason`.
- **Metade inferior** — "Abrir partida avulsa"
  - Cria uma partida sem vínculo (mesma lógica de `handleCreateStandaloneGame` → chama `createStandaloneGame()` e navega).

Ambas as ações replicam exatamente o comportamento já existente na aba Partidas — sem duplicar regras, apenas reutilizando as funções do `usePoker()`.

## Regras de visibilidade

- Card escondido para `viewer` (`useOrgMemberRole().isViewer`), igual ao padrão de `RestoreButton`/`BackupButton`.
- Estado `isCreating` local para desabilitar os botões durante criação.
- Toasts de erro iguais aos de `GamesList` para consistência.

## Arquivos

1. **Criar** `src/components/QuickGameCard.tsx` — clone visual de `FinancialSummaryCard.tsx` (mesmas classes `card-dashboard`, split vertical, ícones da lucide-react — sugestão: `PlayCircle` em cima, `Zap` embaixo).
2. **Editar** `src/pages/Dashboard.tsx` — importar `QuickGameCard` e inseri-lo no grid 4-colunas (após `LastGameCard`), respeitando `!isViewer`.

## Não-alvos

- Nenhuma mudança em `GamesList.tsx`, contexto, ou lógica de criação de partida.
- Sem migração de banco.
- Sem alteração no card Financeiro.
