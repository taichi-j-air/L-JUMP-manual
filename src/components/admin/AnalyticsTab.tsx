import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAnalytics } from "@/hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  pageViews: Array<{ path: string }>;
  articleViews: Array<{ 
    article_id: string; 
    articles: { title: string; id: string } | null;
  }>;
  linkClicks: Array<{ 
    link_url: string; 
    article_id: string | null; 
    created_at: string;
  }>;
}

export const AnalyticsTab: React.FC = () => {
  const { getAnalytics } = useAnalytics();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: [],
    articleViews: [],
    linkClicks: []
  });
  const [loading, setLoading] = useState(true);

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

  // ページビューの集計
  const pageViewStats = React.useMemo(() => {
    const pathCounts: Record<string, number> = {};
    analytics.pageViews.forEach(view => {
      pathCounts[view.path] = (pathCounts[view.path] || 0) + 1;
    });
    
    return Object.entries(pathCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 上位10件
  }, [analytics.pageViews]);

  // 記事ビューの集計
  const articleViewStats = React.useMemo(() => {
    const articleCounts: Record<string, { title: string; count: number }> = {};
    
    analytics.articleViews.forEach(view => {
      const title = view.articles?.title || '不明な記事';
      const key = view.article_id;
      
      if (!articleCounts[key]) {
        articleCounts[key] = { title, count: 0 };
      }
      articleCounts[key].count++;
    });
    
    return Object.entries(articleCounts)
      .map(([id, data]) => ({ id, title: data.title, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 上位10件
  }, [analytics.articleViews]);

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
            <div className="text-2xl font-bold">{analytics.pageViews.length}</div>
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
              <BarChart data={pageViewStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="path" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
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
          <div className="space-y-3">
            {articleViewStats.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium truncate">{article.title}</span>
                </div>
                <Badge variant="outline">{article.count} 回</Badge>
              </div>
            ))}
          </div>
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
                    {link.url}
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