-- Add type column to caixinha_withdrawals table and rename it to caixinha_transactions
ALTER TABLE public.caixinha_withdrawals ADD COLUMN type text NOT NULL DEFAULT 'withdrawal';

-- Update existing records to have 'withdrawal' type
UPDATE public.caixinha_withdrawals SET type = 'withdrawal';

-- Rename the table to caixinha_transactions
ALTER TABLE public.caixinha_withdrawals RENAME TO caixinha_transactions;

-- Add constraint to ensure type is either 'deposit' or 'withdrawal'
ALTER TABLE public.caixinha_transactions ADD CONSTRAINT check_transaction_type 
CHECK (type IN ('deposit', 'withdrawal'));

-- Update RLS policies for the renamed table
DROP POLICY IF EXISTS "Users can view withdrawals from their organization" ON public.caixinha_transactions;
DROP POLICY IF EXISTS "Users can create withdrawals in their organization" ON public.caixinha_transactions;
DROP POLICY IF EXISTS "Users can update withdrawals from their organization" ON public.caixinha_transactions;
DROP POLICY IF EXISTS "Users can delete withdrawals from their organization" ON public.caixinha_transactions;

-- Create new RLS policies for caixinha_transactions
CREATE POLICY "Users can view transactions from their organization" 
ON public.caixinha_transactions 
FOR SELECT 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE organization_members.user_id = auth.uid()
));

CREATE POLICY "Users can create transactions in their organization" 
ON public.caixinha_transactions 
FOR INSERT 
WITH CHECK (
  organization_id IN ( 
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE organization_members.user_id = auth.uid()
  ) AND auth.uid() = user_id
);

CREATE POLICY "Users can update transactions from their organization" 
ON public.caixinha_transactions 
FOR UPDATE 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE organization_members.user_id = auth.uid()
));

CREATE POLICY "Users can delete transactions from their organization" 
ON public.caixinha_transactions 
FOR DELETE 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE organization_members.user_id = auth.uid()
));