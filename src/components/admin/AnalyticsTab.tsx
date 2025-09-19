import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAnalytics } from "@/hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const UNCATEGORIZED_KEY = 'uncategorized';
const UNCATEGORIZED_LABEL = 'カテゴリ未設定';
const STATIC_PAGE_KEY = 'static';
const STATIC_PAGE_LABEL = 'その他ページ';
const CATEGORY_COLOR_PALETTE = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F472B6', '#0EA5E9', '#84CC16', '#F97316', '#14B8A6'];
const STATIC_PAGE_COLOR = '#94A3B8';
const DEFAULT_CATEGORY_COLOR = '#6B7280';

const getArticleIdFromPath = (path: string): string | null => {
  const match = path.match(/^\/article\/(.+)$/);
  if (!match) {
    return null;
  }

  const rawArticleId = match[1];
  try {
    return decodeURIComponent(rawArticleId);
  } catch {
    return rawArticleId;
  }
};

interface AnalyticsData {
  pageViews: Array<{ path: string }>;
  articleViews: Array<{
    article_id: string | null;
    articles: {
      title: string;
      id: string;
      category_id: string | null;
      categories?: { id: string; name: string } | null;
    } | null;
  }>;
  linkClicks: Array<{ 
    link_url: string; 
    article_id: string | null; 
    created_at: string;
  }>;
}

interface ArticleMeta {
  title: string;
  categoryId: string | null;
  categoryName: string;
}

interface PageViewStat {
  path: string;
  displayName: string;
  count: number;
  categoryKey: string;
  categoryName: string;
}

interface ArticleViewStat {
  id: string;
  title: string;
  count: number;
  categoryId: string | null;
  categoryName: string;
  categoryKey: string;
}

export const AnalyticsTab: React.FC = () => {
  const { getAnalytics } = useAnalytics();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: [],
    articleViews: [],
    linkClicks: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('アナリティクス読み込みエラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [getAnalytics]);

  // 管理者ページを除外したページビュー
  const filteredPageViews = React.useMemo(() => {
    return analytics.pageViews.filter(view => !view.path.startsWith('/admin'));
  }, [analytics.pageViews]);

  const articleMetaMap = React.useMemo<Record<string, ArticleMeta>>(() => {
    const map: Record<string, ArticleMeta> = {};

    analytics.articleViews.forEach(view => {
      if (!view.article_id) {
        return;
      }

      const title = view.articles?.title ?? '不明な記事';
      const categoryId = view.articles?.category_id ?? null;
      const categoryName = view.articles?.categories?.name ?? UNCATEGORIZED_LABEL;

      map[view.article_id] = {
        title,
        categoryId,
        categoryName,
      };
    });

    return map;
  }, [analytics.articleViews]);

  const resolvePageDisplayName = React.useCallback((path: string) => {
    const staticPageNames: Record<string, string> = {
      '/': 'TOPページ',
      '/privacy-policy': 'プライバシーポリシー',
      '/terms-of-service': '利用規約'
    };

    if (staticPageNames[path]) {
      return staticPageNames[path];
    }

    const articleId = getArticleIdFromPath(path);
    if (articleId) {
      const meta = articleMetaMap[articleId];
      if (meta?.title) {
        return meta.title;
      }
      return `記事: ${articleId}`;
    }

    if (!path || path === '/') {
      return 'TOPページ';
    }

    return path;
  }, [articleMetaMap]);

  // ページビューの集計
  const pageViewStats = React.useMemo<PageViewStat[]>(() => {
    const statsMap: Record<string, PageViewStat> = {};

    filteredPageViews.forEach(view => {
      const normalizedPath = view.path || '/';
      const articleId = getArticleIdFromPath(normalizedPath);

      let categoryKey = STATIC_PAGE_KEY;
      let categoryName = STATIC_PAGE_LABEL;
      let displayName = resolvePageDisplayName(normalizedPath);

      if (articleId) {
        const meta = articleMetaMap[articleId];
        categoryKey = meta?.categoryId ?? UNCATEGORIZED_KEY;
        categoryName = meta?.categoryName ?? UNCATEGORIZED_LABEL;
        displayName = meta?.title ?? displayName;
      }

      if (!statsMap[normalizedPath]) {
        statsMap[normalizedPath] = {
          path: normalizedPath,
          displayName,
          count: 0,
          categoryKey,
          categoryName,
        };
      }

      statsMap[normalizedPath].count += 1;
    });

    return Object.values(statsMap).sort((a, b) => b.count - a.count);
  }, [filteredPageViews, resolvePageDisplayName, articleMetaMap]);

  // 記事ビューの集計
  const articleViewStats = React.useMemo<ArticleViewStat[]>(() => {
    const articleCounts: Record<string, ArticleViewStat> = {};

    analytics.articleViews.forEach(view => {
      if (!view.article_id) {
        return;
      }

      const meta = articleMetaMap[view.article_id];
      const title = meta?.title ?? '不明な記事';
      const categoryId = meta?.categoryId ?? null;
      const categoryName = meta?.categoryName ?? UNCATEGORIZED_LABEL;
      const categoryKey = categoryId ?? UNCATEGORIZED_KEY;

      if (!articleCounts[view.article_id]) {
        articleCounts[view.article_id] = {
          id: view.article_id,
          title,
          count: 0,
          categoryId,
          categoryName,
          categoryKey,
        };
      }

      articleCounts[view.article_id].count += 1;
    });

    return Object.values(articleCounts).sort((a, b) => b.count - a.count);
  }, [analytics.articleViews, articleMetaMap]);

  const categoryOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    articleViewStats.forEach(article => {
      map.set(article.categoryKey, article.categoryName ?? UNCATEGORIZED_LABEL);
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ja'));
  }, [articleViewStats]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      return;
    }

    const exists = categoryOptions.some(option => option.value === selectedCategory);
    if (!exists) {
      setSelectedCategory('all');
    }
  }, [categoryOptions, selectedCategory]);

  const categoryColorMap = React.useMemo(() => {
    const map: Record<string, string> = {
      [STATIC_PAGE_KEY]: STATIC_PAGE_COLOR,
    };

    categoryOptions.forEach((option, index) => {
      if (!map[option.value]) {
        map[option.value] = CATEGORY_COLOR_PALETTE[index % CATEGORY_COLOR_PALETTE.length];
      }
    });

    if (!map[UNCATEGORIZED_KEY]) {
      map[UNCATEGORIZED_KEY] = CATEGORY_COLOR_PALETTE[categoryOptions.length % CATEGORY_COLOR_PALETTE.length];
    }

    return map;
  }, [categoryOptions]);

  const getCategoryColor = React.useCallback((categoryKey?: string | null) => {
    if (categoryKey === STATIC_PAGE_KEY) {
      return STATIC_PAGE_COLOR;
    }

    const key = categoryKey ?? UNCATEGORIZED_KEY;
    return categoryColorMap[key] ?? DEFAULT_CATEGORY_COLOR;
  }, [categoryColorMap]);

  const filteredArticleViewStats = React.useMemo(() => {
    if (selectedCategory === 'all') {
      return articleViewStats;
    }

    return articleViewStats.filter(article => article.categoryKey === selectedCategory);
  }, [articleViewStats, selectedCategory]);

  const [articleCurrentPage, setArticleCurrentPage] = useState(1);
  const articlesPerPage = 20;
  const totalArticlePages = Math.max(1, Math.ceil(filteredArticleViewStats.length / articlesPerPage));

  useEffect(() => {
    setArticleCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    const maxPage = Math.max(1, totalArticlePages);
    if (articleCurrentPage > maxPage) {
      setArticleCurrentPage(maxPage);
    }
  }, [articleCurrentPage, totalArticlePages]);

  const paginatedArticleViewStats = React.useMemo(() => {
    const startIndex = (articleCurrentPage - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    return filteredArticleViewStats.slice(startIndex, endIndex);
  }, [filteredArticleViewStats, articleCurrentPage, articlesPerPage]);

  const pageViewChartData = React.useMemo(() => {
    const stats = selectedCategory === 'all'
      ? pageViewStats
      : pageViewStats.filter(stat => stat.categoryKey === selectedCategory);

    return stats
      .slice(0, 10)
      .map(stat => ({
        ...stat,
        color: getCategoryColor(stat.categoryKey),
      }));
  }, [pageViewStats, selectedCategory, getCategoryColor]);

  // リンククリック集計
  const linkClickStats = React.useMemo(() => {
    const linkCounts: Record<string, number> = {};
    analytics.linkClicks.forEach(click => {
      linkCounts[click.link_url] = (linkCounts[click.link_url] || 0) + 1;
    });
    
    return Object.entries(linkCounts)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 上位10件
  }, [analytics.linkClicks]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">アナリティクスデータを読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 概要統計 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総ページビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPageViews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総記事ビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.articleViews.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">総リンククリック</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.linkClicks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* ページビューランキング */}
      <Card>
        <CardHeader>
          <CardTitle>人気ページランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pageViewChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayName"
                  tickFormatter={(value: string) => value.length > 15 ? value.substring(0, 12) + '...' : value} // 長いパスを短縮
                  tick={{ fontSize: 11 }} // ラベルを小さく表示
                  height={50} // X軸の表示領域を確保
                  label={{ value: 'ページ名', position: 'insideBottom', offset: 0 }} // X軸ラベルを追加
                />
                <YAxis label={{ value: 'ビュー数', angle: -90, position: 'insideLeft' }} /> {/* Y軸ラベルを追加 */}
                <Tooltip
                  formatter={(value: number) => [`${value} 回`, 'ビュー数']} // ツールチップの値を「〇〇 回」と表示
                  labelFormatter={(label: string) => label} // ツールチップのラベルはタイトルのみ表示
                />
                <Bar dataKey="count" name="ページビュー数"> {/* カテゴリごとに色を付与 */}
                  {pageViewChartData.map(stat => (
                    <Cell key={stat.path} fill={stat.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 記事ビューランキング */}
      <Card>
        <CardHeader>
          <CardTitle>人気記事ランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mb-4 md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-muted-foreground">カテゴリで表示を切り替え</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table className="border-collapse [&_th:not(:last-child)]:border-r [&_td:not(:last-child)]:border-r [&_th]:border-border [&_td]:border-border">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] border-r">順位</TableHead>
                  <TableHead className="border-r">記事タイトル</TableHead>
                  <TableHead className="border-r">カテゴリ</TableHead>
                  <TableHead className="text-right w-[100px]">ビュー数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedArticleViewStats.map((article, index) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium border-r">{(articleCurrentPage - 1) * articlesPerPage + index + 1}</TableCell>
                    <TableCell className="border-r">{article.title}</TableCell>
                    <TableCell className="border-r">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: getCategoryColor(article.categoryKey) }}
                          aria-hidden="true"
                        />
                        {article.categoryName ?? UNCATEGORIZED_LABEL}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{article.count} 回</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalArticlePages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArticleCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={articleCurrentPage === 1}
              >
                前へ
              </Button>
              <span className="text-sm text-muted-foreground">
                ページ {articleCurrentPage} / {totalArticlePages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArticleCurrentPage(prev => Math.min(totalArticlePages, prev + 1))}
                disabled={articleCurrentPage === totalArticlePages}
              >
                次へ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* リンククリックランキング */}
      <Card>
        <CardHeader>
          <CardTitle>人気リンクランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {linkClickStats.map((link, index) => (
              <div key={link.url} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="text-sm truncate max-w-md" title={link.url}>
              {new URL(link.url).hostname} {/* ドメイン名を表示 */}
            </span>
                </div>
                <Badge variant="outline">{link.count} 回</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
