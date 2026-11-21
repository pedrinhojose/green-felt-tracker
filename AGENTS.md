# Architecture rules

- Keep rebuy audio playback isolated from blind timer state; completing audio unlock must never interrupt a newer audible announcement.
- Keep Bun regression tests under tests/ outside the browser TypeScript compilation, so test-only modules do not affect deployment.