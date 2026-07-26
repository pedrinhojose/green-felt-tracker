## Objetivo

Separar claramente duas coisas que hoje se misturam na tela `/season`:

1. **Ver/editar a configuração de UMA temporada específica** (a partir do card dela).
2. **Criar uma nova temporada do zero** (menu lateral "Configurações"), sem risco de alterar sem querer a temporada ativa.

Faz sentido sim — hoje `/season` sempre abre a temporada ativa, então o menu lateral é justamente o caminho mais fácil para mexer sem querer na temporada em andamento.

## O que muda

### 1. Botão "Conf. da Temporada" no card
Em Temporadas, cada card ganha um terceiro botão abaixo de "Relatório" e "Ver detalhes": **Conf. da Temporada**. Ele abre a tela de configuração já carregada com os valores daquela temporada (pontuação, premiação semanal/final, eliminações, blinds, jantares, regras, financeiro/jackpot).

### 2. Configuração por temporada (não só a ativa)
A tela de configuração passa a aceitar a temporada pela URL. Se vier uma temporada específica, carrega os dados dela; o banner de contexto no topo mostra o nome e o status ("Ativa" / "Encerrada").

### 3. Menu lateral "Configurações" = sempre nova temporada em branco
O item do menu passa a abrir sempre o formulário de criação, com os valores padrão do sistema e sem herdar nada da temporada ativa. Nada que for digitado ali afeta uma temporada existente enquanto não for salvo como nova.

### 4. Proteções para temporadas com histórico
Mantém a trava atual: ao abrir a configuração de uma temporada que já tem partidas, as abas estruturais (pontuação, prêmios, financeiro, eliminações) vêm bloqueadas, com o botão "Desbloquear edição avançada". Temporadas **encerradas** ficam em modo somente-leitura (sem botão Salvar), já que alterar config de temporada finalizada só gera inconsistência.

## Sugestões que talvez você esteja esquecendo

- **Renomear o item do menu** de "Configurações" para **"Nova Temporada"** — o nome atual sugere "config global do app" e é o que causa a confusão.
- **Botão "Duplicar configuração"** dentro da conf. de uma temporada: cria uma nova temporada já herdando aqueles valores (substitui bem o "herdar da anterior" atual, e de forma explícita).
- **Modo leitura para viewer/ApaHub**: quem não é admin vê a configuração, mas sem campos editáveis.

## Detalhes técnicos

- `src/pages/SeasonsList.tsx`: novo botão navegando para `/season?seasonId=<id>`.
- `src/pages/SeasonConfig.tsx`: ler `seasonId` de `useSearchParams`; resolver a temporada alvo em `seasons` (fallback para `activeSeason` somente quando não houver param e não for `new=1`); `isCreating` verdadeiro quando `new=1` **ou** quando não houver `seasonId`; `inheritFromPrevious` inicia `false` no fluxo de menu lateral.
- `src/hooks/useSeasonForm.ts` / `src/hooks/season/useSeasonFormInitializer.ts`: já recebem a temporada por parâmetro — basta passar a temporada resolvida em vez de `activeSeason`.
- `src/hooks/season/useSeasonFormSubmitter.ts`: garantir que o update use o `id` da temporada alvo.
- Somente-leitura para temporada encerrada: `fieldset disabled` global + esconder o botão Salvar.
- `src/components/layout/AppSidebar.tsx`: item aponta para `/season?new=1` e rótulo "Nova Temporada".

Nenhuma mudança de banco de dados é necessária.
