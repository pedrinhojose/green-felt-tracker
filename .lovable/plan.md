

## Plano: Exigir "Calcular Premios" Antes de Encerrar Partida

### Resumo

Bloquear o botao "Encerrar Partida" ate que o admin tenha clicado em "Calcular Premios". Isso garante que os pontos, premios e saldos estejam corretamente calculados antes de finalizar, evitando inconsistencias no ranking e jackpot.

---

### Logica de Validacao

Para permitir o encerramento, **todas** as condicoes devem ser verdadeiras:

1. **Todos os jogadores eliminados** - Nenhum jogador pode estar ativo (ainda jogando)
2. **Todos tem posicao definida** - `position !== null` para todos
3. **Premios foram calculados** - Pelo menos um jogador tem `prize > 0`

```text
+------------------------------------------------------------------+
| Verificacao antes de Encerrar                                    |
|------------------------------------------------------------------|
|                                                                  |
| [x] Todos os jogadores foram eliminados                          |
| [x] Todas as posicoes foram definidas                            |
| [x] Os premios foram calculados (botao "Calcular Premios")       |
|                                                                  |
+------------------------------------------------------------------+
```

---

### Comportamento do Botao

| Estado | Botao | Acao |
|--------|-------|------|
| Premios NAO calculados | Desabilitado + Tooltip | "Clique em 'Calcular Premios' antes de encerrar" |
| Premios calculados | Habilitado | Permite encerrar normalmente |

---

### Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/components/game/GameHeader.tsx` | Adicionar prop `canFinishGame` e logica de validacao |
| `src/pages/GameManagement.tsx` | Calcular e passar `canFinishGame` baseado no estado do game |

---

### Implementacao

#### 1. GameManagement.tsx - Calcular se pode encerrar

```typescript
// Verificar se pode encerrar a partida
const canFinishGame = useMemo(() => {
  if (!game || game.isFinished) return false;
  
  // Todos os jogadores devem estar eliminados
  const allEliminated = game.players.every(p => p.isEliminated);
  
  // Todos devem ter posicao definida
  const allHavePosition = game.players.every(p => p.position !== null);
  
  // Premios devem estar calculados (pelo menos um com prize > 0)
  const prizesCalculated = game.players.some(p => p.prize > 0);
  
  return allEliminated && allHavePosition && prizesCalculated;
}, [game]);

// Mensagem explicativa quando nao pode encerrar
const finishGameBlockReason = useMemo(() => {
  if (!game || game.isFinished) return null;
  
  const activePlayersCount = game.players.filter(p => !p.isEliminated).length;
  if (activePlayersCount > 0) {
    return `Ainda ha ${activePlayersCount} jogador(es) ativo(s)`;
  }
  
  const playersWithoutPosition = game.players.filter(p => p.position === null);
  if (playersWithoutPosition.length > 0) {
    return `${playersWithoutPosition.length} jogador(es) sem posicao`;
  }
  
  const hasPrizes = game.players.some(p => p.prize > 0);
  if (!hasPrizes) {
    return "Clique em 'Calcular Premios' primeiro";
  }
  
  return null;
}, [game]);
```

#### 2. GameHeader.tsx - Receber props e mostrar estado

Nova prop:
```typescript
interface GameHeaderProps {
  // ... props existentes
  canFinishGame?: boolean;
  finishGameBlockReason?: string | null;
}
```

Botao atualizado:
```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button 
      variant="destructive"
      size={isMobile ? "sm" : "sm"}
      className={isMobile ? "w-full justify-center" : ""}
      disabled={isGuest || !canFinishGame}
      title={
        isGuest 
          ? "Acao indisponivel no modo visitante" 
          : !canFinishGame 
            ? finishGameBlockReason || "Partida nao pode ser encerrada"
            : undefined
      }
    >
      {isMobile ? "Encerrar" : "Encerrar Partida"}
    </Button>
  </AlertDialogTrigger>
  {/* ... resto do dialog */}
</AlertDialog>
```

---

### Fluxo do Admin

```text
1. Admin gerencia a partida
          |
          v
2. Todos os jogadores sao eliminados (posicoes atribuidas)
          |
          v
3. Admin clica em "Calcular Premios"
   - Sistema calcula premios, pontos e saldos
   - Botao "Encerrar Partida" fica HABILITADO
          |
          v
4. Admin clica em "Encerrar Partida"
   - Dialog de confirmacao aparece
   - Partida e finalizada com dados corretos
          |
          v
5. Rankings e jackpot sao atualizados corretamente
```

---

### Feedback Visual

Quando o botao estiver desabilitado:
- Cor: vermelho opaco (estilo disabled)
- Tooltip: mostra o motivo do bloqueio
- Exemplo: "Clique em 'Calcular Premios' primeiro"

---

### Beneficios

1. **Previne dados incorretos** - Nao e possivel encerrar sem premios calculados
2. **Previne inconsistencias no jackpot** - Contribuicoes serao calculadas corretamente
3. **Previne erros no ranking** - Pontos serao atribuidos antes do encerramento
4. **Feedback claro** - Admin sabe exatamente o que falta fazer

