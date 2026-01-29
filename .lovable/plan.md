
## Plano: Corrigir Exibicao dos Nomes dos Jogadores na Caixinha

### Problema Identificado

O dialogo de detalhes das contribuicoes mostra "Jogador" ao inves dos nomes reais porque:

1. O campo `players` nos jogos (JSONB) **NAO armazena** o nome do jogador - apenas o `playerId`
2. O codigo tenta usar `p.playerName` que nao existe no objeto
3. O fallback `|| 'Jogador'` e sempre usado, resultando em "Jogador" para todos

### Estrutura Atual dos Dados

```text
+------------------+          +------------------+
|     games        |          |     players      |
+------------------+          +------------------+
| id               |          | id               |
| players (JSONB)  |--------->| name             |
|   - playerId     |          | photo_url        |
|   - points       |          | ...              |
|   - rebuys       |          +------------------+
|   (sem playerName)|
+------------------+
```

### Solucao

Modificar o hook `useCaixinhaUnifiedTransactions.ts` para:

1. **Buscar a lista de jogadores** da tabela `players` junto com os jogos
2. **Mapear os nomes** usando o `playerId` como chave de lookup
3. Exibir o nome correto de cada jogador nas contribuicoes

### Arquivo a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/hooks/useCaixinhaUnifiedTransactions.ts` | Adicionar query para buscar jogadores e mapear nomes |

### Codigo da Solucao

A funcao `loadTransactions` sera modificada:

```typescript
const loadTransactions = async () => {
  // ... codigo existente ...

  // NOVO: Buscar jogadores para obter os nomes
  const { data: playersData } = await supabase
    .from('players')
    .select('id, name')
    .eq('organization_id', currentOrganization.id);

  // Criar mapa de ID -> Nome
  const playerNamesMap = new Map(
    (playersData || []).map(p => [p.id, p.name])
  );

  // Ao processar contribuicoes, usar o mapa:
  const contributingPlayers = players
    .filter(p => p.participatesInClubFund && p.clubFundContribution > 0)
    .map(p => ({
      id: p.playerId,
      name: playerNamesMap.get(p.playerId) || 'Jogador desconhecido',
      contribution: p.clubFundContribution || 0
    }));
};
```

### Resultado Esperado

Antes:
```text
| Jogador  | R$ 10,00 |
| Jogador  | R$ 10,00 |
| Jogador  | R$ 10,00 |
```

Depois:
```text
| Bruno    | R$ 10,00 |
| Maria    | R$ 10,00 |
| Carlos   | R$ 10,00 |
```

### Detalhes Tecnicos

- Uma query adicional a tabela `players` (baixo custo, ja que filtra por organization_id)
- Usa `Map` para lookup O(1) dos nomes por ID
- Fallback "Jogador desconhecido" para jogadores que foram deletados
- Nenhuma mudanca no schema do banco de dados necessaria
