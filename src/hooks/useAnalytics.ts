import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

export const useAnalytics = () => {
  // ページビューを記録
  const trackPageView = useCallback(async (path: string) => {
    try {
      await supabase
        .from('page_views')
        .insert({ path });
    } catch (error) {
      console.error('ページビュー記録エラー:', error);
    }
  }, []);

  // 記事ビューを記録
  const trackArticleView = useCallback(async (articleId: string) => {
    try {
      await supabase
        .from('article_views')
        .insert({ article_id: articleId });
    } catch (error) {
      console.error('記事ビュー記録エラー:', error);
    }
  }, []);

  // リンククリックを記録
  const trackLinkClick = useCallback(async (
    linkUrl: string,
    blockId?: string,
    articleId?: string
  ) => {
    try {
      await supabase
        .from('link_clicks')
        .insert({ 
          link_url: linkUrl,
          block_id: blockId,
          article_id: articleId
        });
    } catch (error) {
      console.error('リンククリック記録エラー:', error);
    }
  }, []);

  // アナリティクスデータ取得
  const getAnalytics = useCallback(async () => {
    try {
      // ページビュー集計
      const { data: pageViews } = await supabase
        .from('page_views')
        .select('path')
        .order('created_at', { ascending: false });

      // 記事ビュー集計
      const { data: articleViews } = await supabase
        .from('article_views')
        .select(`
          article_id,
          articles!fk_article (
            title,
            id,
            category_id,
            categories:categories!articles_category_id_fkey (
              id,
              name
            )
          )
        `);

      // リンククリック集計
      const { data: linkClicks } = await supabase
        .from('link_clicks')
        .select('link_url, article_id, created_at');

      return {
        pageViews: pageViews || [],
        articleViews: articleViews || [],
        linkClicks: linkClicks || []
      };
    } catch (error) {
      console.error('アナリティクスデータ取得エラー:', error);
      return {
        pageViews: [],
        articleViews: [],
        linkClicks: []
      };
    }
  }, []);

  return {
    trackPageView,
    trackArticleView,
    trackLinkClick,
    getAnalytics
  };
};