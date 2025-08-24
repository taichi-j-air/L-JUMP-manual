import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  { id: "all", name: "全体", count: 48 },
  { id: "basic", name: "基本設定", count: 12 },
  { id: "account", name: "アカウント管理", count: 8 },
  { id: "integration", name: "データ連携", count: 15 },
  { id: "reports", name: "レポート機能", count: 7 },
  { id: "troubleshooting", name: "トラブルシューティング", count: 6 }
];

export const Sidebar = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="w-full lg:w-80 space-y-6">
      <Card className="bg-card border border-border shadow-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <span className="inline-block w-1 h-6 bg-ljump-green mr-3 rounded-full"></span>
          カテゴリ
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "ghost"}
              className={`w-full justify-between text-left p-3 h-auto ${
                selectedCategory === category.id 
                  ? "bg-ljump-green hover:bg-ljump-green-dark text-primary-foreground" 
                  : "hover:bg-muted text-foreground"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span>{category.name}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                selectedCategory === category.id 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}>
                {category.count}
              </span>
            </Button>
          ))}
        </div>
      </Card>

      <Card className="bg-card border border-border shadow-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <span className="inline-block w-1 h-6 bg-ljump-green mr-3 rounded-full"></span>
          人気の記事
        </h3>
        <div className="space-y-3">
          {[
            "初期設定の完全ガイド",
            "データ連携の設定方法",
            "レポート作成のコツ"
          ].map((title, index) => (
            <div key={index} className="text-sm text-muted-foreground hover:text-ljump-green cursor-pointer transition-colors border-b border-border pb-2 last:border-b-0">
              {title}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};