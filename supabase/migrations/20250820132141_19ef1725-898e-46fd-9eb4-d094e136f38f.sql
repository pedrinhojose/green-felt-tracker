-- Create eliminations table for tracking who eliminated whom
CREATE TABLE public.eliminations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL,
  eliminated_player_id UUID NOT NULL,
  eliminator_player_id UUID,
  elimination_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  position INTEGER NOT NULL,
  organization_id UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.eliminations ENABLE ROW LEVEL SECURITY;

-- Create policies for eliminations
CREATE POLICY "Users can view eliminations from their organization" 
ON public.eliminations 
FOR SELECT 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
));

CREATE POLICY "Users can create eliminations in their organization" 
ON public.eliminations 
FOR INSERT 
WITH CHECK (
  organization_id IN ( 
    SELECT organization_members.organization_id
    FROM organization_members
    WHERE (organization_members.user_id = auth.uid())
  ) AND (auth.uid() = user_id)
);

CREATE POLICY "Users can update eliminations from their organization" 
ON public.eliminations 
FOR UPDATE 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
));

CREATE POLICY "Users can delete eliminations from their organization" 
ON public.eliminations 
FOR DELETE 
USING (organization_id IN ( 
  SELECT organization_members.organization_id
  FROM organization_members
  WHERE (organization_members.user_id = auth.uid())
));

-- Create index for better performance
CREATE INDEX idx_eliminations_game_id ON public.eliminations(game_id);
CREATE INDEX idx_eliminations_eliminated_player ON public.eliminations(eliminated_player_id);
CREATE INDEX idx_eliminations_eliminator_player ON public.eliminations(eliminator_player_id);
CREATE INDEX idx_eliminations_organization_id ON public.eliminations(organization_id);