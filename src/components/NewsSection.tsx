import { Card } from "@/components/ui/card";

// Mock data for news
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
  }
];

export const NewsSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Card className="bg-gradient-subtle border border-border shadow-card p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
          <span className="inline-block w-1 h-6 bg-ljump-green mr-3 rounded-full"></span>
          新着情報
        </h2>
        <div className="space-y-3">
          {mockNews.map((news) => (
            <div key={news.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <span className="text-sm text-muted-foreground whitespace-nowrap font-medium">
                {news.date}
              </span>
              <span className="text-sm text-foreground hover:text-ljump-green transition-colors flex-1">
                {news.title}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};