import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Article, Category, News } from '@/hooks/useArticles';

const Admin = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const { toast } = useToast();

  // Form states for new article
  const [newArticle, setNewArticle] = useState({
    title: '',
    excerpt: '',
    content: '',
    category_id: '',
    published: false,
    featured: false,
    thumbnail_url: ''
  });

  // Form states for new news
  const [newNews, setNewNews] = useState({
    title: '',
    content: '',
    published: false
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch all articles (published and unpublished)
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      // Fetch all news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });

      setArticles(articlesData || []);
      setCategories(categoriesData || []);
      setNews(newsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCreateArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast({
        title: "エラー",
        description: "タイトルと内容は必須です",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('articles')
        .insert([newArticle]);

      if (error) throw error;

      toast({
        title: "成功",
        description: "記事が作成されました"
      });

      setNewArticle({
        title: '',
        excerpt: '',
        content: '',
        category_id: '',
        published: false,
        featured: false,
        thumbnail_url: ''
      });

      fetchAllData();
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        title: "エラー",
        description: "記事の作成に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleCreateNews = async () => {
    if (!newNews.title) {
      toast({
        title: "エラー",
        description: "タイトルは必須です",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .insert([newNews]);

      if (error) throw error;

      toast({
        title: "成功",
        description: "ニュースが作成されました"
      });

      setNewNews({
        title: '',
        content: '',
        published: false
      });

      fetchAllData();
    } catch (error) {
      console.error('Error creating news:', error);
      toast({
        title: "エラー",
        description: "ニュースの作成に失敗しました",
        variant: "destructive"
      });
    }
  };

  const toggleArticlePublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ published: !published })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "成功",
        description: `記事を${!published ? '公開' : '非公開'}しました`
      });

      fetchAllData();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "エラー",
        description: "記事の更新に失敗しました",
        variant: "destructive"
      });
    }
  };

  const toggleNewsPublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ published: !published })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "成功",
        description: `ニュースを${!published ? '公開' : '非公開'}しました`
      });

      fetchAllData();
    } catch (error) {
      console.error('Error updating news:', error);
      toast({
        title: "エラー",
        description: "ニュースの更新に失敗しました",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">L!JUMP 管理者ページ</h1>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            サイトに戻る
          </Button>
        </div>

        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="articles">記事管理</TabsTrigger>
            <TabsTrigger value="news">ニュース管理</TabsTrigger>
            <TabsTrigger value="categories">カテゴリ管理</TabsTrigger>
          </TabsList>

          <TabsContent value="articles" className="space-y-6">
            {/* Create New Article */}
            <Card>
              <CardHeader>
                <CardTitle>新しい記事を作成</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="記事タイトル"
                  value={newArticle.title}
                  onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                />
                <Input
                  placeholder="記事の概要"
                  value={newArticle.excerpt}
                  onChange={(e) => setNewArticle({ ...newArticle, excerpt: e.target.value })}
                />
                <Textarea
                  placeholder="記事内容"
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                  rows={10}
                />
                <Select value={newArticle.category_id} onValueChange={(value) => setNewArticle({ ...newArticle, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="カテゴリを選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="サムネイル画像URL（オプション）"
                  value={newArticle.thumbnail_url}
                  onChange={(e) => setNewArticle({ ...newArticle, thumbnail_url: e.target.value })}
                />
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={newArticle.published}
                      onCheckedChange={(checked) => setNewArticle({ ...newArticle, published: checked })}
                    />
                    <Label htmlFor="published">公開</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={newArticle.featured}
                      onCheckedChange={(checked) => setNewArticle({ ...newArticle, featured: checked })}
                    />
                    <Label htmlFor="featured">注目記事</Label>
                  </div>
                </div>
                <Button onClick={handleCreateArticle} className="bg-ljump-green hover:bg-ljump-green-dark">
                  記事を作成
                </Button>
              </CardContent>
            </Card>

            {/* Articles List */}
            <Card>
              <CardHeader>
                <CardTitle>記事一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                        <p className="text-xs text-muted-foreground">
                          作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${article.published ? 'bg-ljump-green/20 text-ljump-green' : 'bg-muted text-muted-foreground'}`}>
                          {article.published ? '公開中' : '非公開'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleArticlePublished(article.id, article.published)}
                        >
                          {article.published ? '非公開にする' : '公開する'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            {/* Create New News */}
            <Card>
              <CardHeader>
                <CardTitle>新しいニュースを作成</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="ニュースタイトル"
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                />
                <Textarea
                  placeholder="ニュース内容（オプション）"
                  value={newNews.content}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                  rows={5}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="news-published"
                    checked={newNews.published}
                    onCheckedChange={(checked) => setNewNews({ ...newNews, published: checked })}
                  />
                  <Label htmlFor="news-published">公開</Label>
                </div>
                <Button onClick={handleCreateNews} className="bg-ljump-green hover:bg-ljump-green-dark">
                  ニュースを作成
                </Button>
              </CardContent>
            </Card>

            {/* News List */}
            <Card>
              <CardHeader>
                <CardTitle>ニュース一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {news.map((newsItem) => (
                    <div key={newsItem.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{newsItem.title}</h3>
                        <p className="text-sm text-muted-foreground">{newsItem.content}</p>
                        <p className="text-xs text-muted-foreground">
                          作成日: {new Date(newsItem.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${newsItem.published ? 'bg-ljump-green/20 text-ljump-green' : 'bg-muted text-muted-foreground'}`}>
                          {newsItem.published ? '公開中' : '非公開'}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleNewsPublished(newsItem.id, newsItem.published)}
                        >
                          {newsItem.published ? '非公開にする' : '公開する'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>カテゴリ一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <h3 className="font-semibold text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;