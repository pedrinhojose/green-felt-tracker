
CREATE TABLE public.gallery_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_folders TO authenticated;
GRANT ALL ON public.gallery_folders TO service_role;

CREATE INDEX idx_gallery_folders_org ON public.gallery_folders(organization_id, created_at DESC);

ALTER TABLE public.gallery_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view gallery folders of their organization"
ON public.gallery_folders FOR SELECT TO authenticated
USING (public.user_can_access_organization(organization_id));

CREATE POLICY "Admins can insert gallery folders"
ON public.gallery_folders FOR INSERT TO authenticated
WITH CHECK (
  public.user_can_admin_organization(organization_id)
  AND created_by = auth.uid()
);

CREATE POLICY "Admins can update gallery folders"
ON public.gallery_folders FOR UPDATE TO authenticated
USING (public.user_can_admin_organization(organization_id))
WITH CHECK (public.user_can_admin_organization(organization_id));

CREATE POLICY "Admins can delete gallery folders"
ON public.gallery_folders FOR DELETE TO authenticated
USING (public.user_can_admin_organization(organization_id));

CREATE TRIGGER update_gallery_folders_updated_at
BEFORE UPDATE ON public.gallery_folders
FOR EACH ROW EXECUTE FUNCTION public.update_organization_viewer_keys_updated_at();

ALTER TABLE public.gallery_photos
  ADD COLUMN folder_id UUID REFERENCES public.gallery_folders(id) ON DELETE CASCADE;

CREATE INDEX idx_gallery_photos_folder ON public.gallery_photos(folder_id);
