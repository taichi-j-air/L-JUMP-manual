export const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex items-center space-x-8 text-sm text-muted-foreground">
            <span className="text-foreground font-medium">
              © 2024 L!JUMP Manual Site
            </span>
            <button className="hover:text-ljump-green transition-colors">
              プライバシーポリシー
            </button>
            <button className="hover:text-ljump-green transition-colors">
              利用規約
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};