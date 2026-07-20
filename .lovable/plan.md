## Problemas observados
1. Em ~1200-1300px o menu do desktop tem itens demais e colide com o nome do clube; o `ProfileDropdown` sai da viewport (só aparece rolando horizontalmente).
2. O card "Top 3" tem botões "Atualizar" e "Exportar" no cabeçalho que quebram o layout, sobrepondo o título e o texto "Atualizado em ...".

## Ajustes

### 1. `src/components/PokerNav.tsx` — Nav responsivo sem estouro
- Trocar o breakpoint do menu mobile de `md` para `lg`: hambúrguer aparece até 1023px (`lg:hidden`), menu desktop só a partir de 1024px (`hidden lg:flex`). Isso libera o desktop nav só quando há espaço real.
- No desktop nav:
  - `gap-6` → `gap-2 xl:gap-4`.
  - `space-x-1` → `space-x-0`.
  - Links: `px-3 py-2` → `px-2 py-2`, `text-sm`, `whitespace-nowrap`.
  - `<ul>` com `min-w-0` para permitir shrink.
- Logo/nome do clube:
  - Manter `flex-1 min-w-0`, adicionar `truncate` no `<h1>`.
  - `text-2xl` → `text-lg xl:text-xl` no desktop, liberando espaço para o menu.
- `SeasonSelector` e `ProfileDropdown` sempre à direita com `flex-shrink-0`, garantindo o ícone de perfil sempre visível.
- Resultado: em ≤1023px o hambúrguer aparece (mobile e tablet), em ≥1024px tudo cabe sem overflow, com o perfil visível.

### 2. `src/components/RankingCard.tsx` — Cabeçalho limpo
- Remover botões "Atualizar" e "Exportar" e o texto "Atualizado em ...".
- Remover imports/estados não usados (`isExporting`, `isRefreshing`, `lastUpdatedAt`, `RefreshCw`, `Download`, `Button`, `useRankingExport`, `useRankingSync`, `handleExportTop3`).
- Cabeçalho fica só com `<h3>Top 3</h3>`.
- Card continua clicável (leva para `/ranking`) onde o usuário atualiza/exporta com os controles daquela página.

### 3. Escopo
- Apenas UI/apresentação nesses dois arquivos. Sem mudança de lógica, rotas ou banco.

## Como isso resolve
- Menu e logo não se sobrepõem: o desktop nav só aparece com espaço suficiente (≥lg) e usa gaps/paddings menores; em telas menores o hambúrguer assume, eliminando o overflow horizontal.
- O ícone de perfil passa a caber sempre na viewport, sem scroll.
- O card Top 3 fica visualmente limpo e não quebra em telas médias.

## Depois de aprovado
Implemento, capturo screenshots em desktop (~1280px) e mobile (~390px) e envio para você conferir.
