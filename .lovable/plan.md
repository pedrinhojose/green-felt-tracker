## Objetivo
Melhorar o menu sanduíche em mobile/tablet: fechar automaticamente ao clicar em um item e corrigir o fundo transparente que dificulta a leitura.

## Alterações

### 1. `src/components/layout/AppSidebar.tsx`
- Usar o hook `useSidebar()` para acessar `isMobile` e `setOpenMobile`.
- No `onClick` de cada `NavLink` do menu: se `isMobile` for true, chamar `setOpenMobile(false)` para fechar o drawer automaticamente ao navegar.
- Aplicar o mesmo comportamento ao logo do clube (link para `/dashboard`) no `SidebarHeader`.

### 2. Estilo do drawer mobile (fundo sólido)
O drawer mobile é renderizado via `Sheet` dentro de `src/components/ui/sidebar.tsx`. Hoje ele herda `bg-sidebar` que, dependendo do tema ativo, pode ficar translúcido/pouco contrastado sobre o conteúdo.
- Ajustar o `SheetContent` interno do `Sidebar` (branch `isMobile`) para usar fundo sólido do tema `poker-black` (mesma paleta do header) e adicionar `backdrop-blur-md` + borda à direita, garantindo leitura clara em qualquer tema.
- Manter o overlay escuro padrão do `Sheet` (já existente) para escurecer o conteúdo atrás.

### 3. Sem mudanças em desktop
O comportamento da sidebar fixa em desktop (`lg+`) permanece igual — expandida por padrão, colapsável via `SidebarTrigger`.

## Detalhes técnicos
- `useSidebar()` expõe `{ isMobile, openMobile, setOpenMobile, ... }` — é a API oficial do shadcn sidebar para controlar o drawer mobile.
- Não é necessário mexer em `AppLayout.tsx` nem no `SidebarTrigger` do header.
