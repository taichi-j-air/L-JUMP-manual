-- Add display_order column to categories table for custom ordering
ALTER TABLE public.categories 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Create a simple ordering for existing categories
-- We'll set display_order based on created_at for now
UPDATE public.categories 
SET display_order = 
  CASE 
    WHEN name = '全体' THEN 0
    ELSE EXTRACT(EPOCH FROM created_at)::INTEGER % 1000
  END;