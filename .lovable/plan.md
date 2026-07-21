## Objetivo

Padronizar todas as fotos dos jogadores com **fundo preto sólido + contorno branco em volta da silhueta**, aplicando automaticamente em toda foto nova e permitindo reprocessar o acervo existente em massa. Além disso, comprimir agressivamente para ~50–100 KB.

## Como funciona (pipeline visual)

Para cada foto (câmera ou upload):

1. **Redimensiona** para no máximo 512×512 px (evita processar imagens gigantes de celular).
2. **Remove o fundo** via IA rodando 100% no navegador — usando `@imgly/background-removal` (WebAssembly, sem custo de API, sem enviar foto pra servidor externo).
3. **Compõe a máscara** em canvas:
   - Fundo preto (`#000000`) sólido cobrindo o quadrado inteiro.
   - Silhueta do jogador desenhada por cima.
   - Contorno branco (~3 px) desenhado em volta do alpha da silhueta usando técnica de dilatação (desenhar a silhueta 8 vezes com offsets em branco, e a silhueta original por cima).
4. **Comprime** como JPEG qualidade 0.75 → alvo 50–100 KB. Se ainda ficar acima, reduz qualidade em passos até caber.
5. **Upload** para o bucket `fotos/players` do Supabase Storage.
6. Substitui o `photoUrl` do jogador (a versão original **não** fica salva — resposta "Substitui a original").

## Mudanças

### 1. Dependência
- Instalar `@imgly/background-removal` (roda em WebAssembly no browser, ~30 MB de modelo baixado sob demanda no primeiro uso — cacheado depois).

### 2. Novo utilitário `src/lib/utils/playerPhotoMask.ts`
- `applyPlayerPhotoMask(imageDataUrl: string): Promise<string>` — recebe uma foto qualquer (data URL ou blob URL) e retorna um JPEG comprimido com a máscara aplicada.
- Encapsula: resize → background removal → composição em canvas → contorno branco → compressão iterativa até caber em ≤100 KB.
- Exporta também `MAX_PHOTO_SIZE_KB = 100` para reuso.

### 3. `src/hooks/usePlayerPhotoManager.ts`
- Em `capturePhoto` e `handleFileUpload`, substituir a chamada atual `optimizeImage(imageDataUrl)` por `applyPlayerPhotoMask(imageDataUrl)`.
- Adicionar estado `isMasking` e mensagem no toast ("Aplicando máscara...") — o processamento leva 2–5s na primeira foto (baixa o modelo) e ~1s nas seguintes.
- Mantém a mesma assinatura pública, então nenhum outro componente precisa mudar.

### 4. Botão de reprocessamento em massa — `PlayersManagement.tsx`
- Novo botão **"Padronizar todas as fotos"** no header da página de Jogadores (visível só para admin, ao lado dos filtros).
- Ao clicar: pega todos os jogadores ativos que têm `photoUrl`, processa **um por vez** com barra de progresso ("Processando 3 de 42…"), e faz upload/atualiza `photoUrl` no banco.
- Dialog de confirmação antes de iniciar, avisando que vai reprocessar N fotos e pode levar alguns minutos.
- Botão de cancelar durante o processo (interrompe o loop, mantém as já processadas).

### 5. Feedback visual
- Durante o processamento (upload individual ou lote), mostrar spinner + texto informativo.
- Toast final com contagem: "38 fotos padronizadas, 2 falharam".

## Detalhes técnicos

- **Biblioteca**: `@imgly/background-removal` — a mais estável em produção para browser, roda ONNX Runtime + modelo U²-Net. Sem chaves de API, sem custo. Todo processamento local no dispositivo do admin.
- **Primeira vez que abrir**: baixa ~30 MB do modelo (cacheado pelo browser). Aviso claro no toast na primeira execução.
- **Contorno**: técnica clássica em canvas — desenhar a silhueta em branco 8 vezes com offsets de ±3px (N, NE, E, SE, S, SW, W, NW), depois a silhueta original colorida por cima. Resultado: borda branca uniforme.
- **Tamanho final**: 512×512 JPEG qualidade 0.75 tipicamente fica em 40–70 KB. Loop de compressão reduz qualidade em 0.05 até bater ≤100 KB.
- **Sem alterações de banco**: continua salvando URL do Storage no campo `photoUrl` existente.
- **RLS/Storage**: bucket `fotos` já é público, permissões existentes bastam.

## Fora de escopo

- Detecção de rosto (crop centrado no rosto) — pode ficar como melhoria futura.
- Diferentes estilos de máscara por temporada/tema.
- Processamento server-side (Edge Function) — descartado porque browser-side é grátis e privado.
