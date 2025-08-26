import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BlockRenderer } from "@/components/BlockRenderer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [isBlockContent, setIsBlockContent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrivacyPolicy();
  }, []);

  const fetchPrivacyPolicy = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'privacy_policy')
        .single();
      
      const contentValue = data?.value || '<p>プライバシーポリシーが設定されていません。</p>';
      
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
      console.error('Error fetching privacy policy:', error);
      setContent('<p>プライバシーポリシーの読み込みに失敗しました。</p>');
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
        <div className="mb-6">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            戻る
          </Button>
        </div>
        
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
        
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