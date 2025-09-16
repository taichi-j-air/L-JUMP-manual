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
      // Scroll to top when article changes
      window.scrollTo(0, 0);
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
      
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-2">
        <Link to="/">
          <Button variant="ghost" className="text-ljump-green hover:text-ljump-green-dark hover:bg-ljump-green/10">
            <ArrowLeft className="h-4 w-4 mr-2" />
            記事一覧に戻る
          </Button>
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto px-2 md:px-4 pb-8">
        <div className="bg-card border-0 md:border md:border-border md:rounded-lg md:shadow-card overflow-hidden">
          {/* Article Header with thumbnail */}
          {article.thumbnail_url && (
            <div className="aspect-video w-full">
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Article content container */}
          <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6">
              {/* Category badge */}
              {category && (
                <Badge 
                  variant="secondary" 
                  className="bg-ljump-green/10 text-ljump-green hover:bg-ljump-green/20 mb-4"
                >
                  {category.name}
                </Badge>
              )}
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {article.title}
              </h1>
              
              {/* Subtitle/Excerpt within content frame */}
              {article.excerpt && (
                <p className="text-muted-foreground mb-4 text-sm md:text-base leading-relaxed bg-muted/30 p-4 rounded-md border-l-4 border-ljump-green">
                  {article.excerpt}
                </p>
              )}
              
              {/* Meta information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center space-x-1">
                  <User size={14} />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{new Date(article.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                {article.updated_at !== article.created_at && (
                  <span>更新日: {new Date(article.updated_at).toLocaleDateString('ja-JP')}</span>
                )}
              </div>
            </div>
            
            {/* Article Content */}
            <BlockRenderer blocks={blocks} />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Article;