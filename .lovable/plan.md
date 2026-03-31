

## Correção: Posições Duplicadas na Eliminação

### Problema
A função `eliminatePlayer` usa `game.players` (estado potencialmente desatualizado) para calcular posições. Se duas eliminações acontecem rapidamente, ambas leem o mesmo `eliminatedPlayersCount`, gerando posições iguais. Além disso, ao reativar um jogador, as posições dos outros não são recalculadas.

### Solução

Modificar **um único arquivo**: `src/hooks/player-actions/useEliminationActions.ts`

1. **Adicionar um flag de lock** (`useRef`) para impedir eliminações simultâneas - enquanto uma eliminação está sendo processada, outra não pode iniciar.

2. **Usar `setGame` com callback** para sempre ler o estado mais recente do jogo ao calcular posições, em vez de usar a variável `game` que pode estar desatualizada.

3. **Adicionar validação de posição duplicada**: antes de atribuir uma posição, verificar se ela já existe entre os jogadores eliminados. Se existir, calcular a próxima posição disponível.

4. **Recalcular posições na reativação**: quando um jogador é reativado, recalcular as posições dos jogadores eliminados que tinham posição maior (pior) que a dele, movendo-os uma posição para cima.

### Mudanças técnicas

```typescript
// Adicionar ref de lock
const isProcessing = useRef(false);

// Na eliminatePlayer:
if (isProcessing.current) {
  toast({ title: "Aguarde", description: "Processando eliminação anterior..." });
  return;
}
isProcessing.current = true;
try {
  // Usar setGame com callback para estado fresco
  // Validar posição não duplicada
  // ...
} finally {
  isProcessing.current = false;
}
```

5. **Mesma proteção para `eliminateMultiplePlayers`**: aplicar o lock e a validação de posições únicas no batch.

### Resultado esperado
- Impossível ter duas eliminações simultâneas (lock)
- Posições sempre calculadas do estado mais recente
- Validação extra contra duplicatas como rede de segurança
- Reativação recalcula posições corretamente

