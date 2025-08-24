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
  return (
    <div className="w-full lg:w-80 space-y-3 md:space-y-6">
      {/* Popular Articles - Mobile First */}
      <div className="bg-card border border-border rounded-lg p-3 md:p-6 shadow-card">
        <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4 flex items-center">
          <span className="inline-block w-1 h-5 md:h-6 bg-ljump-green mr-2 md:mr-3 rounded-full"></span>
          人気の記事
        </h3>
        <div className="space-y-2 md:space-y-4">
          {[
            "初期設定の完全ガイド",
            "データ連携の設定方法", 
            "レポート作成のコツ"
          ].map((title, index) => (
            <div key={index} className="group cursor-pointer">
              <h4 className="text-xs md:text-sm font-medium text-foreground group-hover:text-ljump-green transition-colors line-clamp-2 mb-1">
                {title}
              </h4>
              <div className="flex items-center text-xs text-muted-foreground space-x-1 md:space-x-2">
                <span className="text-xs">2024年1月{15-index}日</span>
              </div>
            </div>
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
              className="w-full text-left px-2 md:px-3 py-1 md:py-2 text-xs md:text-sm text-muted-foreground hover:text-ljump-green hover:bg-muted/50 rounded-md transition-colors flex justify-between items-center"
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