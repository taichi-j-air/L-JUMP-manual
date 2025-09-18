import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Type, 
  Image, 
  Video, 
  List, 
  Quote, 
  Code2,
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  ChevronRight,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'list' | 'quote' | 'code' | 'columns' | 'separator' | 'note' | 'dialogue';
  content: any;
  order: number;
}

interface EnhancedBlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export const EnhancedBlockEditor: React.FC<EnhancedBlockEditorProps> = ({ blocks, onChange }) => {
  const [collapsedBlocks, setCollapsedBlocks] = useState<string[]>([]);

  const addBlock = (type: Block['type']) => {
    const newBlock: Block = {
      id: Math.random().toString(36),
      type,
      content: getDefaultContent(type),
      order: blocks.length
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any) => {
    const updatedBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    onChange(updatedBlocks);
  };

  const deleteBlock = (id: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== id);
    onChange(updatedBlocks);
  };

  const duplicateBlock = (id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id);
    if (blockToDuplicate) {
      const newBlock: Block = {
        ...blockToDuplicate,
        id: Math.random().toString(36),
        order: blockToDuplicate.order + 0.5
      };
      const updatedBlocks = [...blocks, newBlock].sort((a, b) => a.order - b.order);
      onChange(updatedBlocks);
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === id);
    if (
      (direction === 'up' && blockIndex > 0) ||
      (direction === 'down' && blockIndex < blocks.length - 1)
    ) {
      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      onChange(newBlocks);
    }
  };

  const toggleCollapse = (id: string) => {
    setCollapsedBlocks(prev =>
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const getDefaultContent = (type: Block['type']) => {
    switch (type) {
      case 'paragraph': return { 
        text: '', 
        fontSize: '16px', 
        color: '#454545', 
        backgroundColor: 'transparent',
        bold: false,
        italic: false,
        underline: false,
        alignment: 'left'
      };
      case 'heading': return { 
        text: '', 
        level: 1, 
        design_style: 1,
        color1: '#2589d0',
        color2: '#f2f2f2',
        color3: '#333333',
        fontSize: '24px', 
        color: '#454545', 
        bold: false,
        italic: false,
        underline: false,
        alignment: 'left'
      };
      case 'image': return { url: '', alt: '', caption: '', size: 'medium' };
      case 'video': return { url: '', caption: '', borderColor: '#000000' };
      case 'list': return { items: [''], type: 'bullet' };
      case 'quote': return { text: '', author: '', backgroundColor: '#f3f4f6' };
      case 'code': return { code: '', language: 'javascript' };
      case 'columns': return { columns: [{ content: '' }, { content: '' }] };
      case 'separator': return {};
      case 'note': return {
        text: '', 
        fontSize: '16px', 
        color: '#454545', 
        bold: false,
        italic: false,
        underline: false,
        alignment: 'left'
      };
      case 'dialogue': return {
        leftIcon: '/placeholder.svg',
        rightIcon: '/placeholder.svg',
        leftName: '左の名前',
        rightName: '右の名前',
        bubbleBackgroundColor: '#f2f2f2',
        items: [
          { alignment: 'left', text: 'これは会話風の吹き出しです。' }
        ]
      };
      default: return {};
    }
  };

  const renderCollapsedPreview = (block: Block) => {
    let previewText = block.type;
    switch (block.type) {
      case 'heading':
        previewText = `見出し: ${block.content.text?.substring(0, 30)}...`;
        break;
      case 'paragraph':
        previewText = `段落: ${block.content.text?.substring(0, 30)}...`;
        break;
      case 'image':
        previewText = `画像: ${block.content.alt || block.content.url?.substring(block.content.url.lastIndexOf('/') + 1)}`;
        break;
      case 'video':
        previewText = `動画: ${block.content.url}`;
        break;
      case 'list':
        previewText = `リスト: ${block.content.items[0]?.substring(0, 20)}...`;
        break;
      case 'quote':
        previewText = `引用: ${block.content.text?.substring(0, 30)}...`;
        break;
      case 'separator':
        previewText = '区切り線';
        break;
      case 'note':
        previewText = `注意事項: ${block.content.text?.substring(0, 30)}...`;
        break;
    }
    return <p className="text-sm text-muted-foreground truncate font-mono">{previewText}</p>;
  };

  const renderBlock = (block: Block) => {
    const isCollapsed = collapsedBlocks.includes(block.id);

    return (
      <Card key={block.id} className="mb-4 group bg-white dark:bg-gray-800">
        <CardContent className={isCollapsed ? "p-0" : "p-2"}>
          <div className="flex items-start space-x-2">
            <div className={`flex flex-col items-center space-y-1 ${isCollapsed ? 'pt-1' : 'pt-2'}`}>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveBlock(block.id, 'up')}><ChevronUp className="h-4 w-4" /></Button>
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveBlock(block.id, 'down')}><ChevronDown className="h-4 w-4" /></Button>
            </div>
            
            <div className={`flex-1 ${isCollapsed ? 'py-1' : 'p-2'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 mr-2" onClick={() => toggleCollapse(block.id)}>
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {isCollapsed && renderCollapsedPreview(block)}
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => duplicateBlock(block.id)}><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteBlock(block.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {!isCollapsed && (
                <div className="mt-2">
                  {renderBlockContent(block)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTextFormatting = (block: Block) => {
    if (block.type !== 'paragraph' && block.type !== 'heading' && block.type !== 'note') return null;

    return (
      <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted rounded-lg">
        <div className="flex items-center space-x-1 border-r pr-2">
          <Button size="sm" variant={block.content.bold ? "default" : "ghost"} className="h-8 w-8 p-0" onClick={() => updateBlock(block.id, { ...block.content, bold: !block.content.bold })}><Bold className="h-3 w-3" /></Button>
          <Button size="sm" variant={block.content.italic ? "default" : "ghost"} className="h-8 w-8 p-0" onClick={() => updateBlock(block.id, { ...block.content, italic: !block.content.italic })}><Italic className="h-3 w-3" /></Button>
          <Button size="sm" variant={block.content.underline ? "default" : "ghost"} className="h-8 w-8 p-0" onClick={() => updateBlock(block.id, { ...block.content, underline: !block.content.underline })}><Underline className="h-3 w-3" /></Button>
        </div>
        
        <div className="flex items-center space-x-1 border-r pr-2">
          <Button size="sm" variant={block.content.alignment === 'left' ? "default" : "ghost"} className="h-8 w-8 p-0" onClick={() => updateBlock(block.id, { ...block.content, alignment: 'left' })}><AlignLeft className="h-3 w-3" /></Button>
          <Button size="sm" variant={block.content.alignment === 'center' ? "default" : "ghost"} className="h-8 w-8 p-0" onClick={() => updateBlock(block.id, { ...block.content, alignment: 'center' })}><AlignCenter className="h-3 w-3" /></Button>
          <Button size="sm" variant={block.content.alignment === 'right' ? "default" : "ghost"} className="h-8 w-8 p-0" onClick={() => updateBlock(block.id, { ...block.content, alignment: 'right' })}><AlignRight className="h-3 w-3" /></Button>
        </div>

        <Input type="number" placeholder="サイズ" value={parseInt(block.content.fontSize) || 16} onChange={(e) => updateBlock(block.id, { ...block.content, fontSize: `${e.target.value}px` })} className="w-20 h-8" min="8" max="72" />
        
        <div className="flex items-center space-x-1">
          <Palette className="h-3 w-3" />
          <input type="color" value={block.content.color || '#000000'} onChange={(e) => updateBlock(block.id, { ...block.content, color: e.target.value })} className="w-8 h-8 rounded border" />
        </div>

        {block.type === 'heading' && (
          <div className="flex items-center space-x-2 border-l pl-2">
            <span className="text-xs font-medium">色1:</span>
            <input type="color" value={block.content.color1 || ''} onChange={(e) => updateBlock(block.id, { ...block.content, color1: e.target.value })} className="w-7 h-7 rounded border" />
            <span className="text-xs font-medium">色2:</span>
            <input type="color" value={block.content.color2 || ''} onChange={(e) => updateBlock(block.id, { ...block.content, color2: e.target.value })} className="w-7 h-7 rounded border" />
            <span className="text-xs font-medium">色3:</span>
            <input type="color" value={block.content.color3 || ''} onChange={(e) => updateBlock(block.id, { ...block.content, color3: e.target.value })} className="w-7 h-7 rounded border" />
          </div>
        )}
      </div>
    );
  };

  const renderBlockContent = (block: Block) => {
    const textStyle = (block.type === 'paragraph' || block.type === 'heading' || block.type === 'note') ? {
      fontSize: block.content.fontSize,
      color: block.content.color,
      fontWeight: block.content.bold ? 'bold' : 'normal',
      fontStyle: block.content.italic ? 'italic' : 'normal',
      textDecoration: block.content.underline ? 'underline' : 'none',
      textAlign: block.content.alignment || 'left'
    } : {};

    switch (block.type) {
      case 'paragraph':
        return (
          <div>
            {renderTextFormatting(block)}
            <Textarea
              placeholder="段落テキストを入力..."
              value={block.content.text}
              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              rows={3}
              style={textStyle}
              data-block-id={block.id}
            />
          </div>
        );
      
      case 'heading':
        const headingStyle = {
          '--heading-color-1': block.content.color1,
          '--heading-color-2': block.content.color2,
          '--heading-color-3': block.content.color3,
        } as React.CSSProperties;

        return (
          <div className="space-y-2">
            {renderTextFormatting(block)}
            <div className="flex space-x-2">
              <Select
                value={block.content.level.toString()}
                onValueChange={(value) => updateBlock(block.id, { ...block.content, level: parseInt(value) })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="H Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={block.content.design_style?.toString() || '1'}
                onValueChange={(value) => updateBlock(block.id, { ...block.content, design_style: parseInt(value) })}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="デザインを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">デザイン 1</SelectItem>
                  <SelectItem value="2">デザイン 2</SelectItem>
                  <SelectItem value="3">デザイン 3</SelectItem>
                  <SelectItem value="4">デザイン 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              className={`heading-style-${block.content.design_style || 1}`}
              style={headingStyle}
            >
              <input
                type="text"
                placeholder="見出しテキスト"
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                className="w-full bg-transparent border-none focus:ring-0 p-0 m-0"
                style={textStyle}
              />
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <FileUpload
              onFileSelect={async (files) => {
                const file = files[0];
                if (file) {
                  const url = await uploadFile(file);
                  if (url) {
                    updateBlock(block.id, { ...block.content, url });
                  }
                }
              }}
              accept="image/*"
            />
            {block.content.url && (
              <img 
                src={block.content.url} 
                alt={block.content.alt} 
                className={`max-w-full h-auto rounded ${
                  block.content.size === 'small' ? 'w-1/4' :
                  block.content.size === 'large' ? 'w-full' : 'w-1/2'
                }`}
              />
            )}
            <div className="flex space-x-2">
              <Select
                value={block.content.size || 'medium'}
                onValueChange={(value) => updateBlock(block.id, { ...block.content, size: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="サイズ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">小</SelectItem>
                  <SelectItem value="medium">中</SelectItem>
                  <SelectItem value="large">大</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="代替テキスト"
              value={block.content.alt}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
            />
            <Input
              placeholder="キャプション"
              value={block.content.caption}
              onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
            />
          </div>
        );

      case 'separator':
        return (
          <div className="py-2">
            <hr className="border-t-2 border-gray-300" />
          </div>
        );

      case 'note':
        return (
          <div>
            {renderTextFormatting(block)}
            <div className="note-box">
              <Textarea
                placeholder="注意事項を入力..."
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                className="w-full bg-transparent focus:ring-0 border-0 p-0"
                style={textStyle}
              />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            <Select
              value={block.content.type}
              onValueChange={(value) => 
                updateBlock(block.id, { ...block.content, type: value })
              }
            >
              <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bullet">箇条書き</SelectItem>
                  <SelectItem value="numbered">番号付き</SelectItem>
                </SelectContent>
              </Select>
              {block.content.items.map((item: string, index: number) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[index] = e.target.value;
                      updateBlock(block.id, { ...block.content, items: newItems });
                    }}
                    placeholder={`項目 ${index + 1}`}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const newItems = block.content.items.filter((_: any, i: number) => i !== index);
                      updateBlock(block.id, { ...block.content, items: newItems });
                    }}
                  >
                    削除
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newItems = [...block.content.items, ''];
                  updateBlock(block.id, { ...block.content, items: newItems });
                }}
              >
                項目を追加
              </Button>
            </div>
          );
        
        case 'quote':
          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm">背景色:</span>
                <input
                  type="color"
                  value={block.content.backgroundColor || '#f3f4f6'}
                  onChange={(e) => updateBlock(block.id, { ...block.content, backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border"
                />
              </div>
              <Textarea
                placeholder="引用テキスト"
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                rows={3}
                style={{ backgroundColor: block.content.backgroundColor || '#f3f4f6' }}
              />
              <Input
                placeholder="引用元（オプション）"
                value={block.content.author}
                onChange={(e) => updateBlock(block.id, { ...block.content, author: e.target.value })}
              />
            </div>
          );
        
        case 'code':
          return (
            <div className="space-y-2">
              <Select
                value={block.content.language}
                onValueChange={(value) => 
                  updateBlock(block.id, { ...block.content, language: value })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="typescript">TypeScript</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="sql">SQL</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="コードを入力..."
                value={block.content.code}
                onChange={(e) => updateBlock(block.id, { ...block.content, code: e.target.value })}
                rows={8}
                className="font-mono"
              />
            </div>
          );
        
        case 'video':
          const convertYouTubeUrl = (url: string) => {
            // Convert YouTube URLs to embed format
            const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
            const match = url.match(youtubeRegex);
            if (match) {
              return `https://www.youtube.com/embed/${match[1]}`;
            }
            return url;
          };

          return (
            <div className="space-y-2">
              <Input
                placeholder="動画URL (YouTube対応)"
                value={block.content.url}
                onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
              />
              <div className="flex items-center space-x-2">
                <span className="text-sm">枠線色:</span>
                <input
                  type="color"
                  value={block.content.borderColor || '#000000'}
                  onChange={(e) => updateBlock(block.id, { ...block.content, borderColor: e.target.value })}
                  className="w-8 h-8 rounded border"
                />
              </div>
              {block.content.url && (
                <div className="aspect-video">
                  <iframe
                    src={convertYouTubeUrl(block.content.url)}
                    className="w-full h-full rounded-lg"
                    style={{ border: `3px solid ${block.content.borderColor || '#000000'}` }}
                    allowFullScreen
                  />
                </div>
              )}
              <Input
                placeholder="キャプション"
                value={block.content.caption}
                onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
              />
            </div>
          );
      
      case 'dialogue':
        return (
          <div className="space-y-4 p-3 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border">
            {/* --- 設定エリア --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
              {/* 左キャラクター設定 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">左キャラクター</label>
                <FileUpload
                  onFileSelect={async (files) => {
                    const file = files[0];
                    if (file) {
                      const url = await uploadFile(file);
                      if (url) {
                        updateBlock(block.id, { ...block.content, leftIcon: url });
                      }
                    }
                  }}
                  accept="image/*"
                  value={block.content.leftIcon}
                  onClear={() => updateBlock(block.id, { ...block.content, leftIcon: '' })}
                />
                <Textarea
                  placeholder="名前 (改行可)"
                  value={block.content.leftName || ''}
                  onChange={(e) => updateBlock(block.id, { ...block.content, leftName: e.target.value })}
                  className="mt-2 text-xs"
                  rows={2}
                />
              </div>
              {/* 右キャラクター設定 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">右キャラクター</label>
                <FileUpload
                  onFileSelect={async (files) => {
                    const file = files[0];
                    if (file) {
                      const url = await uploadFile(file);
                      if (url) {
                        updateBlock(block.id, { ...block.content, rightIcon: url });
                      }
                    }
                  }}
                  accept="image/*"
                  value={block.content.rightIcon}
                  onClear={() => updateBlock(block.id, { ...block.content, rightIcon: '' })}
                />
                <Textarea
                  placeholder="名前 (改行可)"
                  value={block.content.rightName || ''}
                  onChange={(e) => updateBlock(block.id, { ...block.content, rightName: e.target.value })}
                  className="mt-2 text-xs"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">吹き出し背景色:</label>
              <input
                type="color"
                value={block.content.bubbleBackgroundColor || '#f2f2f2'}
                onChange={(e) => updateBlock(block.id, { ...block.content, bubbleBackgroundColor: e.target.value })}
                className="w-8 h-8 rounded border"
              />
            </div>

            {/* --- 会話アイテムエリア --- */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">会話</label>
              {block.content.items.map((item: any, index: number) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-md border bg-white dark:bg-gray-900/50">
                  <img 
                    src={item.alignment === 'left' ? block.content.leftIcon || '/placeholder.svg' : block.content.rightIcon || '/placeholder.svg'} 
                    alt="icon preview"
                    className="w-10 h-10 rounded-full object-cover mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <Textarea 
                      placeholder="テキスト..."
                      value={item.text}
                      onChange={(e) => {
                        const newItems = [...block.content.items];
                        newItems[index] = { ...item, text: e.target.value };
                        updateBlock(block.id, { ...block.content, items: newItems });
                      }}
                      rows={3}
                      className="w-full text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 rounded-md p-0.5">
                        <Button
                          size="sm"
                          variant={item.alignment === 'left' ? 'secondary' : 'ghost'}
                          className="h-7"
                          onClick={() => {
                            const newItems = [...block.content.items];
                            newItems[index] = { ...item, alignment: 'left' };
                            updateBlock(block.id, { ...block.content, items: newItems });
                          }}
                        >
                          左
                        </Button>
                        <Button
                          size="sm"
                          variant={item.alignment === 'right' ? 'secondary' : 'ghost'}
                          className="h-7"
                          onClick={() => {
                            const newItems = [...block.content.items];
                            newItems[index] = { ...item, alignment: 'right' };
                            updateBlock(block.id, { ...block.content, items: newItems });
                          }}
                        >
                          右
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive h-7"
                        onClick={() => {
                          const newItems = block.content.items.filter((_: any, i: number) => i !== index);
                          updateBlock(block.id, { ...block.content, items: newItems });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newItems = [...block.content.items, { alignment: 'left', text: '' }];
                    updateBlock(block.id, { ...block.content, items: newItems });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> 左向きを追加
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const newItems = [...block.content.items, { alignment: 'right', text: '' }];
                    updateBlock(block.id, { ...block.content, items: newItems });
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> 右向きを追加
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown block type</div>;
    }
  };

    return (
      <div className="space-y-4">
        {/* Blocks */}
        <div className="space-y-4">
          {blocks.map(renderBlock)}
        </div>

        {/* Block Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium">ブロックを追加:</span>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => addBlock('paragraph')}>
                  <Type className="h-4 w-4 mr-1" />
                  段落
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('heading')}>
                  <Type className="h-4 w-4 mr-1" />
                  見出し
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('image')}>
                  <Image className="h-4 w-4 mr-1" />
                  画像
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('video')}>
                  <Video className="h-4 w-4 mr-1" />
                  動画
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('list')}>
                  <List className="h-4 w-4 mr-1" />
                  リスト
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('quote')}>
                  <Quote className="h-4 w-4 mr-1" />
                  引用
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('code')}>
                  <Code2 className="h-4 w-4 mr-1" />
                  コード
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('separator')}>
                  <Minus className="h-4 w-4 mr-1" />
                  区切り線
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('note')}>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  注意事項
                </Button>
                <Button size="sm" variant="outline" onClick={() => addBlock('dialogue')}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  対話
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {blocks.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">ブロックを追加して記事を作成しましょう</p>
              <Button onClick={() => addBlock('paragraph')} className="bg-ljump-green hover:bg-ljump-green-dark">
                <Plus className="h-4 w-4 mr-2" />
                最初のブロックを追加
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };