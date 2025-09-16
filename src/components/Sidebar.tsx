import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Article, Category } from "@/hooks/useArticles";

interface SidebarProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const Sidebar = ({ selectedCategory, onCategoryChange }: SidebarProps) => {
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetchSidebarData();
  }, []);

  const fetchSidebarData = async () => {
    try {
      // Fetch categories with article counts
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name');

      if (categoriesData) {
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category) => {
            const { count } = await supabase
              .from('articles')
              .select('*', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .eq('published', true);
            
            return { ...category, count: count || 0 };
          })
        );

        // Add "All" category
        const { count: totalCount } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('published', true);

        setCategories([
          { id: 'all', name: '全体', slug: 'すべて', count: totalCount || 0 },
          ...categoriesWithCounts
        ]);
      }

      // Fetch popular articles (featured articles or latest ones)
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);

      setPopularArticles(articlesData || []);
    } catch (error) {
      console.error('Error fetching sidebar data:', error);
    }
  };
  return (
    <div className="w-full lg:w-80 space-y-3 md:space-y-6">
      {/* Popular Articles - Mobile First */}
      <div className="bg-card border border-border rounded-lg p-3 md:p-6 shadow-card">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center">
          <span className="inline-block w-1 h-5 md:h-6 bg-ljump-green mr-2 md:mr-3 rounded-full"></span>
          人気の記事
        </h3>
        <div className="space-y-2 md:space-y-4">
          {popularArticles.slice(0, 5).map((article) => (
            <Link key={article.id} to={`/article/${article.id}`} className="group cursor-pointer block">
              <h4 className="text-xs md:text-sm font-medium text-foreground group-hover:text-ljump-green transition-colors line-clamp-2 mb-1">
                {article.title}
              </h4>
              <div className="flex items-center text-xs text-muted-foreground space-x-1 md:space-x-2">
                <span className="text-xs">{new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-card border border-border rounded-lg p-3 md:p-6 shadow-card">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center">
          <span className="inline-block w-1 h-5 md:h-6 bg-ljump-green mr-2 md:mr-3 rounded-full"></span>
          カテゴリ
        </h3>
        <div className="space-y-1 md:space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange?.(category.slug === 'すべて' ? 'すべて' : category.name)}
              className={`w-full text-left px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm rounded-md transition-colors flex justify-between items-center ${
                selectedCategory === (category.slug === 'すべて' ? 'すべて' : category.name) 
                  ? 'text-ljump-green bg-ljump-green/10' 
                  : 'text-foreground hover:text-ljump-green hover:bg-muted/50'
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs bg-muted px-2 py-1 rounded-full">{category.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};