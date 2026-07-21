Plan: Reorganizar Financeiro/Caixinha no menu lateral

1. Criar container `Financeiro` (`src/pages/Finance.tsx`)
   - Página com abas/sub-nav: Recebimentos, Jackpot, Caixinha.
   - Usa `<Outlet />` para renderizar o conteúdo de cada aba.
   - Header único "Financeiro".

2. Refatorar rotas em `src/App.tsx` (dentro do bloco `RequireEditor`)
   - Remover rota `/caixinha`.
   - Adicionar redirect `/caixinha -> /finance/caixinha`.
   - Adicionar redirect `/finance/club-cash -> /finance/caixinha`.
   - Criar grupo aninhado `/finance`:
     - `/finance` -> `Finance.tsx` (com abas)
     - `/finance/receivables` -> `FinanceReceivables`
     - `/finance/jackpot` -> `FinanceJackpot`
     - `/finance/caixinha` -> `CaixinhaManagement` (conteúdo real do caixa do clube)

3. Atualizar `src/components/layout/AppSidebar.tsx`
   - Remover botão "Caixinha" do menu principal.
   - Remover o grupo colapsável "Financeiro" e o array `financeNavItems`.
   - Adicionar um único botão de primeiro nível "Financeiro" no lugar do antigo Caixinha, com ícone Wallet/PiggyBank.
   - Manter `hideForViewer: true`.

4. Repensar conteúdo do Caixinha
   - Reutilizar todo o conteúdo funcional de `src/pages/CaixinhaManagement.tsx` na aba Caixinha (`/finance/caixinha`).
   - Excluir o placeholder `src/pages/FinanceClubCash.tsx`.

5. Atualizar links internos
   - `src/components/CaixinhaCard.tsx`: navegar para `/finance/caixinha`.
   - `src/components/FinancialSummaryCard.tsx`: navegar para `/finance/caixinha`.
   - `src/components/PokerNav.tsx`: remover Caixinha, adicionar Financeiro (código morto, mas manter consistente).

6. Verificar
   - Build de produção sem erros.
   - Preview: sidebar mostra apenas "Financeiro" como botão principal; visitantes não veem o menu; `/caixinha` redireciona para dentro do Financeiro.