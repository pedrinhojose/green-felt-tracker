

## Plano: Correção Automática do Jackpot

### Resumo

Adicionar uma correção automática do jackpot no Dashboard. Quando o usuário carregar o Dashboard, o sistema irá verificar se o jackpot está correto e, caso não esteja, corrigirá automaticamente.

---

### Problema Identificado

- **Valor atual**: R$ 170,00
- **Valor correto**: R$ 410,00
- **Diferença**: R$ 240,00

Baseado no cálculo:
- Jogo 1: 15 buy-ins × R$ 10 = R$ 150
- Jogo 2: 14 buy-ins × R$ 10 = R$ 140
- Jogo 3: 12 buy-ins × R$ 10 = R$ 120
- **Total**: R$ 410,00

---

### Solução

Adicionar um `useEffect` no `Dashboard.tsx` que:

1. Verifica se há uma temporada ativa
2. Chama `recalculateSeasonJackpot` para obter o valor correto
3. Compara com o valor atual em `activeSeason.jackpot`
4. Se diferente, chama `fixSeasonJackpot` para corrigir
5. Mostra um toast informando a correção

---

### Arquivo a Modificar

| Arquivo | Modificação |
|---------|-------------|
| `src/pages/Dashboard.tsx` | Adicionar useEffect para verificar e corrigir jackpot automaticamente |

---

### Implementação

```typescript
// Dashboard.tsx - Novo useEffect

const { activeSeason, isLoading, fixSeasonJackpot, recalculateSeasonJackpot } = usePoker();

useEffect(() => {
  const verifyAndFixJackpot = async () => {
    if (!activeSeason || isLoading) return;
    
    try {
      const correctJackpot = await recalculateSeasonJackpot(activeSeason.id);
      
      // Se o valor está incorreto, corrigir automaticamente
      if (Math.abs(correctJackpot - activeSeason.jackpot) > 0.01) {
        console.log(`Jackpot incorreto detectado: atual=${activeSeason.jackpot}, correto=${correctJackpot}`);
        await fixSeasonJackpot(activeSeason.id);
      }
    } catch (error) {
      console.error("Erro ao verificar jackpot:", error);
    }
  };
  
  verifyAndFixJackpot();
}, [activeSeason?.id, isLoading]);
```

---

### Comportamento Esperado

1. Ao carregar o Dashboard:
   - Sistema calcula o jackpot correto
   - Detecta diferença de R$ 240,00
   - Corrige automaticamente para R$ 410,00
   - Exibe toast: "Jackpot Corrigido - O jackpot foi ajustado de R$ 170,00 para R$ 410,00"

2. Em carregamentos futuros:
   - Sistema verifica, mas como o valor está correto, não faz nada

---

### Proteção Contra Loop

Para evitar que o efeito execute múltiplas vezes:
- Usar uma ref `jackpotFixApplied` que é marcada como `true` após a primeira verificação
- Depender apenas de `activeSeason?.id` e `isLoading` para re-executar

