
# Galeria de Fotos do Clube

Feed único cronológico com fotos comprimidas (~80-120KB), upload restrito a admins do clube, isolamento multi-tenant e leitura via ApaHub.

## 1. Banco de dados (migração)

Nova tabela `public.gallery_photos`:

- `organization_id` (uuid, obrigatório) — isolamento por clube
- `uploaded_by` (uuid) — quem enviou
- `photo_url` (text) — URL versão full (~150-300KB)
- `thumbnail_url` (text) — URL thumbnail (~20-40KB)
- `caption` (text, opcional) — legenda
- `event_date` (date, opcional) — data do evento (separada de created_at)
- `game_id` (uuid, opcional) — vínculo com partida
- `season_id` (uuid, opcional) — vínculo com temporada
- `file_size` (integer) — tamanho em bytes
- `created_at` / `updated_at`

**Políticas RLS:**
- SELECT: membros da organização (inclui viewer)
- INSERT/UPDATE/DELETE: apenas admins da organização (`user_can_admin_organization`)
- ApaHub: usa a lógica existente de `apahub_access_keys` para leitura externa

**GRANTs:** `authenticated` (todos) e `service_role` (all).

**Storage:** reaproveita bucket `fotos` com pasta `gallery/{organization_id}/{uuid}.jpg` e `gallery/{organization_id}/thumbs/{uuid}.jpg`.

## 2. Compressão inteligente (frontend)

Estender `src/lib/utils/imageUtils.ts` sem quebrar uso atual (fotos de jogadores continuam funcionando igual):

Nova função `compressForGallery(file)` que retorna `{ full: Blob, thumbnail: Blob }`:

- **Full:** redimensiona para máx 1920px (lado maior), JPEG qualidade inicial 0.75, **compressão iterativa** — reduz qualidade em passos de 0.05 até ficar ≤ 150KB (limite ~120KB alvo, 150KB teto de segurança)
- **Thumbnail:** máx 400px lado maior, JPEG qualidade 0.7 → ~20-40KB
- Usa `canvas.toBlob()` (mais eficiente que `toDataURL`)
- Converte qualquer formato de entrada (PNG, HEIC decodificável, WebP) para JPEG na saída
- Preserva orientação EXIF ao rotacionar via canvas

## 3. Componentes novos

- `src/pages/GalleryPage.tsx` — rota `/gallery`
- `src/components/gallery/GalleryGrid.tsx` — grid responsivo carregando thumbnails com `loading="lazy"`
- `src/components/gallery/PhotoUploadDialog.tsx` — upload múltiplo com drag & drop + botão câmera (mobile), mostra progresso de compressão de cada foto
- `src/components/gallery/PhotoLightbox.tsx` — visualização em tela cheia, navegação com setas, mostra legenda/data/vínculos, botão de download
- `src/components/gallery/PhotoEditDialog.tsx` — edita legenda, data do evento, vínculos com partida/temporada (só admin)
- `src/hooks/useGalleryPhotos.ts` — CRUD + upload + paginação (scroll infinito a cada 30 fotos)

## 4. Integração no app

- Adicionar link **"Galeria"** em `src/components/PokerNav.tsx` (visível para todos, incluindo viewers)
- Card opcional no Dashboard mostrando últimas 4 fotos (thumbnail) com link "Ver galeria"
- Rota adicionada em `src/App.tsx` protegida por `RequireAuth`
- Viewer vê e navega, mas não vê botão de upload/editar/deletar (via `useOrgMemberRole().canEdit`)

## 5. Filtros e busca

Na página da galeria:
- Filtro por temporada (dropdown reusando lista já carregada)
- Filtro por partida (dropdown filtrado pela temporada selecionada)
- Filtro por intervalo de data (event_date)
- Busca por texto na legenda

## 6. ApaHub (leitura externa)

Adicionar RLS policy adicional em `gallery_photos` que permita SELECT quando a requisição vem via chave ApaHub válida (mesmo padrão já usado em outras tabelas via `apahub_access_keys`). Se ainda não há padrão consolidado para isso, a integração ApaHub fica preparada mas ativada em iteração futura — nesta implementação garantimos que o schema e URLs públicas do storage já são compatíveis.

## 7. Performance e detalhes técnicos

- Bucket `fotos` já é público → URLs diretas via CDN Supabase (sem edge function no meio)
- Grid usa thumbnails (economia de banda de ~10x)
- Lightbox carrega full apenas ao abrir
- Paginação por `created_at DESC` com `range()` de 30 em 30
- Upload em lote processa fotos em paralelo (Promise.all limitado a 3 simultâneas para não travar o browser)
- Toast de progresso: "Comprimindo X/Y..." → "Enviando X/Y..."

## Detalhes técnicos adicionais

- Migração inclui índices em `(organization_id, created_at DESC)`, `(organization_id, season_id)`, `(organization_id, game_id)` para queries rápidas
- Trigger `update_updated_at_column` reusado para `updated_at`
- Delete cascata: ao deletar foto, hook chama `supabase.storage.remove()` para full + thumb antes de deletar registro
- `PhotoUploadDialog` limita a 20 fotos por lote para evitar travamentos
- Nenhuma alteração em `src/lib/utils/storageUtils.ts` — cria helper novo `uploadGalleryPhoto()` que suporta upload de Blob (não só dataURL) e path customizado
- Uso de `sonner` para toasts (padrão do projeto)

## O que NÃO muda

- Fotos de jogadores continuam usando `optimizeImage()` atual e pasta `fotos/players`
- Nenhuma tabela existente é alterada
- Nenhum comportamento existente de admins/viewers muda
