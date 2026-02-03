

## Plano: Funcao para Trocar Posicoes entre Jogadores

### Resumo

Adicionar uma funcionalidade que permite trocar as posicoes de dois jogadores em uma partida finalizada ou em andamento. Por exemplo, se Pedro ficou em 5o e Anderson em 6o, o admin podera trocar suas posicoes facilmente.

---

### Como Vai Funcionar

```text
+---------------------------------------------+
|  Jogadores da Partida                       |
|---------------------------------------------|
|  Pedro      5o lugar     [Trocar Posicao]   |
|  Anderson   6o lugar     [Trocar Posicao]   |
|  Carlos     4o lugar     [Trocar Posicao]   |
+---------------------------------------------+
          |
          v (Clica em "Trocar Posicao" no Pedro)
+---------------------------------------------+
|  Dialog: Trocar Posicao                     |
|---------------------------------------------|
|  Jogador: Pedro (5o lugar)                  |
|                                             |
|  Trocar com:                                |
|  [Select] Anderson (6o lugar)  v            |
|           Carlos (4o lugar)                 |
|                                             |
|  [Cancelar]           [Confirmar Troca]     |
+---------------------------------------------+
          |
          v (Apos confirmar)
+---------------------------------------------+
|  Pedro agora: 6o lugar                      |
|  Anderson agora: 5o lugar                   |
|  Premios e pontos recalculados!             |
+---------------------------------------------+
```

---

### Arquivos a Criar/Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/components/game/SwapPositionDialog.tsx` | Criar | Dialog para selecionar jogadores e trocar posicoes |
| `src/hooks/usePositionSwap.ts` | Criar | Hook com logica de troca e recalculo |
| `src/components/game/PlayerTableRow.tsx` | Modificar | Adicionar botao "Trocar Posicao" |
| `src/components/game/PlayerMobileCard.tsx` | Modificar | Adicionar botao "Trocar" na versao mobile |
| `src/components/game/PlayersTable.tsx` | Modificar | Gerenciar estado do dialog e passar props |
| `src/pages/GameManagement.tsx` | Modificar | Integrar hook e dialog |

---

### Detalhes Tecnicos

#### 1. Hook usePositionSwap

```typescript
// src/hooks/usePositionSwap.ts
export function usePositionSwap(game: Game, setGame) {
  const swapPositions = async (player1Id: string, player2Id: string) => {
    // 1. Encontrar os dois jogadores
    // 2. Trocar suas posicoes
    // 3. Recalcular pontos baseado na nova posicao
    // 4. Recalcular premios baseado na nova posicao
    // 5. Recalcular saldos
    // 6. Salvar no banco
  };
  
  return { swapPositions };
}
```

#### 2. SwapPositionDialog

- Mostra o jogador selecionado e sua posicao atual
- Lista outros jogadores com posicao definida para trocar
- Confirma a troca e recalcula tudo automaticamente

#### 3. Integracao com Edicao de Partida Finalizada

A funcionalidade funcionara tanto:
- Em partidas em andamento (posicoes ja definidas mas partida nao encerrada)
- Em partidas finalizadas (quando `isEditingFinishedGame` estiver ativo)

---

### Logica de Recalculo Apos Troca

```text
Antes da Troca:
  Pedro:    posicao=5, pontos=6,  premio=0
  Anderson: posicao=6, pontos=4,  premio=0

Apos Trocar:
  Pedro:    posicao=6, pontos=4,  premio=0
  Anderson: posicao=5, pontos=6,  premio=0
```

O sistema ira:
1. Trocar os valores de `position` entre os jogadores
2. Buscar na `scoreSchema` os novos pontos para cada posicao
3. Buscar na `weeklyPrizeSchema` os novos premios para cada posicao
4. Recalcular os saldos considerando os novos premios

---

### Fluxo de Usuario

1. Admin abre partida finalizada e clica em "Editar Partida"
2. Na tabela de jogadores, clica no botao "Trocar" ao lado do jogador errado
3. Dialog abre mostrando outros jogadores com posicao
4. Seleciona o jogador para trocar
5. Clica em "Confirmar Troca"
6. Sistema troca posicoes e recalcula pontos/premios
7. Admin clica em "Salvar Alteracoes" para persistir

---

### Interface do Botao

- **Desktop**: Botao pequeno com icone de setas ao lado do "Eliminar/Reativar"
- **Mobile**: Botao compacto "Trocar" ao lado das acoes existentes

O botao so aparece quando:
- O jogador tem posicao definida (foi eliminado)
- A partida NAO esta finalizada OU esta em modo de edicao (`isEditingFinishedGame`)

---

### Beneficios

1. **Correcao Rapida**: Trocar posicoes erradas sem precisar reativar e eliminar novamente
2. **Recalculo Automatico**: Pontos, premios e saldos ajustados automaticamente
3. **Integracao Perfeita**: Funciona com o sistema existente de edicao de partidas finalizadas
4. **Interface Intuitiva**: Dialog simples para selecionar com quem trocar

