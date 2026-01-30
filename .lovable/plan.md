

## Plano: Criar Aba "Financeiro" na Configuracao da Temporada

### Resumo

Reorganizar a tela de configuracao da temporada movendo o card "Parametros Financeiros" e o "JackpotCard" para dentro de uma nova aba chamada "Financeiro", mantendo a consistencia visual e todos os dados existentes intactos.

---

### Estrutura Atual

```text
+----------------------------------+
|    Informacoes Basicas           |
+----------------------------------+
|  Abas (6 colunas):               |
|  [Pontuacao] [Premiacao Semanal] |
|  [Premiacao Final] [Blinds]      |
|  [Cronograma] [Regras]           |
+----------------------------------+
|  (conteudo da aba selecionada)   |
+----------------------------------+
|  Parametros Financeiros (FIXO)   |  <-- Sempre visivel
+----------------------------------+
|  Jackpot Card (FIXO)             |  <-- Sempre visivel
+----------------------------------+
|  [Salvar Configuracoes]          |
+----------------------------------+
```

### Nova Estrutura

```text
+----------------------------------+
|    Informacoes Basicas           |
+----------------------------------+
|  Abas (7 colunas):               |
|  [Pontuacao] [Premiacao Semanal] |
|  [Premiacao Final] [Blinds]      |
|  [Cronograma] [Regras]           |
|  [Financeiro]  <-- NOVA ABA      |
+----------------------------------+
|  (conteudo da aba selecionada)   |
|                                  |
|  Se aba "Financeiro":            |
|    - Parametros Financeiros      |
|    - Jackpot Card                |
+----------------------------------+
|  [Salvar Configuracoes]          |
+----------------------------------+
```

---

### Arquivo a Modificar

| Arquivo | Acao | Descricao |
|---------|------|-----------|
| `src/pages/SeasonConfig.tsx` | Modificar | Adicionar nova aba e mover componentes |

---

### Implementacao

#### Modificacoes em SeasonConfig.tsx

1. **Alterar TabsList**: Mudar de `grid-cols-6` para `grid-cols-7`

2. **Adicionar novo TabsTrigger**: 
   - Valor: `financial`
   - Label: `Financeiro`

3. **Adicionar novo TabsContent**:
   - Mover `FinancialParamsConfig` para dentro desta aba
   - Mover `JackpotCard` para dentro desta aba (com espacamento)

4. **Remover componentes externos**: 
   - Remover `FinancialParamsConfig` de fora das Tabs
   - Remover `JackpotCard` de fora das Tabs

---

### Codigo da Nova Aba

```tsx
<TabsTrigger value="financial">Financeiro</TabsTrigger>

<TabsContent value="financial">
  <div className="space-y-6">
    <FinancialParamsConfig register={register} errors={errors} />
    
    {activeSeason && !isCreating && (
      <JackpotCard activeSeason={activeSeason} />
    )}
  </div>
</TabsContent>
```

---

### O Que NAO Muda

- Logica de formulario (`useSeasonForm`)
- Campos e validacoes
- Funcao de salvar (`onSubmit`)
- Dados no banco de dados
- Estrutura do hook `useSeasonFormInitializer`
- Temporada ativa e seus parametros

---

### Beneficios

1. **Consistencia Visual**: Todos os itens de configuracao ficam dentro de abas
2. **Menos Confusao**: Admin nao vera card fixo ao navegar entre abas
3. **Organizacao Logica**: Parametros financeiros e jackpot agrupados
4. **Layout Limpo**: Apenas o botao "Salvar" permanece fixo no final

