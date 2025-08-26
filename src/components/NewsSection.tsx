import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { News } from "@/hooks/useArticles";

export const NewsSection = () => {
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(6);

      setNewsItems(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const handleNewsClick = (newsItem: News) => {
    if (newsItem.article_id) {
      // Navigate to the linked article
      window.location.href = `/article/${newsItem.article_id}`;
    }
  };

  const displayedNews = isMobile ? newsItems.slice(0, 3) : newsItems.slice(0, 4);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <Card className="bg-gradient-subtle border border-border shadow-card p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4 flex items-center">
          <span className="inline-block w-1 h-5 md:h-6 bg-ljump-green mr-2 md:mr-3 rounded-full"></span>
          新着情報
        </h2>
        <div className="space-y-2 md:space-y-3">
          {displayedNews.map((news) => (
            <div 
              key={news.id} 
              className={`flex items-start space-x-2 md:space-x-4 p-2 md:p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                news.article_id ? 'cursor-pointer' : ''
              }`}
              onClick={() => handleNewsClick(news)}
            >
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap font-medium">
                {new Date(news.created_at).toLocaleDateString('ja-JP')}
              </span>
              <span className={`text-xs md:text-sm text-foreground hover:text-ljump-green transition-colors flex-1 ${
                news.article_id ? 'underline decoration-dotted' : ''
              }`}>
                {news.title}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};