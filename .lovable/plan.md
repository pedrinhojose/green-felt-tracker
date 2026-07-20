## Melhorar navegação de fotos no mobile (lightbox)

Hoje no mobile o `PhotoLightbox` só mostra setas pequenas nos cantos — não fica óbvio que dá pra arrastar. Vamos deixar a navegação por swipe real e visualmente clara.

### Mudanças no `src/components/gallery/PhotoLightbox.tsx`

1. **Swipe real com o dedo**
   - Adicionar handlers `onTouchStart` / `onTouchMove` / `onTouchEnd` na área da imagem.
   - Threshold de ~50px pra trocar de foto; abaixo disso, volta pra posição.
   - Durante o arrasto, aplicar `translateX` na imagem pra dar feedback tátil imediato (a foto "segue o dedo").
   - Animação suave de saída/entrada ao trocar (`transition-transform`).

2. **Dicas visuais de que dá pra arrastar**
   - Contador "3 / 27" no topo da imagem (mostra que existem mais fotos).
   - Pontinhos/paginação discreta embaixo (máx. ~7 pontinhos com o atual destacado) — só no mobile.
   - Na primeira vez que o lightbox abre na sessão, mostrar um hint animado "← arraste →" que some após 1,5s (guardado em `sessionStorage` pra não repetir).
   - Setas laterais: manter no desktop, esconder no mobile (o swipe substitui).

3. **Ajustes de UX**
   - `touch-action: pan-y` na imagem pra o gesto horizontal não conflitar com scroll da página.
   - Impedir o swipe quando estiver na primeira/última foto (efeito "resistência": arrasta menos).

### Fora do escopo
- Não muda o grid da galeria, upload, edição ou backend.
- Não adiciona zoom/pinch (posso propor separado se quiser).
