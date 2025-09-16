-- Create table for caixinha withdrawals
CREATE TABLE public.caixinha_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  withdrawal_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  organization_id UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.caixinha_withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for caixinha withdrawals
CREATE POLICY "Users can view withdrawals from their organization" 
ON public.caixinha_withdrawals 
FOR SELECT 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
));

CREATE POLICY "Users can create withdrawals in their organization" 
ON public.caixinha_withdrawals 
FOR INSERT 
WITH CHECK ((organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
)) AND (auth.uid() = user_id));

CREATE POLICY "Users can update withdrawals from their organization" 
ON public.caixinha_withdrawals 
FOR UPDATE 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
));

CREATE POLICY "Users can delete withdrawals from their organization" 
ON public.caixinha_withdrawals 
FOR DELETE 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
));

-- Add caixinha_balance field to seasons table
ALTER TABLE public.seasons 
ADD COLUMN caixinha_balance NUMERIC NOT NULL DEFAULT 0;