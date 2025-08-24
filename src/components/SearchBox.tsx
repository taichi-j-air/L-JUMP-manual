import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchBox = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Mock suggestions for demo
  const mockSuggestions = [
    "アカウント設定の方法",
    "データ連携の手順",
    "レポート作成",
    "パスワード変更",
    "ログイン問題"
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="記事を検索..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4 py-3 w-full text-base bg-background border-border rounded-lg shadow-sm focus:ring-2 focus:ring-ljump-green focus:border-ljump-green"
        />
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute top-full left-4 right-4 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm border-b border-border last:border-b-0"
              onClick={() => {
                setSearchQuery(suggestion);
                setSuggestions([]);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};