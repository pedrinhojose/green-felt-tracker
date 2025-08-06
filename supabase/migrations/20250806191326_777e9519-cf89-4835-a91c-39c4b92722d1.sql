-- Create club fund transactions table
CREATE TABLE public.club_fund_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL,
  organization_id UUID,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('add', 'remove', 'membership')),
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_club_fund_transactions_season_id ON public.club_fund_transactions(season_id);
CREATE INDEX idx_club_fund_transactions_organization_id ON public.club_fund_transactions(organization_id);
CREATE INDEX idx_club_fund_transactions_date ON public.club_fund_transactions(date);
CREATE INDEX idx_club_fund_transactions_type ON public.club_fund_transactions(type);

-- Enable Row Level Security
ALTER TABLE public.club_fund_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for club fund transactions
CREATE POLICY "Users can view transactions from their organization" 
ON public.club_fund_transactions 
FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transactions in their organization" 
ON public.club_fund_transactions 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id = auth.uid()
  ) AND auth.uid() = user_id
);

CREATE POLICY "Users can update transactions from their organization" 
ON public.club_fund_transactions 
FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete transactions from their organization" 
ON public.club_fund_transactions 
FOR DELETE 
USING (
  organization_id IN (
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id = auth.uid()
  )
);