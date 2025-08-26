import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

export default function PrivacyPolicy() {
  const [content, setContent] = useState("");
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
      
      setContent(data?.value || '<p>プライバシーポリシーが設定されていません。</p>');
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
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </main>
      <Footer />
    </div>
  );
}