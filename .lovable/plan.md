

## Plano: Sistema de Recompensas por Eliminacoes

### Resumo

Criar uma nova aba "Eliminacoes" na pagina de Configuracao da Temporada, onde o admin podera definir recompensas para jogadores que eliminam adversarios. As recompensas podem ser em pontos no ranking ou em dinheiro (adicional ao premio).

---

### Localizacao

A nova configuracao sera acessivel em:
**Configuracoes da Temporada > Aba "Eliminacoes"** (8a aba, apos "Financeiro")

```text
Tabs atuais:
[Pontuacao] [Premiacao Semanal] [Premiacao Final] [Estrutura de Blinds] [Cronograma Jantares] [Regras da Casa] [Financeiro]

Tabs apos implementacao:
[Pontuacao] [Premiacao Semanal] [Premiacao Final] [Eliminacoes] [Blinds] [Jantares] [Regras] [Financeiro]
```

---

### Interface de Configuracao

```text
+------------------------------------------------------------------+
| Recompensas por Eliminacao                                       |
|------------------------------------------------------------------|
|                                                                  |
| [X] Ativar recompensas por eliminacao                            |
|                                                                  |
| Tipo de Recompensa:                                              |
|   (o) Pontos no Ranking    ( ) Valor em Dinheiro                 |
|                                                                  |
| Valor da Recompensa:                                             |
|   [    2    ]  pontos                                            |
|                                                                  |
| Frequencia (a cada quantas eliminacoes):                         |
|   [    1    ]  eliminacao(oes)                                   |
|                                                                  |
| Limite maximo de recompensas por partida:                        |
|   [    0    ]  (0 = sem limite)                                  |
|                                                                  |
| +------------------------------------------------------+         |
| | Exemplo:                                             |         |
| | - Frequencia: 2 eliminacoes                          |         |
| | - Valor: 2 pontos                                    |         |
| | - Jogador eliminou 5 adversarios                     |         |
| | - Recompensas: 2 (na 2a e 4a eliminacao)             |         |
| | - Bonus total: 4 pontos                              |         |
| +------------------------------------------------------+         |
+------------------------------------------------------------------+
```

---

### Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `src/components/season/EliminationRewardConfig.tsx` | Componente de configuracao de recompensas por eliminacao |
| `src/hooks/useEliminationRewards.ts` | Hook para calcular recompensas baseado nas eliminacoes |

---

### Arquivos a Modificar

| Arquivo | Modificacao |
|---------|-------------|
| `src/lib/db/models.ts` | Adicionar interface `EliminationRewardConfig` e campo na interface `Season` |
| `src/types/season.ts` | Adicionar tipos do formulario |
| `src/hooks/useSeasonForm.ts` | Adicionar estado para `eliminationRewardConfig` |
| `src/hooks/season/useSeasonFormInitializer.ts` | Carregar configuracao existente ou usar default |
| `src/hooks/season/useSeasonFormSubmitter.ts` | Incluir configuracao no objeto de salvamento |
| `src/pages/SeasonConfig.tsx` | Adicionar nova aba "Eliminacoes" com o componente |
| `src/hooks/usePrizeDistribution.ts` | Aplicar bonus de eliminacao ao calcular pontos/premios |

---

### Detalhes Tecnicos

#### 1. Nova Interface (models.ts)

```typescript
export interface EliminationRewardConfig {
  enabled: boolean;
  rewardType: 'points' | 'money';
  rewardValue: number;
  frequency: number;         // A cada X eliminacoes
  maxRewardsPerGame: number; // 0 = sem limite
}

export interface Season {
  // ... campos existentes
  eliminationRewardConfig?: EliminationRewardConfig;
}
```

#### 2. Componente de Configuracao

O componente `EliminationRewardConfig.tsx` tera:
- Switch para ativar/desativar
- RadioGroup para escolher tipo (pontos/dinheiro)
- Input numerico para valor
- Input numerico para frequencia (minimo 1)
- Input numerico para limite maximo
- Card de exemplo dinamico mostrando calculo

#### 3. Calculo de Recompensas

```typescript
function calculateEliminationRewards(
  playerEliminations: number,
  config: EliminationRewardConfig
): { rewards: number; value: number } {
  if (!config.enabled || playerEliminations === 0) {
    return { rewards: 0, value: 0 };
  }
  
  // Quantas recompensas o jogador ganhou
  let rewards = Math.floor(playerEliminations / config.frequency);
  
  // Aplicar limite se configurado
  if (config.maxRewardsPerGame > 0) {
    rewards = Math.min(rewards, config.maxRewardsPerGame);
  }
  
  return {
    rewards,
    value: rewards * config.rewardValue
  };
}
```

#### 4. Integracao com Distribuicao de Premios

No `usePrizeDistribution.ts`, apos calcular pontos e premios baseados na posicao:

1. Buscar eliminacoes do jogo atual via `useEliminationData`
2. Contar eliminacoes por jogador (soma de `eliminator_player_id`)
3. Para cada jogador, calcular bonus:
   - Se `rewardType === 'points'`: adicionar ao `player.points`
   - Se `rewardType === 'money'`: adicionar ao `player.prize`
4. Recalcular saldo final

---

### Fluxo de Dados

```text
1. Admin acessa Configuracoes > Aba "Eliminacoes"
          |
          v
2. Define: tipo=pontos, valor=2, frequencia=2, limite=3
          |
          v
3. Salva configuracao no campo `eliminationRewardConfig` da Season
          |
          v
4. Durante partida, eliminacoes sao registradas normalmente
          |
          v
5. Ao encerrar partida e distribuir premios:
   - Sistema conta eliminacoes de cada jogador
   - Aplica formula: floor(eliminacoes / frequencia) * valor
   - Respeita limite maximo
   - Adiciona bonus aos pontos ou premio
```

---

### Exemplo Pratico

**Configuracao:**
- Tipo: Pontos
- Valor: 2 pontos
- Frequencia: 2 eliminacoes
- Limite: 3 recompensas

**Resultado em uma partida:**

| Jogador | Eliminacoes | Recompensas | Bonus |
|---------|-------------|-------------|-------|
| Pedro   | 7           | 3 (maximo)  | +6 pts |
| Ana     | 4           | 2           | +4 pts |
| Carlos  | 1           | 0           | +0 pts |
| Maria   | 2           | 1           | +2 pts |

---

### Valores Padrao (Season Nova)

```typescript
const defaultEliminationRewardConfig: EliminationRewardConfig = {
  enabled: false,
  rewardType: 'points',
  rewardValue: 1,
  frequency: 1,
  maxRewardsPerGame: 0
};
```

---

### Validacoes

1. Frequencia deve ser >= 1
2. Valor deve ser >= 0
3. Limite maximo deve ser >= 0
4. Se habilitado e valor = 0, mostrar aviso

---

### Responsividade

A nova aba seguira o mesmo padrao das outras abas. Em dispositivos moveis, os labels das abas serao abreviados:
- "Eliminacoes" → "Elim."

