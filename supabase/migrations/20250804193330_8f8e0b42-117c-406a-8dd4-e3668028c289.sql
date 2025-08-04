-- Add host_schedule column to seasons table
ALTER TABLE public.seasons 
ADD COLUMN host_schedule JSONB NOT NULL DEFAULT '[]'::jsonb;