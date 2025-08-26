import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { EnhancedBlockEditor, Block } from '@/components/admin/EnhancedBlockEditor';
import { EditArticleModal, EditNewsModal, EditCategoryModal } from '@/components/admin/EditModals';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Article, Category, News } from '@/hooks/useArticles';

const Admin = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const { toast } = useToast();
  
  // Current tab state synced with URL hash
  const [currentTab, setCurrentTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['articles', 'news', 'categories', 'privacy', 'terms'].includes(hash) ? hash : 'articles';
  });

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
    published: false,
    article_id: ''
  });

  // Form states for new category
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: ''
  });

  // Site settings states
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');
  const [privacyBlocks, setPrivacyBlocks] = useState<Block[]>([]);
  const [termsBlocks, setTermsBlocks] = useState<Block[]>([]);
  const [usePrivacyBlockEditor, setUsePrivacyBlockEditor] = useState(false);
  const [useTermsBlockEditor, setUseTermsBlockEditor] = useState(false);

  // Edit states
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Block editor state
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);
  const [useBlockEditor, setUseBlockEditor] = useState(false);

  useEffect(() => {
    fetchAllData();
    fetchSiteSettings();
    
    // Listen for hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['articles', 'news', 'categories', 'privacy', 'terms'].includes(hash)) {
        setCurrentTab(hash);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
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

  const fetchSiteSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['privacy_policy', 'terms_of_service']);

      if (data) {
        const privacyData = data.find(item => item.key === 'privacy_policy');
        const termsData = data.find(item => item.key === 'terms_of_service');
        
        const privacyContent = privacyData?.value || '';
        const termsContent = termsData?.value || '';
        
        // Try to parse as JSON (block editor content) first, fallback to plain text
        try {
          const privacyParsed = JSON.parse(privacyContent);
          if (Array.isArray(privacyParsed) && privacyParsed.length > 0) {
            setPrivacyBlocks(privacyParsed);
            setUsePrivacyBlockEditor(true);
          } else {
            setPrivacyPolicy(privacyContent);
          }
        } catch {
          setPrivacyPolicy(privacyContent);
        }
        
        try {
          const termsParsed = JSON.parse(termsContent);
          if (Array.isArray(termsParsed) && termsParsed.length > 0) {
            setTermsBlocks(termsParsed);
            setUseTermsBlockEditor(true);
          } else {
            setTermsOfService(termsContent);
          }
        } catch {
          setTermsOfService(termsContent);
        }
      }
    } catch (error) {
      console.error('Error fetching site settings:', error);
    }
  };

  const handleCreateArticle = async () => {
    if (!newArticle.title || (!newArticle.content && editorBlocks.length === 0)) {
      toast({
        title: "エラー",
        description: "タイトルと内容は必須です",
        variant: "destructive"
      });
      return;
    }

    try {
      let content = newArticle.content;
      
      // If using block editor, convert blocks to content
      if (useBlockEditor && editorBlocks.length > 0) {
        content = JSON.stringify(editorBlocks);
      }

      // Prepare article data with proper UUID handling
      const articleData = {
        ...newArticle,
        content,
        category_id: newArticle.category_id || null // Convert empty string to null for UUID field
      };

      const { error } = await supabase
        .from('articles')
        .insert([articleData]);

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

      setEditorBlocks([]);
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
        published: false,
        article_id: ''
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

  const handleCreateCategory = async () => {
    if (!newCategory.name || !newCategory.slug) {
      toast({
        title: "エラー",
        description: "カテゴリ名とスラッグは必須です",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .insert([newCategory]);

      if (error) throw error;

      toast({
        title: "成功",
        description: "カテゴリが作成されました"
      });

      setNewCategory({
        name: '',
        slug: '',
        description: ''
      });

      fetchAllData();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "エラー",
        description: "カテゴリの作成に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleUpdateArticle = async () => {
    if (!editingArticle) return;

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: editingArticle.title,
          excerpt: editingArticle.excerpt,
          content: editingArticle.content,
          category_id: editingArticle.category_id,
          published: editingArticle.published,
          featured: editingArticle.featured,
          thumbnail_url: editingArticle.thumbnail_url
        })
        .eq('id', editingArticle.id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "記事が更新されました"
      });

      setEditingArticle(null);
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

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "カテゴリが更新されました"
      });

      setEditingCategory(null);
      fetchAllData();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "エラー",
        description: "カテゴリの更新に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm('本当にこの記事を削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "記事が削除されました"
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "エラー",
        description: "記事の削除に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('本当にこのニュースを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "ニュースが削除されました"
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "エラー",
        description: "ニュースの削除に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('本当にこのカテゴリを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "成功",
        description: "カテゴリが削除されました"
      });

      fetchAllData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "エラー",
        description: "カテゴリの削除に失敗しました",
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

  const handleImageUpload = async (files: FileList) => {
    const file = files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "エラー",
            description: "画像のアップロードに失敗しました",
            variant: "destructive"
          });
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        setNewArticle({ ...newArticle, thumbnail_url: publicUrl });
        
        toast({
          title: "成功",
          description: "画像がアップロードされました"
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        toast({
          title: "エラー",
          description: "画像のアップロードに失敗しました",
          variant: "destructive"
        });
      }
    }
  };

  const handleSavePrivacyPolicy = async () => {
    try {
      let content = privacyPolicy;
      
      // If using block editor, convert blocks to content
      if (usePrivacyBlockEditor && privacyBlocks.length > 0) {
        content = JSON.stringify(privacyBlocks);
      }
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'privacy_policy',
          value: content
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: "成功",
        description: "プライバシーポリシーが保存されました"
      });
    } catch (error) {
      console.error('Error saving privacy policy:', error);
      toast({
        title: "エラー",
        description: "プライバシーポリシーの保存に失敗しました",
        variant: "destructive"
      });
    }
  };

  const handleSaveTermsOfService = async () => {
    try {
      let content = termsOfService;
      
      // If using block editor, convert blocks to content
      if (useTermsBlockEditor && termsBlocks.length > 0) {
        content = JSON.stringify(termsBlocks);
      }
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'terms_of_service',
          value: content
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: "成功",
        description: "利用規約が保存されました"
      });
    } catch (error) {
      console.error('Error saving terms of service:', error);
      toast({
        title: "エラー",
        description: "利用規約の保存に失敗しました",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-4 space-y-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">L!JUMP Admin</h2>
          <div className="w-full h-px bg-border"></div>
        </div>
        
        <nav className="space-y-2">
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">コンテンツ管理</h3>
            <a href="#articles" className="block px-3 py-2 text-sm rounded hover:bg-muted transition-colors">記事管理</a>
            <a href="#news" className="block px-3 py-2 text-sm rounded hover:bg-muted transition-colors">ニュース管理</a>
            <a href="#categories" className="block px-3 py-2 text-sm rounded hover:bg-muted transition-colors">カテゴリ管理</a>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">サイト設定</h3>
            <a href="#privacy" className="block px-3 py-2 text-sm rounded hover:bg-muted transition-colors">プライバシーポリシー</a>
            <a href="#terms" className="block px-3 py-2 text-sm rounded hover:bg-muted transition-colors">利用規約</a>
          </div>
        </nav>
        
        <div className="mt-auto pt-4">
          <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
            サイトに戻る
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">管理者ページ</h1>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger 
                value="articles"
                onClick={() => window.location.hash = 'articles'}
              >
                記事管理
              </TabsTrigger>
              <TabsTrigger 
                value="news"
                onClick={() => window.location.hash = 'news'}
              >
                ニュース管理
              </TabsTrigger>
              <TabsTrigger 
                value="categories"
                onClick={() => window.location.hash = 'categories'}
              >
                カテゴリ管理
              </TabsTrigger>
              <TabsTrigger 
                value="privacy"
                onClick={() => window.location.hash = 'privacy'}
              >
                プライバシーポリシー
              </TabsTrigger>
              <TabsTrigger 
                value="terms"
                onClick={() => window.location.hash = 'terms'}
              >
                利用規約
              </TabsTrigger>
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
                  
                  {/* Image Upload */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">または画像をアップロード</Label>
                    <FileUpload
                      onFileSelect={handleImageUpload}
                      accept="image/*"
                    />
                  </div>

                  {/* Editor Mode Toggle */}
                  <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                    <Switch
                      id="block-editor"
                      checked={useBlockEditor}
                      onCheckedChange={setUseBlockEditor}
                    />
                    <Label htmlFor="block-editor" className="cursor-pointer">
                      ブロックエディタを使用（高度な編集機能）
                    </Label>
                  </div>

                  {/* Content Editor */}
                  {useBlockEditor ? (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">記事内容（ブロックエディタ）</Label>
                      <EnhancedBlockEditor 
                        blocks={editorBlocks} 
                        onChange={setEditorBlocks} 
                      />
                    </div>
                  ) : (
                    <Textarea
                      placeholder="記事内容"
                      value={newArticle.content}
                      onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                      rows={15}
                    />
                  )}
                  
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
                            onClick={() => setEditingArticle(article)}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleArticlePublished(article.id, article.published)}
                          >
                            {article.published ? '非公開にする' : '公開する'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            削除
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
                  <Select value={newNews.article_id} onValueChange={(value) => setNewNews({ ...newNews, article_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="記事を選択（オプション）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">記事リンクなし</SelectItem>
                      {articles.filter(article => article.published).slice(0, 5).map((article) => (
                        <SelectItem key={article.id} value={article.id}>
                          {article.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                            onClick={() => setEditingNews(newsItem)}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleNewsPublished(newsItem.id, newsItem.published)}
                          >
                            {newsItem.published ? '非公開にする' : '公開する'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteNews(newsItem.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              {/* Create New Category */}
              <Card>
                <CardHeader>
                  <CardTitle>新しいカテゴリを作成</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="カテゴリ名"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Input
                    placeholder="スラッグ（URL用）"
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                  />
                  <Input
                    placeholder="説明（オプション）"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  />
                  <Button onClick={handleCreateCategory} className="bg-ljump-green hover:bg-ljump-green-dark">
                    カテゴリを作成
                  </Button>
                </CardContent>
              </Card>

              {/* Categories List */}
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
                          <p className="text-xs text-muted-foreground">スラッグ: {category.slug}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCategory(category)}
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            削除
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>プライバシーポリシー編集</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Editor Mode Toggle */}
                  <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                    <Switch
                      id="privacy-block-editor"
                      checked={usePrivacyBlockEditor}
                      onCheckedChange={setUsePrivacyBlockEditor}
                    />
                    <Label htmlFor="privacy-block-editor" className="cursor-pointer">
                      ブロックエディタを使用（高度な編集機能）
                    </Label>
                  </div>

                  {/* Content Editor */}
                  {usePrivacyBlockEditor ? (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">プライバシーポリシー内容（ブロックエディタ）</Label>
                      <EnhancedBlockEditor 
                        blocks={privacyBlocks} 
                        onChange={setPrivacyBlocks} 
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground mb-4">プライバシーポリシーの内容を編集できます（HTMLタグ使用可）</p>
                      <Textarea
                        placeholder="プライバシーポリシーの内容を入力..."
                        rows={15}
                        value={privacyPolicy}
                        onChange={(e) => setPrivacyPolicy(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <Button 
                    className="bg-ljump-green hover:bg-ljump-green-dark"
                    onClick={handleSavePrivacyPolicy}
                  >
                    保存
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="terms" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>利用規約編集</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Editor Mode Toggle */}
                  <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                    <Switch
                      id="terms-block-editor"
                      checked={useTermsBlockEditor}
                      onCheckedChange={setUseTermsBlockEditor}
                    />
                    <Label htmlFor="terms-block-editor" className="cursor-pointer">
                      ブロックエディタを使用（高度な編集機能）
                    </Label>
                  </div>

                  {/* Content Editor */}
                  {useTermsBlockEditor ? (
                    <div>
                      <Label className="text-sm font-medium mb-2 block">利用規約内容（ブロックエディタ）</Label>
                      <EnhancedBlockEditor 
                        blocks={termsBlocks} 
                        onChange={setTermsBlocks} 
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground mb-4">利用規約の内容を編集できます（HTMLタグ使用可）</p>
                      <Textarea
                        placeholder="利用規約の内容を入力..."
                        rows={15}
                        value={termsOfService}
                        onChange={(e) => setTermsOfService(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <Button 
                    className="bg-ljump-green hover:bg-ljump-green-dark"
                    onClick={handleSaveTermsOfService}
                  >
                    保存
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Edit Modals */}
          <EditArticleModal
            article={editingArticle}
            categories={categories}
            isOpen={!!editingArticle}
            onClose={() => setEditingArticle(null)}
            onSave={handleUpdateArticle}
            onChange={setEditingArticle}
          />
          
          <EditNewsModal
            news={editingNews}
            isOpen={!!editingNews}
            onClose={() => setEditingNews(null)}
            onSave={() => {
              // Handle news update
              setEditingNews(null);
              fetchAllData();
            }}
            onChange={setEditingNews}
          />
          
          <EditCategoryModal
            category={editingCategory}
            isOpen={!!editingCategory}
            onClose={() => setEditingCategory(null)}
            onSave={handleUpdateCategory}
            onChange={setEditingCategory}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;