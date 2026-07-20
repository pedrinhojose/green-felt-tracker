/**
 * Compressão agressiva estilo WhatsApp para galeria.
 * Retorna duas versões: full (~80-150KB) e thumbnail (~20-40KB).
 */

const TARGET_FULL_BYTES = 120 * 1024; // 120KB alvo
const MAX_FULL_BYTES = 180 * 1024; // 180KB teto
const MIN_QUALITY = 0.4;

const loadImage = (file: File | Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });

const drawResized = (
  img: HTMLImageElement,
  maxDim: number
): HTMLCanvasElement => {
  let { width, height } = img;
  const largest = Math.max(width, height);
  if (largest > maxDim) {
    const ratio = maxDim / largest;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context indisponível');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob falhou'))),
      'image/jpeg',
      quality
    );
  });

/**
 * Compressão iterativa: começa em 0.75 e reduz até atingir o alvo.
 */
async function compressToTarget(
  canvas: HTMLCanvasElement,
  targetBytes: number,
  maxBytes: number,
  startQuality = 0.75
): Promise<Blob> {
  let quality = startQuality;
  let blob = await canvasToBlob(canvas, quality);

  while (blob.size > maxBytes && quality > MIN_QUALITY) {
    quality = Math.max(MIN_QUALITY, quality - 0.05);
    blob = await canvasToBlob(canvas, quality);
    if (blob.size <= targetBytes) break;
  }
  return blob;
}

export interface CompressedGalleryPhoto {
  full: Blob;
  thumbnail: Blob;
  originalSize: number;
  fullSize: number;
  thumbSize: number;
}

export async function compressForGallery(file: File): Promise<CompressedGalleryPhoto> {
  const originalSize = file.size;
  const img = await loadImage(file);

  const fullCanvas = drawResized(img, 1920);
  const full = await compressToTarget(fullCanvas, TARGET_FULL_BYTES, MAX_FULL_BYTES, 0.75);

  const thumbCanvas = drawResized(img, 400);
  const thumbnail = await canvasToBlob(thumbCanvas, 0.7);

  console.log(
    `📦 Comprimido: ${Math.round(originalSize / 1024)}KB → full ${Math.round(
      full.size / 1024
    )}KB / thumb ${Math.round(thumbnail.size / 1024)}KB`
  );

  return {
    full,
    thumbnail,
    originalSize,
    fullSize: full.size,
    thumbSize: thumbnail.size,
  };
}
