/**
 * Aplica máscara padrão em foto de jogador:
 * - Remove fundo original (IA no browser via @imgly/background-removal)
 * - Compõe fundo preto sólido + contorno branco em volta da silhueta
 * - Comprime até ~100 KB
 */

// Carregado dinamicamente via CDN em runtime — ver loadRemoveBackground() abaixo.
// Motivo: em produção o Vite externaliza onnxruntime-web (para o build do Vercel
// não quebrar), então o bundle local do @imgly falha ao resolver essas deps.
// Importando da esm.sh o navegador resolve tudo por conta própria.
type RemoveBackgroundFn = (
  input: Blob | string,
  options?: { output?: { format?: string; quality?: number } }
) => Promise<Blob>;

let removeBackgroundPromise: Promise<RemoveBackgroundFn> | null = null;

function loadRemoveBackground(): Promise<RemoveBackgroundFn> {
  if (!removeBackgroundPromise) {
    const cdnUrl = "https://esm.sh/@imgly/background-removal@1.7.0";
    removeBackgroundPromise = import(/* @vite-ignore */ cdnUrl).then(
      (mod: any) => mod.removeBackground as RemoveBackgroundFn
    );
  }
  return removeBackgroundPromise;
}

export const MAX_PHOTO_SIZE_KB = 100;
const OUTPUT_SIZE = 512;
const OUTLINE_PX = 3;

/**
 * Carrega uma imagem (data URL, blob URL ou URL) como HTMLImageElement.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Falha ao carregar imagem"));
    img.src = src;
  });
}

/**
 * Redimensiona uma imagem para caber num quadrado OUTPUT_SIZE, centralizada,
 * preservando aspect ratio (letterbox transparente).
 */
async function normalizeToSquare(dataUrl: string): Promise<Blob> {
  const img = await loadImage(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sem contexto 2D");

  // Escala para cobrir o quadrado (crop centrado)
  const scale = Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (OUTPUT_SIZE - drawW) / 2;
  const dy = (OUTPUT_SIZE - drawH) / 2;

  ctx.drawImage(img, dx, dy, drawW, drawH);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar blob"))),
      "image/jpeg",
      0.92
    );
  });
}

/**
 * Compõe: fundo preto → contorno branco (dilatação) → silhueta.
 */
function composeMasked(silhouette: HTMLImageElement): HTMLCanvasElement {
  const size = OUTPUT_SIZE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // 1. Fundo preto
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  // 2. Contorno branco: desenha a silhueta N vezes com offsets ao redor,
  // usando um canvas offscreen todo branco recortado pelo alpha da silhueta.
  const outlineCanvas = document.createElement("canvas");
  outlineCanvas.width = size;
  outlineCanvas.height = size;
  const outlineCtx = outlineCanvas.getContext("2d")!;
  outlineCtx.drawImage(silhouette, 0, 0, size, size);
  outlineCtx.globalCompositeOperation = "source-in";
  outlineCtx.fillStyle = "#ffffff";
  outlineCtx.fillRect(0, 0, size, size);
  // agora outlineCanvas tem uma silhueta 100% branca com alpha da original

  const offsets: Array<[number, number]> = [];
  const r = OUTLINE_PX;
  // 16 direções para borda mais suave
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    offsets.push([Math.round(Math.cos(angle) * r), Math.round(Math.sin(angle) * r)]);
  }
  for (const [ox, oy] of offsets) {
    ctx.drawImage(outlineCanvas, ox, oy);
  }

  // 3. Silhueta original por cima
  ctx.drawImage(silhouette, 0, 0, size, size);

  return canvas;
}

/**
 * Comprime iterativamente até bater ≤ MAX_PHOTO_SIZE_KB.
 */
function compressCanvas(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise(async (resolve, reject) => {
    let quality = 0.85;
    for (let attempt = 0; attempt < 8; attempt++) {
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const sizeKB = Math.round((dataUrl.length * 0.75) / 1024); // base64 overhead
      if (sizeKB <= MAX_PHOTO_SIZE_KB || quality <= 0.4) {
        console.log(`🎯 Foto final: ${sizeKB} KB @ quality ${quality.toFixed(2)}`);
        resolve(dataUrl);
        return;
      }
      quality -= 0.08;
    }
    // fallback
    resolve(canvas.toDataURL("image/jpeg", 0.4));
  });
}

/**
 * Fallback: apenas normaliza + comprime, sem remoção de fundo.
 * Usado quando o pipeline de IA falha (ex.: Safari iOS sem suporte a WebGPU/WASM).
 */
async function compressWithoutMask(imageDataUrl: string): Promise<string> {
  const img = await loadImage(imageDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Sem contexto 2D");

  const scale = Math.max(OUTPUT_SIZE / img.width, OUTPUT_SIZE / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const dx = (OUTPUT_SIZE - drawW) / 2;
  const dy = (OUTPUT_SIZE - drawH) / 2;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  ctx.drawImage(img, dx, dy, drawW, drawH);

  return compressCanvas(canvas);
}

/**
 * Pipeline principal — recebe imagem qualquer, retorna JPEG data URL padronizado.
 * Se a remoção de fundo falhar (ex.: iOS Safari sem WebGPU/WASM), usa fallback
 * apenas com normalização + compressão para não bloquear o cadastro.
 */
export async function applyPlayerPhotoMask(imageDataUrl: string): Promise<string> {
  console.log("🎨 Aplicando máscara padrão na foto...");

  try {
    // 1. Normaliza para 512×512 (reduz o custo do background removal)
    const normalizedBlob = await normalizeToSquare(imageDataUrl);

    // 2. Remove fundo (roda no browser, ~1-3s após primeiro carregamento do modelo)
    console.log("🖼️ Removendo fundo...");
    const cutoutBlob = await removeBackground(normalizedBlob, {
      output: { format: "image/png", quality: 0.9 },
    });

    // 3. Carrega a silhueta e compõe
    const cutoutUrl = URL.createObjectURL(cutoutBlob);
    try {
      const silhouette = await loadImage(cutoutUrl);
      const composed = composeMasked(silhouette);
      const finalDataUrl = await compressCanvas(composed);
      console.log("✅ Máscara aplicada com sucesso");
      return finalDataUrl;
    } finally {
      URL.revokeObjectURL(cutoutUrl);
    }
  } catch (err) {
    console.warn("⚠️ Remoção de fundo falhou, usando fallback sem máscara:", err);
    const fallback = await compressWithoutMask(imageDataUrl);
    console.log("✅ Foto salva sem máscara (fallback)");
    return fallback;
  }
}
