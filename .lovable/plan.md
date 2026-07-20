# Sidebar lateral no desktop (mobile permanece igual)

## O que muda

No **desktop e tablet (≥1024px)**, a navegação sai do topo e vira uma **sidebar lateral fixa à esquerda**, expandida por padrão (~240px) com ícone + texto de cada item, e um botão para recolher em modo mini (só ícones, ~56px). Tudo dentro da sidebar: logo do clube, itens de menu, seletor de temporada e dropdown do perfil.

No **mobile (<1024px)**, nada muda — continua com a barra superior atual e o menu hambúrguer que já funciona bem.

## Layout desktop

```text
┌──────────────┬────────────────────────────────┐
│  APA Poker   │                                │
│  ───────     │                                │
│  ▸ Painel    │                                │
│  ▸ Config.   │        Conteúdo (Outlet)       │
│  ▸ Partidas  │                                │
│  ▸ Ranking   │                                │
│  ▸ ...       │                                │
│              │                                │
│  ───────     │                                │
│  Temporada:  │                                │
│  [Selector]  │                                │
│  ───────     │                                │
│  [Perfil ▾]  │                                │
└──────────────┴────────────────────────────────┘
```

Recolhida: mesma coluna com apenas os ícones e um botão de expandir no topo.

## Estrutura técnica

- **Novo componente** `src/components/layout/AppSidebar.tsx` usando o shadcn `Sidebar` já disponível em `src/components/ui/sidebar.tsx` (`collapsible="icon"`, ícone + texto expandido por padrão).
  - Reutiliza a mesma lista `navItems` e o mesmo filtro por role (admin / viewer / super admin) que hoje vive em `PokerNav.tsx`.
  - Cada item recebe um ícone lucide (Home, Settings, Trophy, Users, Image, etc.) — hoje só existe texto.
  - `SidebarHeader` → nome do clube (logo/link para `/dashboard`).
  - `SidebarContent` → lista de itens com `NavLink` marcando `isActive`.
  - `SidebarFooter` → `SeasonSelector` + `ProfileDropdown` (ou botão "Entrar" quando deslogado).
  - Trigger de recolher/expandir dentro do próprio `SidebarHeader`.

- **`AppLayout.tsx`** passa a renderizar condicionalmente:
  - `isMobile` (breakpoint atual `< 1024px`, já usado em `PokerNav`): mantém `<PokerNav />` como está.
  - Desktop/tablet: envolve o conteúdo em `<SidebarProvider>` com `<AppSidebar />` + `<main>` contendo o `<Outlet />`. Mantém o `<footer>` embaixo.

- **`PokerNav.tsx`**: sem alterações de lógica. Continua sendo usado no mobile. (Opcional: esconder o bloco desktop via `lg:hidden` para eliminar código morto, mas não é obrigatório.)

- **Persistência do estado recolhido**: o `SidebarProvider` já grava em cookie automaticamente — sem trabalho adicional.

## Detalhes de estilo

- Cor de fundo da sidebar alinhada ao tema atual (`bg-poker-black/90` ou tokens `--sidebar-background`) para casar com o resto do app.
- Item ativo em `text-poker-gold`, hover suave `bg-white/5`, mantendo a identidade visual atual.
- Ícones dos badges especiais preservados: `Crown` para Super Admin, `ShieldAlert` para Usuários.

## Fora de escopo

- Nenhuma mudança no mobile.
- Nenhuma mudança nas rotas, roles, permissões, dados ou em qualquer página de conteúdo.
- Sem alteração nos cards do Dashboard já ajustados anteriormente.
