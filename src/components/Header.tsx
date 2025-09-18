import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/hooks/useArticles";

interface HeaderProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header = ({ selectedCategory = "すべて", onCategoryChange, searchQuery = "", onSearchChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<(Category & { count: number })[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
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
          { id: 'all', name: '全体', slug: 'すべて', count: totalCount || 0, display_order: 0 },
          ...categoriesWithCounts
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <header className="bg-background border-b-4 border-ljump-green sticky top-0 z-50 shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
          <img 
            src="/lovable-uploads/b35433d3-00d4-4ea7-9996-76c1f655f289.png" 
            alt="L!JUMP Logo" 
            className="h-10 w-auto"
          />
          <span className="text-lg font-medium text-foreground">設定/操作マニュアル</span>
        </Link>

        <Button 
          className="bg-[#fe4d01] hover:bg-[#d94401] text-primary-foreground font-medium px-6 py-2 rounded-lg transition-colors shadow-elegant"
          onClick={() => window.open('https://ljump.example.com', '_blank')}
        >
          L!JUMPを使ってみる
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex flex-col hover:opacity-80 transition-opacity">
            <img 
              src="/lovable-uploads/b35433d3-00d4-4ea7-9996-76c1f655f289.png" 
              alt="L!JUMP Logo" 
              className="h-8 w-auto mb-1"
            />
            <span className="text-xs text-muted-foreground">設定/操作マニュアル</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button 
              className="bg-[#fe4d01] hover:bg-[#d94401] text-primary-foreground font-medium px-3 py-1.5 rounded-md text-xs"
              onClick={() => window.open('https://ljump.example.com', '_blank')}
            >
              L!JUMPを使ってみる
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Side Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 shadow-lg transform transition-transform">
              {/* Main content with close button and categories */}
              <div className="flex flex-col h-full">
                {/* Header with close button */}
                <div className="flex justify-between items-center p-4 border-b border-border">
                  <h2 className="text-lg font-semibold text-foreground">カテゴリ</h2>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Categories */}
                <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                  <button
                    onClick={() => {
                      onCategoryChange?.('すべて');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      !selectedCategory || selectedCategory === '' || selectedCategory === 'すべて'
                        ? 'bg-ljump-green text-white' 
                        : 'text-muted-foreground hover:text-ljump-green hover:bg-muted'
                    }`}
                  >
                    すべて
                  </button>
                  {categories.slice(1).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        onCategoryChange?.(category.name);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === category.name 
                          ? 'bg-ljump-green text-white' 
                          : 'text-foreground hover:text-ljump-green hover:bg-muted'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};