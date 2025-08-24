import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  category_id?: string;
  author: string;
  published: boolean;
  featured: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface News {
  id: string;
  title: string;
  content?: string;
  published: boolean;
  created_at: string;
}

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch published articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Fetch published news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      setArticles(articlesData || []);
      setCategories(categoriesData || []);
      setNews(newsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    articles,
    categories,
    news,
    loading,
    refetch: fetchData
  };
};