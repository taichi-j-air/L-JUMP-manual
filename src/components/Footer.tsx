import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export const Footer = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleAdminLogin = () => {
    if (password === "1011") {
      toast({
        title: "ログイン成功",
        description: "管理者ページにリダイレクトします",
      });
      // Redirect to admin page
      window.location.href = "/admin";
    } else {
      toast({
        title: "ログイン失敗",
        description: "パスワードが間違っています",
        variant: "destructive",
      });
    }
    setPassword("");
    setShowAdminLogin(false);
  };

  return (
    <footer className="bg-ljump-green-subtle border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center space-x-4 md:space-x-8 order-2 md:order-1">
              <button className="hover:text-ljump-green transition-colors text-xs md:text-sm">
                プライバシーポリシー
              </button>
              <button className="hover:text-ljump-green transition-colors text-xs md:text-sm">
                利用規約
              </button>
            </div>
            <span className="text-foreground font-light text-xs md:text-sm order-1 md:order-2">
              © 2024 L!JUMP Manual Site
            </span>
          </div>
          
          {/* Admin entrance - PC only */}
          <div className="hidden md:block">
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="text-xs text-muted-foreground/50 hover:text-ljump-green transition-colors"
            >
              L!JUMP-マニュアル
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Dialog */}
      <Dialog open={showAdminLogin} onOpenChange={setShowAdminLogin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>管理者ログイン</DialogTitle>
            <DialogDescription>
              管理者用のパスワードを入力してください
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <div className="flex space-x-2">
              <Button onClick={handleAdminLogin} className="flex-1 bg-ljump-green hover:bg-ljump-green-dark">
                ログイン
              </Button>
              <Button variant="outline" onClick={() => setShowAdminLogin(false)} className="flex-1">
                キャンセル
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};