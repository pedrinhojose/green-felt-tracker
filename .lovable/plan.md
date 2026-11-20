# Modo "Gerência de Partida" no celular

## O que você vai ter
- Um botão **"Gerência de Partida"** na tela da partida e no card da partida em andamento no painel. No celular ele aparece em destaque.
- Ao tocar, abre uma tela limpa, feita para usar com uma mão na mesa:
  - No topo: número da partida, jogadores restantes, prêmio total e nível atual das blinds (só para ver, sem controles do relógio).
  - Lista dos jogadores ainda na mesa, um por linha, com nome grande e quantos rebuys já fez.
  - Em cada linha, dois botões grandes: **+ Rebuy** (verde) e **Eliminar** (vermelho).
  - Rebuy: um toque já registra. Aparece "Desfazer" por alguns segundos, caso tenha sido sem querer.
  - Eliminar: abre a mesma confirmação de hoje (quem eliminou), em formato simples de celular.
  - Campo de busca no topo para achar o jogador rápido.
  - Embaixo, uma seção recolhida "Eliminados" para ver quem já saiu.
- Tudo o que você fizer ali aparece no computador/telão em menos de 1 segundo, com o som "RE BUY" no rebuy, sem mexer no relógio.

## O que não muda
- A tela atual da partida no computador continua igual.
- Rebuy, eliminação, pontos, prêmios e caixinha usam exatamente as mesmas regras de hoje.
- Visitantes (somente leitura) não veem o botão.

## Detalhes técnicos
- Nova rota `/games/:gameId/mesa` (página `GameRemoteControl.tsx`) dentro das rotas autenticadas, reaproveitando `useGameLoader` (realtime já pronto) e as ações existentes de `usePlayerActions` (rebuy/eliminação) e `PlayerEliminationDialog`.
- Desfazer rebuy usa a ação já existente de decrementar rebuys.
- O som toca só no aparelho que recebe a atualização (o computador), não no celular que fez o rebuy, para não duplicar.
- Botão de acesso em `GameHeader.tsx` e `QuickGameCard.tsx`, oculto para papel `viewer` e para partidas encerradas.
- Não toca em `vite.config.ts`, banco de dados nem no relógio.
