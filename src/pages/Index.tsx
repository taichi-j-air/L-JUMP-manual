import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { NewsSection } from "@/components/NewsSection";
import { ArticleCard } from "@/components/ArticleCard";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";

// Mock articles data
const mockArticles = [
  {
    id: 1,
    title: "L!JUMP初期設定の完全ガイド",
    excerpt: "L!JUMPを初めて使用する際の基本的な設定方法を詳しく解説します。アカウント作成から基本機能の有効化まで、ステップバイステップで説明します。",
    category: "基本設定",
    publishDate: "2024年1月15日",
    author: "管理者"
  },
  {
    id: 2,
    title: "データ連携APIの設定手順",
    excerpt: "外部システムとのデータ連携を行うためのAPI設定方法について説明します。認証キーの取得から接続テストまでを網羅します。",
    category: "データ連携",
    publishDate: "2024年1月12日",
    author: "管理者"
  },
  {
    id: 3,
    title: "レポート機能の活用方法",
    excerpt: "L!JUMPのレポート機能を最大限に活用するためのヒントとテクニックをご紹介します。カスタムレポートの作成方法も含まれています。",
    category: "レポート機能",
    publishDate: "2024年1月10日",
    author: "管理者"
  },
  {
    id: 4,
    title: "ユーザー権限の管理",
    excerpt: "チーム内でのユーザー権限設定と管理方法について解説します。セキュリティを保ちながら効率的な運用を実現しましょう。",
    category: "アカウント管理",
    publishDate: "2024年1月8日",
    author: "管理者"
  },
  {
    id: 5,
    title: "よくある問題の解決方法",
    excerpt: "L!JUMP利用時によく発生する問題とその解決方法をまとめました。トラブル時の対処法を事前に把握しておきましょう。",
    category: "トラブルシューティング",
    publishDate: "2024年1月5日",
    author: "管理者"
  },
  {
    id: 6,
    title: "セキュリティ設定の強化",
    excerpt: "L!JUMPのセキュリティ機能を適切に設定し、データの安全性を確保する方法について詳しく説明します。",
    category: "基本設定",
    publishDate: "2024年1月3日",
    author: "管理者"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SearchBox />
      <NewsSection />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center">
              <span className="inline-block w-1 h-8 bg-ljump-green mr-4 rounded-full"></span>
              マニュアル記事
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {mockArticles.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
            
            {/* Pagination placeholder */}
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-ljump-green text-primary-foreground rounded-lg font-medium">
                  1
                </button>
                <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                  2
                </button>
                <button className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                  3
                </button>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;