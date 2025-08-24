import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

// Mock data for news - will be replaced with database data
const mockNews = [
  {
    id: 1,
    date: "2024年1月15日",
    title: "L!JUMP新機能：自動レポート生成機能が追加されました"
  },
  {
    id: 2, 
    date: "2024年1月10日",
    title: "データ連携APIの仕様変更について"
  },
  {
    id: 3,
    date: "2024年1月5日", 
    title: "年末年始のサポート対応スケジュールについて"
  },
  {
    id: 4,
    date: "2024年1月3日",
    title: "メンテナンス完了のお知らせ"
  }
];

// Show different number of items based on screen size
const useNewsItems = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile ? mockNews.slice(0, 3) : mockNews.slice(0, 4);
};

export const NewsSection = () => {
  const newsItems = useNewsItems();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <Card className="bg-gradient-subtle border border-border shadow-card p-3 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-foreground mb-3 md:mb-4 flex items-center">
          <span className="inline-block w-1 h-5 md:h-6 bg-ljump-green mr-2 md:mr-3 rounded-full"></span>
          新着情報
        </h2>
        <div className="space-y-2 md:space-y-3">
          {newsItems.map((news) => (
            <div key={news.id} className="flex items-start space-x-2 md:space-x-4 p-2 md:p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap font-medium">
                {news.date}
              </span>
              <span className="text-xs md:text-sm text-foreground hover:text-ljump-green transition-colors flex-1">
                {news.title}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};