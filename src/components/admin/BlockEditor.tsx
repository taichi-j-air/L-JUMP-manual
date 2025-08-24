import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/ui/file-upload';
import { 
  Plus, 
  Type, 
  Image, 
  Video, 
  List, 
  Quote, 
  Code2, 
  Columns,
  GripVertical,
  Trash2,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'video' | 'list' | 'quote' | 'code' | 'columns';
  content: any;
  order: number;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [selectedBlockType, setSelectedBlockType] = useState<Block['type']>('paragraph');

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

  const getDefaultContent = (type: Block['type']) => {
    switch (type) {
      case 'paragraph': return { text: '' };
      case 'heading': return { text: '', level: 1 };
      case 'image': return { url: '', alt: '', caption: '' };
      case 'video': return { url: '', caption: '' };
      case 'list': return { items: [''], type: 'bullet' };
      case 'quote': return { text: '', author: '' };
      case 'code': return { code: '', language: 'javascript' };
      case 'columns': return { columns: [{ content: '' }, { content: '' }] };
      default: return {};
    }
  };

  const renderBlock = (block: Block) => {
    return (
      <Card key={block.id} className="mb-4 group">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => moveBlock(block.id, 'up')}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => moveBlock(block.id, 'down')}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex-1">
              {renderBlockContent(block)}
            </div>
            
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => duplicateBlock(block.id)}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case 'paragraph':
        return (
          <Textarea
            placeholder="段落テキストを入力..."
            value={block.content.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            rows={3}
          />
        );
      
      case 'heading':
        return (
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Select
                value={block.content.level.toString()}
                onValueChange={(value) => 
                  updateBlock(block.id, { ...block.content, level: parseInt(value) })
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                  <SelectItem value="4">H4</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="見出しテキスト"
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>
        );
      
      case 'image':
        return (
          <div className="space-y-2">
            <FileUpload
              onFileSelect={(files) => {
                const file = files[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  updateBlock(block.id, { ...block.content, url });
                }
              }}
              accept="image/*"
            />
            {block.content.url && (
              <img src={block.content.url} alt={block.content.alt} className="max-w-full h-auto rounded" />
            )}
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
            <Textarea
              placeholder="引用テキスト"
              value={block.content.text}
              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              rows={3}
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
      
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div className="space-y-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocks */}
      <div className="space-y-4">
        {blocks.map(renderBlock)}
      </div>

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