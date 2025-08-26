import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BlockRenderer } from '@/components/BlockRenderer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Article as ArticleType, Category } from '@/hooks/useArticles';
import { Block } from '@/components/admin/EnhancedBlockEditor';

const Article = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchArticle = async (articleId: string) => {
    try {
      // Fetch article
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .eq('published', true)
        .single();

      if (articleError || !articleData) {
        console.error('Article not found:', articleError);
        setLoading(false);
        return;
      }

      setArticle(articleData);

      // Fetch category if exists
      if (articleData.category_id) {
        const { data: categoryData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', articleData.category_id)
          .single();

        setCategory(categoryData);
      }

      // Parse content blocks
      try {
        const parsedBlocks = JSON.parse(articleData.content);
        if (Array.isArray(parsedBlocks)) {
          setBlocks(parsedBlocks);
        } else {
          // Fallback for old content format
          setBlocks([{
            id: '1',
            type: 'paragraph',
            content: { text: articleData.content },
            order: 0
          }]);
        }
      } catch (error) {
        // Fallback for non-JSON content
        setBlocks([{
          id: '1',
          type: 'paragraph',
          content: { text: articleData.content },
          order: 0
        }]);
      }

    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-lg text-muted-foreground">読み込み中...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">記事が見つかりません</h1>
            <p className="text-muted-foreground mb-6">お探しの記事は存在しないか、削除された可能性があります。</p>
            <Link to="/">
              <Button className="bg-ljump-green hover:bg-ljump-green-dark">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="p-0 h-auto text-muted-foreground hover:text-ljump-green">
              <ArrowLeft className="h-4 w-4 mr-2" />
              記事一覧に戻る
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          {article.thumbnail_url && (
            <img 
              src={article.thumbnail_url} 
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6"
            />
          )}
          
          <div className="flex items-center justify-between mb-4">
            {category && (
              <Badge 
                variant="secondary" 
                className="bg-ljump-green/10 text-ljump-green hover:bg-ljump-green/20"
              >
                {category.name}
              </Badge>
            )}
            <div className="flex items-center text-sm text-muted-foreground space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User size={14} />
                <span>{article.author}</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {article.title}
          </h1>
          
          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-6">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* Article Content */}
        <div className="mb-12">
          <BlockRenderer blocks={blocks} />
        </div>

      </div>
      
      <Footer />
    </div>
  );
};

export default Article;