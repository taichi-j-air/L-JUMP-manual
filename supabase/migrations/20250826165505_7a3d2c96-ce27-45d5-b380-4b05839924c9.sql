-- Add article_id column to news table for linking news to articles
ALTER TABLE public.news ADD COLUMN article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL;