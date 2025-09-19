-- page_views table
CREATE TABLE public.page_views (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  path text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT page_views_pkey PRIMARY KEY (id)
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.page_views FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.page_views FOR INSERT WITH CHECK (true);

-- article_views table
CREATE TABLE public.article_views (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  article_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT article_views_pkey PRIMARY KEY (id),
  CONSTRAINT fk_article FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE
);
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.article_views FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.article_views FOR INSERT WITH CHECK (true);

-- link_clicks table
CREATE TABLE public.link_clicks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  link_url text NOT NULL,
  block_id uuid,
  article_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT link_clicks_pkey PRIMARY KEY (id),
  CONSTRAINT fk_article_link FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE
);
ALTER TABLE public.link_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.link_clicks FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.link_clicks FOR INSERT WITH CHECK (true);