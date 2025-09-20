-- Create INSERT policy for organizations table
CREATE POLICY "Users can create organizations" ON public.organizations
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Drop existing organization_members insert policy that causes circular dependency
DROP POLICY IF EXISTS "organization_members_insert_policy" ON public.organization_members;

-- Create new policy that allows users to insert themselves as admin
CREATE POLICY "Users can insert themselves as admin" ON public.organization_members
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND role = 'admin'
);