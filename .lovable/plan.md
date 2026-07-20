## Objetivo
Tornar o card "Partidas" do Dashboard mais intuitivo, com visual claro de botões clicáveis em vez de linhas de texto.

## Mudanças em `src/components/QuickGameCard.tsx`

Manter a mesma estrutura de card dividido em dois (temporada / avulsa), mas transformar cada metade em um **botão de ação visualmente evidente**:

1. **CTA principal em cada metade**
   - Botão sólido/destacado com rótulo de ação claro: **"Iniciar partida"** (temporada) e **"Iniciar partida avulsa"** (avulsa).
   - Ícone `Play` dentro do botão, com hover (brilho + leve scale) e estado `active:` (pressionado).
   - Cores: temporada usa verde/poker-gold; avulsa usa azul (mantendo paleta atual).

2. **Hierarquia visual**
   - Ícone circular grande à esquerda (mantido) → passa a ter animação sutil no hover do card.
   - Título curto acima (ex: "Partida da Temporada" / "Partida Avulsa").
   - Subtítulo com contexto (nome da temporada ativa / "Sem vínculo com temporada").
   - Botão CTA embaixo, ocupando largura total da metade.

3. **Área clicável**
   - O card inteiro continua clicável (acessibilidade), mas o botão dentro reforça a ação.
   - Cursor `pointer` e feedback visual em hover no card e no botão.

4. **Estados**
   - Loading: botão mostra spinner + "Criando...".
   - Sem temporada ativa: metade da temporada fica desabilitada com badge "Sem temporada ativa" e botão em estado `disabled` com tooltip explicativo.

5. **Responsivo**
   - Mobile: ícone + textos empilhados, botão largura total.
   - Desktop: layout horizontal como hoje, com botão embaixo do bloco de texto.

## Escopo
- Somente `src/components/QuickGameCard.tsx` (UI/apresentação).
- Nenhuma alteração de lógica, contexto, rotas ou banco.
