import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlockRenderer } from "@/components/BlockRenderer";
import { supabase } from "@/integrations/supabase/client";

export default function TermsOfService() {
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isBlockContent, setIsBlockContent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'terms_of_service')
        .single();
      
      const contentValue = data?.value || '<p>利用規約が設定されていません。</p>';
      
      // Try to parse as JSON (block editor content) first
      try {
        const parsed = JSON.parse(contentValue);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setBlocks(parsed);
          setIsBlockContent(true);
        } else {
          setContent(contentValue);
        }
      } catch {
        setContent(contentValue);
      }
    } catch (error) {
      console.error('Error fetching terms of service:', error);
      setContent('<p>利用規約の読み込みに失敗しました。</p>');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {isBlockContent ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}