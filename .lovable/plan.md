
## Plano: Preservar Nomes de Jogadores no Historico (Soft Delete)

### Analise do Problema

Atualmente, quando um jogador e deletado:
- O registro e **removido fisicamente** da tabela `players`
- Os jogos historicos perdem a referencia ao nome (mostram "Desconhecido")
- Rankings da temporada ativa sao deletados, mas historicos preservados (ja esta correto)

### Solucao Recomendada: Soft Delete

Em vez de deletar fisicamente, **desativar** o jogador. Isso:
- Preserva todos os dados historicos
- Mantem compatibilidade com a API ApaHub (leitura continua funcionando)
- Nao altera o funcionamento existente - apenas esconde jogadores inativos das selecoes

### Mudancas Necessarias

#### 1. Adicionar coluna `is_active` na tabela `players`

```sql
ALTER TABLE players ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
```

#### 2. Modificar a exibicao de jogadores

| Local | Comportamento |
|-------|---------------|
| Lista de jogadores para adicionar em partidas | Mostrar apenas `is_active = true` |
| Historico de partidas | Mostrar todos (nome preservado) |
| Ranking | Mostrar todos |
| Relatorios | Mostrar todos |

#### 3. Alterar acao de "Excluir" para "Desativar"

O botao "Excluir" passara a fazer um `UPDATE` em vez de `DELETE`:

```typescript
// Antes (delete fisico)
await supabase.from('players').delete().eq('id', playerId);

// Depois (soft delete)
await supabase.from('players').update({ is_active: false }).eq('id', playerId);
```

#### 4. Adicionar opcao para reativar jogador (opcional)

Permitir que admins reativem jogadores desativados, caso necessario.

---

### Arquivos que Serao Modificados

| Arquivo | Mudanca |
|---------|---------|
| `supabase/migrations/[novo]` | Adicionar coluna `is_active` |
| `src/lib/db/models.ts` | Adicionar campo `isActive` ao modelo Player |
| `src/lib/db/repositories/PlayerRepository.ts` | Filtrar por `is_active` e mudar delete para update |
| `src/contexts/usePlayerFunctions.ts` | Mudar `deletePlayer` para soft delete |
| `src/components/players/PlayerCard.tsx` | Mudar texto "Excluir" para "Desativar" |
| `src/components/game/PlayerSelection.tsx` | Filtrar jogadores ativos na selecao |

---

### Impacto na API ApaHub

**Nenhum impacto negativo:**
- A API ApaHub le dados via queries SQL diretas
- Os jogadores continuam existindo na tabela `players`
- Os jogos mantem a referencia `playerId` intacta
- A query de jogadores pode opcionalmente incluir inativos ou filtrar

---

### Fluxo do Soft Delete

```text
Usuario clica "Desativar"
         |
         v
+-------------------+
| UPDATE players    |
| SET is_active =   |
| false             |
| WHERE id = ?      |
+-------------------+
         |
         v
Jogador some da lista de selecao
         |
         v
Historico preservado (nome visivel)
```

---

### Interface do Usuario

**Card do Jogador (antes):**
- Menu: Editar | Excluir

**Card do Jogador (depois):**
- Menu: Editar | Desativar
- Confirmacao: "Deseja desativar {nome}? O jogador nao aparecera mais nas selecoes de novas partidas, mas seu historico sera preservado."

**Lista de Jogadores:**
- Opcao para mostrar/ocultar jogadores inativos
- Jogadores inativos aparecem com estilo diferente (opacidade reduzida)
- Botao "Reativar" disponivel para jogadores inativos

---

### Codigo da Migration

```sql
-- Adicionar coluna is_active com valor padrao true
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Atualizar todos jogadores existentes para ativos
UPDATE public.players SET is_active = true WHERE is_active IS NULL;

-- Criar indice para performance nas queries
CREATE INDEX IF NOT EXISTS idx_players_is_active 
ON public.players(is_active) 
WHERE is_active = true;
```

---

### Resultado Final

| Cenario | Antes | Depois |
|---------|-------|--------|
| Jogador deletado aparece na selecao | Nao aparece (deletado) | Nao aparece (is_active=false) |
| Jogador deletado aparece no historico | "Desconhecido" | Nome real preservado |
| Jogador deletado aparece no ranking | Depende | Nome preservado |
| API ApaHub le dados do jogador | Erro (nao existe) | Funciona normalmente |
| Pode restaurar jogador | Nao | Sim (reativar) |
