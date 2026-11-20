import rebuyAsset from "@/assets/rebuy.mp3.asset.json";

// Toca o áudio de locutor "Re-buy" enviado pelo clube. Falha silenciosa se o navegador bloquear.
let audio: HTMLAudioElement | null = null;

export function announceRebuy() {
  try {
    if (typeof window === "undefined") return;
    if (!audio) {
      audio = new Audio(rebuyAsset.url);
      audio.preload = "auto";
    }
    audio.currentTime = 0;
    audio.volume = 1;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
