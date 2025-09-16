-- Add display_order column to categories table for custom ordering
ALTER TABLE public.categories 
ADD COLUMN display_order INTEGER DEFAULT 0;

-- Update existing categories with default ordering based on name
UPDATE public.categories 
SET display_order = CASE 
  WHEN name = '全体' THEN 0
  ELSE ROW_NUMBER() OVER (ORDER BY name)
END;