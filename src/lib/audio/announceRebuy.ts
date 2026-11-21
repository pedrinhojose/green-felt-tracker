// Áudio servido de public/ para funcionar em qualquer hospedagem (Lovable e Vercel).
const REBUY_AUDIO_URL = "/rebuy.mp3";

// Toca o áudio de locutor "Re-buy" enviado pelo clube.
let audio: HTMLAudioElement | null = null;
let unlocked = false;
let unlocking = false;
let playbackVersion = 0;

function getAudio() {
  if (!audio) {
    audio = new Audio(REBUY_AUDIO_URL);
    audio.preload = "auto";
    audio.load();
  }
  return audio;
}

// Libera o som no primeiro clique/toque/tecla (exigência dos navegadores).
export function unlockRebuyAudio() {
  if (unlocked || unlocking || typeof window === "undefined") return;
  const a = getAudio();
  unlocking = true;
  const version = playbackVersion;
  a.muted = true;
  a.play()
    .then(() => {
      // A click on “Testar som” may start audible playback before this resolves.
      // Never pause that newer announcement while completing the silent unlock.
      if (version === playbackVersion) {
        a.pause();
        a.currentTime = 0;
        a.muted = false;
      }
      unlocked = true;
    })
    .catch(() => { if (version === playbackVersion) a.muted = false; })
    .finally(() => { unlocking = false; });
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
    playbackVersion += 1;
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
