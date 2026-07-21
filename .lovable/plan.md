# Fix: preview da câmera não aparece

## Diagnóstico confirmado

Em `src/hooks/usePlayerPhotoManager.ts` (linhas 15-39), `startCamera()` faz:

1. Pede permissão via `getUserMedia` (luz da câmera acende ✅)
2. Tenta `if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }`

Mas o elemento `<video>` em `PlayerPhotoManager.tsx` só é montado **quando `isCameraActive === true`** (linha 46: `{isCameraActive && !isProcessing ? <video/> : ...}`). Ou seja, no primeiro clique `videoRef.current` é `null`, o `if` inteiro é ignorado, `isCameraActive` nunca vira `true`, e o stream fica órfão. É exatamente o sintoma relatado: no PC a luz acende sem preview; no mobile nada abre visualmente.

## Correção

Ajustar `usePlayerPhotoManager.ts`:

1. **Guardar o stream** obtido em um `useRef<MediaStream|null>` (`streamRef`).
2. `startCamera()` — assim que o stream volta, salvar em `streamRef.current` e chamar `setIsCameraActive(true)` (sem depender de `videoRef.current`).
3. Adicionar `useEffect` que reage a `isCameraActive`: quando fica `true` e `videoRef.current` existe, atribui `videoRef.current.srcObject = streamRef.current` e chama `videoRef.current.play().catch(...)` (necessário no iOS Safari mesmo com `autoPlay playsInline`).
4. `stopCamera()` passa a parar as tracks do `streamRef.current` e zerá-lo, além de limpar `srcObject`.
5. Ajustar `getUserMedia` para pedir `facingMode: { ideal: "user" }` (evita falhar em dispositivos sem câmera frontal — importante em mobile) e, em caso de erro, expor a mensagem real do browser no toast pra facilitar debug futuro.
6. Cleanup: também parar o stream quando o hook desmontar (ex.: fechar o diálogo com a câmera aberta).

Nenhuma outra tela precisa mudar — `PlayerPhotoManager.tsx`, `AddPlayerDialog.tsx`, `EditPlayerDialog.tsx` e `PlayerSelection.tsx` continuam usando a mesma API (`startCamera`, `stopCamera`, `capturePhoto`, `videoRef`, `isCameraActive`).

## Observação sobre mobile

Em navegadores móveis (especialmente iOS Safari), `getUserMedia` **só funciona em HTTPS**. O preview do Lovable já é HTTPS, então isso não é um problema aqui; apenas vale notar caso o app seja embutido em contexto não-seguro (webview antiga). Se após a correção o mobile ainda falhar, o toast passará a mostrar o motivo exato retornado pelo browser (`NotAllowedError`, `NotFoundError`, etc.), o que dá base pro próximo passo.

## Arquivos alterados

- `src/hooks/usePlayerPhotoManager.ts` (apenas o bloco de câmera; o resto — upload, máscara, compressão — fica intacto)
