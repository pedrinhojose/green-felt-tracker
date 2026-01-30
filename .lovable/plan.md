

## Plano: Corrigir Sobreposicao do Icone no JackpotCard

### Problema Identificado

O icone visual de dinheiro empilhado usa elementos com `position: absolute` dentro de um container `relative`, mas o container nao tem altura definida. Isso causa a sobreposicao com o valor do jackpot.

### Codigo Atual (Problematico)

```tsx
<div className="flex justify-center mb-4">
  <div className="relative">  {/* <-- Sem altura definida */}
    <div className="w-12 h-8 bg-green-500 rounded-sm transform rotate-3 absolute"></div>
    <div className="w-12 h-8 bg-green-600 rounded-sm transform -rotate-2 absolute top-1"></div>
    <div className="w-12 h-8 bg-green-700 rounded-sm absolute top-2"></div>
  </div>
</div>
```

### Solucao

Adicionar altura explicita ao container `relative` para reservar o espaco necessario para os elementos posicionados absolutamente.

### Arquivo a Modificar

| Arquivo | Acao |
|---------|------|
| `src/components/season/JackpotCard.tsx` | Adicionar altura ao container do icone |

### Codigo Corrigido

```tsx
<div className="flex justify-center mb-4">
  <div className="relative h-12 w-12">  {/* Altura e largura definidas */}
    <div className="w-12 h-8 bg-green-500 rounded-sm transform rotate-3 absolute"></div>
    <div className="w-12 h-8 bg-green-600 rounded-sm transform -rotate-2 absolute top-1"></div>
    <div className="w-12 h-8 bg-green-700 rounded-sm absolute top-2"></div>
  </div>
</div>
```

### Impacto

- Correcao puramente visual
- Nenhum dado afetado
- O icone ficara corretamente posicionado acima do valor do jackpot

