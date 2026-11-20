import rebuyAsset from "@/assets/rebuy.mp3.asset.json";

// Toca o áudio de locutor "Re-buy" enviado pelo clube.
let audio: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio() {
  if (!audio) {
    audio = new Audio(rebuyAsset.url);
    audio.preload = "auto";
    audio.load();
  }
  return audio;
}

// Libera o som no primeiro clique/toque/tecla (exigência dos navegadores).
export function unlockRebuyAudio() {
  if (unlocked || typeof window === "undefined") return;
  const a = getAudio();
  a.muted = true;
  a.play()
    .then(() => { a.pause(); a.currentTime = 0; a.muted = false; unlocked = true; })
    .catch(() => { a.muted = false; });
}

if (typeof window !== "undefined") {
  const handler = () => {
    unlockRebuyAudio();
    if (unlocked) {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    }
  };
  window.addEventListener("pointerdown", handler);
  window.addEventListener("keydown", handler);
}

export function announceRebuy() {
  try {
    if (typeof window === "undefined") return;
    const a = getAudio();
    a.muted = false;
    a.currentTime = 0;
    a.volume = 1;
    void a.play().then(() => { unlocked = true; }).catch((e) => console.warn("Som de rebuy bloqueado:", e));
  } catch {
    /* ignore */
  }
}

// Permite silenciar o anúncio no aparelho que está fazendo o rebuy (celular).
let muted = false;
export function setRebuyAnnounceMuted(v: boolean) { muted = v; }
export function isRebuyAnnounceMuted() { return muted; }
