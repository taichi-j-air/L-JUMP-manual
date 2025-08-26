import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, X } from "lucide-react";

const categories = [
  "すべて",
  "基本設定",
  "アカウント管理", 
  "データ連携",
  "レポート機能",
  "トラブルシューティング"
];

interface HeaderProps {
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header = ({ selectedCategory = "すべて", onCategoryChange, searchQuery = "", onSearchChange }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b-4 border-ljump-green sticky top-0 z-50 shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/b35433d3-00d4-4ea7-9996-76c1f655f289.png" 
            alt="L!JUMP Logo" 
            className="h-10 w-auto"
          />
          <span className="text-lg font-medium text-foreground">設定/操作マニュアル</span>
        </div>

        <Button 
          className="bg-ljump-green hover:bg-ljump-green-dark text-primary-foreground font-medium px-6 py-2 rounded-lg transition-colors shadow-elegant"
          onClick={() => window.open('https://ljump.example.com', '_blank')}
        >
          L!JUMPを使ってみる
        </Button>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <img 
              src="/lovable-uploads/b35433d3-00d4-4ea7-9996-76c1f655f289.png" 
              alt="L!JUMP Logo" 
              className="h-8 w-auto mb-1"
            />
            <span className="text-xs text-muted-foreground">設定/操作マニュアル</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Mobile Side Menu Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-0 right-0 h-full w-80 bg-background border-l border-border z-50 shadow-lg transform transition-transform">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">メニュー</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <Button 
                  className="w-full bg-ljump-green hover:bg-ljump-green-dark text-primary-foreground"
                  onClick={() => window.open('https://ljump.example.com', '_blank')}
                >
                  L!JUMPを使ってみる
                </Button>
                
                <div>
                  <h3 className="font-medium mb-2">カテゴリ</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          onCategoryChange?.(category);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};