---
name: Vite external onnxruntime-web
description: Never remove build.rollupOptions.external for onnxruntime-web in vite.config.ts; add browser-only runtime modules there
type: constraint
---
vite.config.ts MUST keep:
```
build: { rollupOptions: { external: ["onnxruntime-web", "onnxruntime-web/webgpu"] } }
```
**Why:** @imgly/background-removal dynamically imports onnxruntime-web (WebGPU/WASM) at runtime. Rollup fails to resolve them at build time, breaking Vercel deploys.

**How to apply:**
- Never regenerate vite.config.ts from scratch; merge edits preserving `external`.
- If a new package uses ONNX/WebGPU/WASM/browser-only IA (@imgly/*, transformers.js, mediapipe, onnxruntime-web), add its runtime modules to `external` preventively.
- If build fails with `Rollup failed to resolve import "X"` for a browser-runtime module, add "X" to `external`.
