import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { NewsSection } from "@/components/NewsSection";
import { ArticleCard } from "@/components/ArticleCard";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { useArticles } from "@/hooks/useArticles";

const Index = () => {
  const { articles, categories, news, loading } = useArticles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let filtered = articles;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== "すべて") {
      const categoryMap: { [key: string]: string } = {
        "基本設定": "基本設定",
        "アカウント管理": "アカウント管理",
        "データ連携": "データ連携", 
        "レポート機能": "レポート機能",
        "トラブルシューティング": "トラブルシューティング"
      };
      
      filtered = filtered.filter(article => {
        const category = categories.find(cat => cat.id === article.category_id);
        return category && categoryMap[selectedCategory] === category.name;
      });
    }
    
    return filtered;
  }, [articles, categories, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <SearchBox 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <NewsSection />
      
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6 flex items-center">
              <span className="inline-block w-1 h-6 md:h-8 bg-ljump-green mr-3 md:mr-4 rounded-full"></span>
              マニュアル記事
              {selectedCategory !== "すべて" && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  - {selectedCategory}
                </span>
              )}
              {searchQuery && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  - 検索: "{searchQuery}"
                </span>
              )}
            </h2>
            
            {filteredArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                  {filteredArticles.map((article) => (
                     <ArticleCard 
                       key={article.id} 
                       id={article.id}
                       title={article.title}
                      excerpt={article.excerpt || ''}
                      category={categories.find(cat => cat.id === article.category_id)?.name || 'その他'}
                      publishDate={new Date(article.created_at).toLocaleDateString('ja-JP')}
                      author={article.author}
                      thumbnail={article.thumbnail_url}
                    />
                  ))}
                </div>
                
                {/* Dynamic Pagination */}
                {filteredArticles.length > 6 && (
                  <div className="flex justify-center mt-8 md:mt-12">
                    <div className="flex space-x-2">
                      <button className="px-3 md:px-4 py-2 bg-ljump-green text-primary-foreground rounded-lg font-medium text-sm md:text-base">
                        1
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== "すべて" 
                    ? "条件に一致する記事が見つかりませんでした。"
                    : "まだ記事が投稿されていません。"
                  }
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || selectedCategory !== "すべて"
                    ? "検索条件やカテゴリを変更してお試しください。"
                    : "管理者がコンテンツを追加するまでお待ちください。"
                  }
                </p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:block">
        <Sidebar 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;