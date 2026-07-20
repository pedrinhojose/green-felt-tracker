# Sistema de Temas (Classic / Modern / Neon Vegas)

## O que muda
Adicionar uma tela **Temas** onde o usuário escolhe entre 3 skins puramente estéticas. A escolha vale para o app inteiro (todas as páginas, cards, modais, botões, sidebar). Zero mudança de funcionalidade, dados ou permissões.

## Os 3 temas

**1. Classic (atual)** — Feltro verde-escuro + dourado APA. Nada muda visualmente para quem não trocar.

**2. Modern (Apple-like)** — Preto grafite com vidro (glassmorphism), bordas 1px translúcidas, sombras suaves em múltiplas camadas, cantos generosos (radius 1rem+), acentos em ciano/violeta suave. Cards com `backdrop-blur`, `bg-white/[0.03]`, borda `border-white/10`, sombra `0 20px 40px -20px rgba(0,0,0,.6)`. Modais com blur do fundo mais forte. Tipografia mantém Poppins/Inter.

**3. Neon Vegas (minha escolha)** — Cassino noturno: preto profundo + roxo elétrico + magenta neon + dourado quente. Cards com relevo 3D real (borda superior clara, sombra inferior escura tipo ficha de poker), glow neon sutil no hover, gradientes diagonais em botões primários, títulos com leve text-shadow neon. Remete a mesa de cassino em Las Vegas.

Preview lado a lado dos 3 na tela Temas, com botão **Aplicar** em cada.

## Como implementar

- **Tokens por tema em `src/index.css`**: manter `:root` como Classic. Adicionar `[data-theme="modern"] { ... }` e `[data-theme="neon"] { ... }` sobrescrevendo as HSL de `--background`, `--card`, `--primary`, `--border`, `--radius`, etc. Também definir tokens extras `--elevation-1`, `--elevation-2`, `--elevation-3` e `--surface-glow` por tema, usados pelos cards/modais.
- **Classes utilitárias** em `@layer components`: `.surface-card` e `.surface-modal` que leem os tokens de elevação — assim cada tema injeta a "cara" (glass, felt, neon) sem tocar componente por componente. Componentes shadcn (Card, Dialog, Sheet, Popover) recebem essas classes via override no arquivo do componente ou via tailwind `@apply`.
- **`ThemeContext`** novo em `src/contexts/ThemeContext.tsx`: guarda o tema atual, persiste em `localStorage` (chave `app-theme`), aplica `document.documentElement.setAttribute('data-theme', theme)` no mount e ao trocar. Provider adicionado no topo em `src/main.tsx` ou `App.tsx`.
- **Página `/themes`** em `src/pages/ThemesPage.tsx`: 3 cards de preview (mini-mockup com header + card + botão renderizados nas cores do tema-alvo, independente do tema ativo — usando estilos inline com os tokens de cada tema). Botão "Aplicar tema" chama `setTheme(...)` do context. Marca o tema ativo com badge "Atual".
- **Sidebar**: adicionar item **"Temas"** com ícone `Palette` em `src/components/layout/AppSidebar.tsx`, visível para todos os roles autenticados (inclusive viewer, pois é só estética).
- **Rota**: registrar `/themes` em `src/App.tsx` dentro do `AppLayout`.

## Escopo dos componentes visuais tocados
As classes `.surface-card` / `.surface-modal` cobrem em uma passada: `Card`, `Dialog/DialogContent`, `Sheet`, `Popover`, `DropdownMenu`, e o container da `Sidebar`. Nenhum arquivo de página é alterado. Nenhuma lógica de negócio, RLS, hook ou repository é tocado.

## Fora de escopo
- Modo claro/escuro por si só (todos os temas são dark; podemos adicionar depois).
- Personalização de cor pelo usuário.
- Salvar preferência de tema no banco (fica em `localStorage` por device — simples e suficiente).
