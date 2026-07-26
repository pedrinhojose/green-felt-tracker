## Diagnóstico (verificado no código)

Em `src/components/game/GameHeader.tsx`, os botões de exportação **não verificam se a partida foi encerrada**:

- Linha 125-134 ("Exportar Relatório / PDF"): `disabled={isExporting}` — ativo mesmo para partida em andamento.
- Linha 136-145 ("Exportar Imagem"): `disabled={isExportingImage}` — ativo mesmo para partida em andamento.

O componente já recebe a prop `isFinished` (linha 40, 63), então basta usá-la na condição de `disabled`. O botão de "Exportar Link" já faz isso corretamente (`{isFinished && !isReadOnly && (...)}`, linha 147).

## Plano de correção

1. Em `src/components/game/GameHeader.tsx`, alterar os dois botões de exportação:
   - Adicionar `|| !isFinished` na prop `disabled` de ambos.
   - Opcionalmente, adicionar `title` informativo quando desabilitado: "Disponível apenas após encerrar a partida".
2. Não alterar `onExportReport`/`onExportReportAsImage` em `GameManagement.tsx` nem as funções de exportação — a prevenção fica na UI.
3. Verificar se há outro local onde esses botões apareçam (ex.: `LastGameCard.tsx`) — lá já está correto (`!lastGame.isFinished`), então não precisa de ajuste.
4. Testar visualmente: abrir uma partida em andamento e confirmar que "Exportar Relatório" e "Exportar Imagem" estão desabilitados; depois de encerrar, devem ficar clicáveis.

## Fora do escopo
- Não alterar texto, layout, estilos ou temas dos botões.
- Não modificar a lógica de exportação em si.
