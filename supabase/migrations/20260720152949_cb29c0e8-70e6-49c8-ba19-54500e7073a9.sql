
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  caption TEXT,
  event_date DATE,
  game_id UUID,
  season_id UUID,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;
GRANT ALL ON public.gallery_photos TO service_role;

CREATE INDEX idx_gallery_photos_org_created ON public.gallery_photos(organization_id, created_at DESC);
CREATE INDEX idx_gallery_photos_org_season ON public.gallery_photos(organization_id, season_id);
CREATE INDEX idx_gallery_photos_org_game ON public.gallery_photos(organization_id, game_id);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view gallery photos of their organization"
ON public.gallery_photos FOR SELECT TO authenticated
USING (public.user_can_access_organization(organization_id));

CREATE POLICY "Admins can insert gallery photos"
ON public.gallery_photos FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND uploaded_by = auth.uid()
);

CREATE POLICY "Admins can update gallery photos"
ON public.gallery_photos FOR UPDATE TO authenticated
USING (public.user_can_admin_organization(organization_id))
WITH CHECK (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins can delete gallery photos"
ON public.gallery_photos FOR DELETE TO authenticated
USING (public.user_can_admin_organization(organization_id));

CREATE TRIGGER update_gallery_photos_updated_at
BEFORE UPDATE ON public.gallery_photos
FOR EACH ROW EXECUTE FUNCTION public.update_organization_viewer_keys_updated_at();
