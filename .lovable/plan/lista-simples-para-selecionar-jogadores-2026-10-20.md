# Lista simples para selecionar jogadores

Trocar os cartões em 3 colunas da tela "Selecionar Jogadores" por uma lista única, só com nomes, fácil de ler de cima para baixo.

## Como ficará

```text
+------------------------------------------+
| Selecionar Jogadores      [5 selecionados]|
| [ Buscar jogador...      ] [+ Novo]       |
| Selecionados: Bruno x  Deivide x  Diego x |
|------------------------------------------|
| A                                         |
|   Alexandre                          [ ]  |
|   André                              [x]  |
| B                                         |
|   Bruno                              [x]  |
| D                                         |
|   Daniel Cunha   -R$ 40   Caixinha ok [x] |
|   Deivide                            [x]  |
|------------------------------------------|
|        [ Iniciar Partida (5) ]            |
+------------------------------------------+
```

- Uma coluna só, em ordem alfabética, com letras separando os grupos (A, B, C...).
- Cada linha: nome + caixa de marcar à direita; linha marcada fica destacada em dourado.
- Sem fotos e sem cartões; os avisos de saldo em aberto e "Caixinha do mês paga" continuam como pequenas etiquetas ao lado do nome.
- Faixa no topo com os já selecionados (toque no x para desmarcar).
- Botão "Iniciar Partida" sempre visível no rodapé, mostrando quantos foram escolhidos.
- Busca e "Novo jogador" continuam iguais.

## Detalhes técnicos
- Alterar apenas `src/components/game/PlayerSelection.tsx`: remover grid/organização vertical e avatares; renderizar lista agrupada por inicial com cores do tema; rodapé fixo (sticky). Nenhuma mudança de regra ou dados.
