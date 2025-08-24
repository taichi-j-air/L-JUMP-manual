-- Allow full admin access to all tables (for development/demo purposes)
-- In production, you should create a proper admin role

-- Articles table admin access
DROP POLICY IF EXISTS "Published articles are viewable by everyone" ON public.articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Admin can manage all articles" ON public.articles;

CREATE POLICY "Anyone can view published articles"
ON public.articles
FOR SELECT
USING (published = true);

CREATE POLICY "Admin can manage all articles"
ON public.articles
FOR ALL
USING (true)
WITH CHECK (true);

-- Categories table admin access  
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admin can manage categories" ON public.categories;

CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);

CREATE POLICY "Admin can manage categories"
ON public.categories
FOR ALL
USING (true)
WITH CHECK (true);

-- News table admin access
DROP POLICY IF EXISTS "Published news are viewable by everyone" ON public.news;
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Admin can manage all news" ON public.news;

CREATE POLICY "Anyone can view published news"
ON public.news
FOR SELECT
USING (published = true);

CREATE POLICY "Admin can manage all news"
ON public.news
FOR ALL
USING (true)
WITH CHECK (true);