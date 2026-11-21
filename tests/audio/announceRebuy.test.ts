import { expect, test } from "bun:test";

test("unlocking must not pause the RE BUY started by the same click", async () => {
  const listeners = new Map<string, () => void>();
  const pending: Array<() => void> = [];
  let pauses = 0;
  let currentAudio: FakeAudio | undefined;
  class FakeAudio {
    preload = "";
    muted = false;
    currentTime = 0;
    volume = 1;
    constructor(_src: string) { currentAudio = this; }
    load() {}
    pause() { pauses += 1; }
    play() { return new Promise<void>(resolve => pending.push(resolve)); }
  }
  const originalWindow = globalThis.window;
  const originalAudio = globalThis.Audio;
  Object.assign(globalThis, {
    window: {
      addEventListener: (name: string, handler: () => void) => listeners.set(name, handler),
      removeEventListener: (name: string) => listeners.delete(name),
    },
    Audio: FakeAudio,
  });
  try {
    const module = await import("../../src/lib/audio/announceRebuy");
    listeners.get("pointerdown")?.();
    module.announceRebuy();
    expect(pending.length).toBe(2);
    pending.forEach(resolve => resolve());
    await Promise.resolve();
    await Promise.resolve();
    expect(pauses).toBe(0);
    expect(currentAudio?.muted).toBe(false);
    module.announceRebuy();
    expect(pending.length).toBe(3);
    pending[2]?.();
    module.setRebuyAnnounceMuted(true);
    expect(module.isRebuyAnnounceMuted()).toBe(true);
    module.setRebuyAnnounceMuted(false);
    expect(module.isRebuyAnnounceMuted()).toBe(false);
  } finally {
    Object.assign(globalThis, { window: originalWindow, Audio: originalAudio });
  }
});