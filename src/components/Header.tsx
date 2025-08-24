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

export const Header = () => {
  const [selectedCategory, setSelectedCategory] = useState("すべて");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b-4 border-ljump-green sticky top-0 z-50 shadow-sm">
      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/d9588156-7a67-47ea-873a-f25c119cd51f.png" 
            alt="L!JUMP Logo" 
            className="h-10 w-auto"
          />
          <span className="text-lg font-medium text-foreground">設定/操作マニュアル</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48 bg-background">
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {categories.map((category) => (
                <SelectItem key={category} value={category} className="hover:bg-muted">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              src="/lovable-uploads/d9588156-7a67-47ea-873a-f25c119cd51f.png" 
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-muted border-t border-border p-4 space-y-3">
            <Button 
              className="w-full bg-ljump-green hover:bg-ljump-green-dark text-primary-foreground"
              onClick={() => window.open('https://ljump.example.com', '_blank')}
            >
              L!JUMPを使ってみる
            </Button>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="hover:bg-muted">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </header>
  );
};