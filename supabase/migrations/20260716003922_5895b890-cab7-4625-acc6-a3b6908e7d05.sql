
DROP POLICY IF EXISTS "Block viewer account role changes" ON public.user_roles;

CREATE POLICY "Block viewer account role inserts"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (NOT public.is_current_user_viewer_account());

CREATE POLICY "Block viewer account role updates"
  ON public.user_roles AS RESTRICTIVE
  FOR UPDATE TO authenticated
  USING (NOT public.is_current_user_viewer_account())
  WITH CHECK (NOT public.is_current_user_viewer_account());

CREATE POLICY "Block viewer account role deletes"
  ON public.user_roles AS RESTRICTIVE
  FOR DELETE TO authenticated
  USING (NOT public.is_current_user_viewer_account());
