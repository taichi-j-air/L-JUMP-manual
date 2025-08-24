import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
  author: string;
  thumbnail?: string;
}

export const ArticleCard = ({ 
  id, 
  title, 
  excerpt, 
  category, 
  publishDate, 
  author, 
  thumbnail 
}: ArticleCardProps) => {
  return (
    <Card className="bg-card border border-border shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group">
      <CardHeader className="p-0">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-primary rounded-t-lg flex items-center justify-center">
            <span className="text-primary-foreground text-lg font-medium">L!JUMP</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge 
            variant="secondary" 
            className="bg-ljump-green/10 text-ljump-green hover:bg-ljump-green/20 transition-colors"
          >
            {category}
          </Badge>
          <div className="flex items-center text-xs text-muted-foreground space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar size={12} />
              <span>{publishDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User size={12} />
              <span>{author}</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-ljump-green transition-colors line-clamp-2">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-3">
          {excerpt}
        </p>
      </CardContent>
    </Card>
  );
};