import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { EnhancedBlockEditor, Block } from '@/components/admin/EnhancedBlockEditor';
import { Article, Category, News } from '@/hooks/useArticles';

interface EditArticleModalProps {
  article: Article | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (article: Article) => void;
}

export const EditArticleModal: React.FC<EditArticleModalProps> = ({
  article,
  categories,
  isOpen,
  onClose,
  onSave,
  onChange
}) => {
  const [useBlockEditor, setUseBlockEditor] = useState(false);
  const [editorBlocks, setEditorBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (article) {
      try {
        const parsedBlocks = JSON.parse(article.content);
        if (Array.isArray(parsedBlocks)) {
          setEditorBlocks(parsedBlocks);
          setUseBlockEditor(true);
        } else {
          setUseBlockEditor(false);
        }
      } catch {
        setUseBlockEditor(false);
      }
    }
  }, [article]);

  const handleBlocksChange = (blocks: Block[]) => {
    setEditorBlocks(blocks);
    if (article) {
      onChange({ ...article, content: JSON.stringify(blocks) });
    }
  };

  if (!article) return null;

  const handleImageUpload = async (files: FileList) => {
    const file = files[0];
    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('uploads')
          .upload(fileName, file);

        if (error) {
          console.error('Upload error:', error);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(fileName);

        onChange({ ...article, thumbnail_url: publicUrl });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>記事を編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="記事タイトル"
            value={article.title}
            onChange={(e) => onChange({ ...article, title: e.target.value })}
          />
          <Input
            placeholder="記事の概要"
            value={article.excerpt || ''}
            onChange={(e) => onChange({ ...article, excerpt: e.target.value })}
          />
          
          {/* Image Upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">サムネイル画像</Label>
            <FileUpload
              onFileSelect={handleImageUpload}
              accept="image/*"
              className="mb-2"
            />
            {article.thumbnail_url && (
              <div className="mt-2">
                <img 
                  src={article.thumbnail_url} 
                  alt="Preview" 
                  className="max-w-xs h-auto rounded border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={() => onChange({ ...article, thumbnail_url: null })}
                >
                  画像を削除
                </Button>
              </div>
            )}
          </div>

          {/* Editor Toggle */}
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="use-block-editor"
              checked={useBlockEditor}
              onCheckedChange={(checked) => {
                setUseBlockEditor(checked);
                if (checked && editorBlocks.length === 0) {
                  // Initialize with current content as paragraph
                  const initialBlocks: Block[] = [{
                    id: '1',
                    type: 'paragraph',
                    content: { text: article.content },
                    order: 0
                  }];
                  setEditorBlocks(initialBlocks);
                  onChange({ ...article, content: JSON.stringify(initialBlocks) });
                } else if (!checked) {
                  // Convert blocks back to text
                  onChange({ ...article, content: article.content });
                }
              }}
            />
            <Label htmlFor="use-block-editor">ブロックエディタを使用</Label>
          </div>

          {/* Content Editor */}
          {useBlockEditor ? (
            <div>
              <Label className="text-sm font-medium mb-2 block">記事内容 (ブロックエディタ)</Label>
              <EnhancedBlockEditor
                blocks={editorBlocks}
                onChange={handleBlocksChange}
              />
            </div>
          ) : (
            <Textarea
              placeholder="記事内容"
              value={article.content}
              onChange={(e) => onChange({ ...article, content: e.target.value })}
              rows={15}
            />
          )}
          <Select 
            value={article.category_id || ''} 
            onValueChange={(value) => onChange({ ...article, category_id: value })}
          >
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
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-published"
                checked={article.published}
                onCheckedChange={(checked) => onChange({ ...article, published: checked })}
              />
              <Label htmlFor="edit-published">公開</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-featured"
                checked={article.featured}
                onCheckedChange={(checked) => onChange({ ...article, featured: checked })}
              />
              <Label htmlFor="edit-featured">注目記事</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={onSave} className="bg-ljump-green hover:bg-ljump-green-dark">
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditNewsModalProps {
  news: News | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (news: News) => void;
}

export const EditNewsModal: React.FC<EditNewsModalProps> = ({
  news,
  isOpen,
  onClose,
  onSave,
  onChange
}) => {
  if (!news) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ニュースを編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="ニュースタイトル"
            value={news.title}
            onChange={(e) => onChange({ ...news, title: e.target.value })}
          />
          <Textarea
            placeholder="ニュース内容（オプション）"
            value={news.content || ''}
            onChange={(e) => onChange({ ...news, content: e.target.value })}
            rows={8}
          />
          <div className="flex items-center space-x-2">
            <Switch
              id="edit-news-published"
              checked={news.published}
              onCheckedChange={(checked) => onChange({ ...news, published: checked })}
            />
            <Label htmlFor="edit-news-published">公開</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={onSave} className="bg-ljump-green hover:bg-ljump-green-dark">
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface EditCategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (category: Category) => void;
}

export const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  onChange
}) => {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>カテゴリを編集</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="カテゴリ名"
            value={category.name}
            onChange={(e) => onChange({ ...category, name: e.target.value })}
          />
          <Input
            placeholder="スラッグ（URL用）"
            value={category.slug}
            onChange={(e) => onChange({ ...category, slug: e.target.value })}
          />
          <Input
            placeholder="説明（オプション）"
            value={category.description || ''}
            onChange={(e) => onChange({ ...category, description: e.target.value })}
          />
          <Input
            type="number"
            placeholder="表示順序（数字が小さいほど上に表示）"
            value={category.display_order || 0}
            onChange={(e) => onChange({ ...category, display_order: parseInt(e.target.value) || 0 })}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button onClick={onSave} className="bg-ljump-green hover:bg-ljump-green-dark">
              保存
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};