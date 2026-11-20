// Locutor "Reee-buy!" (~1s) usando a voz do navegador. Falha silenciosa se indisponível.
export function announceRebuy() {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance("Reee-buy!");
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find(v => /en[-_]US/i.test(v.lang) && /male|david|daniel|google us/i.test(v.name))
      || voices.find(v => /^en/i.test(v.lang));
    if (en) u.voice = en;
    u.lang = en?.lang || "en-US";
    u.rate = 0.75;
    u.pitch = 0.5;
    u.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}
