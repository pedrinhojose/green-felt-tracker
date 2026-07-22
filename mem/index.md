# Project Memory

## Core
- Multi-tenant via `organization_id` & RLS. Custom atomic `create_organization_with_admin` for setup.
- Soft-delete players (`is_active: false`) to preserve history. Never hard delete.
- Enforce single active season per org. Activating a season deactivates all others.
- Parse dates as local (`parseLocalDate`) to prevent timezone offset bugs.
- Prefix `crypt()` and `gen_salt()` explicitly with `extensions.` for `pgcrypto`.
- Vite requires `resolve.dedupe: ["react", "react-dom"]` to prevent duplicate React instances.
- vite.config.ts MUST keep `build.rollupOptions.external: ["onnxruntime-web","onnxruntime-web/webgpu"]` — never regenerate from scratch; add browser-only runtime modules (ONNX/WebGPU/WASM/@imgly) there preventively.
- Caixinha totals are org-wide across all seasons — fetch org games directly from Supabase, do NOT use `games` from `PokerContext` (season-filtered).

## Memories
- [Vite external onnxruntime-web](mem://constraints/technical/vite-external-onnx) — Preserve rollupOptions.external to fix Vercel build with @imgly/background-removal
- [Date entry preference](mem://style/ui-patterns/date-entry-preference) — Prefer text input with DD/MM/YYYY mask over calendar picker
- [Season config layout](mem://style/ui-patterns/season-config-layout) — Tabbed interface for finance and eliminations
- [Multi-tenancy structure](mem://architecture/multi-tenancy-structure) — Data isolation via organization_id and Row-Level Security
- [Atomic org creation](mem://architecture/database/atomic-org-creation) — Custom SQL function to bypass RLS during setup
- [pgcrypto extension](mem://architecture/database/extensions-pgcrypto) — Require extensions. prefix for crypt() and gen_salt()
- [Timezone constraints](mem://constraints/technical/date-handling-timezone) — Parse dates as local to prevent timezone offset bugs
- [Single active season](mem://constraints/business-rules/single-active-season) — Enforce one active season per organization
- [Onboarding flow](mem://features/auth/onboarding-flow) — Single form creates user account and organization automatically
- [ApaHub integration](mem://features/integrations/apahub-access-keys) — External read-only access via shared Access Key
- [Season finalization](mem://features/seasons/finalization-logic) — Jackpot distribution and cross-season fund transfer via localStorage
- [Elimination rewards](mem://features/seasons/elimination-rewards) — Configurable point/cash bonuses based on knockout frequency
- [Jackpot auto-correction](mem://features/seasons/jackpot-auto-correction) — Dashboard reconciles season jackpot balance from finished games
- [Birthday reminders](mem://features/players/birthday-reminders) — Dashboard UI for current month birthdays with list
- [Soft delete strategy](mem://features/players/soft-delete-strategy) — Deactivate players instead of hard deleting to preserve historical data
- [Dynamic prize display](mem://features/game-management/dynamic-prize-display) — Prizes reflect weeklyPrizeSchema positions rather than hardcoded top 3
- [Position swapping](mem://features/game-management/position-swapping) — Admin tool to swap finishing positions and recalculate prizes
- [Finalization guardrails](mem://features/game-management/finalization-guardrails) — Block 'End Game' until players eliminated and prizes calculated
- [Excel backup](mem://features/data-management/excel-backup) — Multi-tab .xlsx backup with flattened JSONB and upsert on import
- [Backup strategy](mem://features/data-management/backup-strategy) — Proactive 7-day reminder and manual export flow
- [Global vs Club Admins](mem://architecture/auth/global-admin-permissions) — Role permission differentiation and first-user global logic
- [Vite React Dedupe](mem://architecture/technical/vite-react-dedupe) — Config resolve.dedupe for react to prevent instance errors
