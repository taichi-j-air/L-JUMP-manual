import React from 'react';
import { Block } from '@/components/admin/EnhancedBlockEditor';

interface BlockRendererProps {
  blocks: Block[];
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
  const convertURLsToLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ljump-green hover:text-ljump-green-dark underline"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const renderBlock = (block: Block) => {
    const textStyle = (block.type === 'paragraph' || block.type === 'heading') ? {
      fontSize: block.content.fontSize || '16px',
      color: block.content.color || '#000000',
      backgroundColor: block.content.backgroundColor === 'transparent' ? 'transparent' : block.content.backgroundColor || 'transparent',
      fontWeight: block.content.bold ? 'bold' : 'normal',
      fontStyle: block.content.italic ? 'italic' : 'normal',
      textDecoration: block.content.underline ? 'underline' : 'none',
      textAlign: block.content.alignment || 'left'
    } : {};

    switch (block.type) {
      case 'paragraph':
        return (
          <p 
            key={block.id} 
            style={textStyle}
            className="mb-4 whitespace-pre-wrap"
          >
            {convertURLsToLinks(block.content.text)}
          </p>
        );
      
      case 'heading':
        const HeadingTag = `h${block.content.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag 
            key={block.id} 
            style={textStyle}
            className={`mb-4 font-semibold ${
              block.content.level === 1 ? 'text-3xl' :
              block.content.level === 2 ? 'text-2xl' :
              block.content.level === 3 ? 'text-xl' :
              'text-lg'
            }`}
          >
            {convertURLsToLinks(block.content.text)}
          </HeadingTag>
        );
      
      case 'image':
        return (
          <div key={block.id} className="mb-4">
            <img 
              src={block.content.url} 
              alt={block.content.alt || ''} 
              className={`max-w-full h-auto rounded-lg ${
                block.content.size === 'small' ? 'w-1/4' :
                block.content.size === 'large' ? 'w-full' : 'w-1/2'
              }`}
            />
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2 italic text-center">
                {block.content.caption}
              </p>
            )}
          </div>
        );
      
      case 'list':
        const ListTag = block.content.type === 'numbered' ? 'ol' : 'ul';
        return (
          <ListTag key={block.id} className={`mb-4 ${block.content.type === 'numbered' ? 'list-decimal' : 'list-disc'} list-inside space-y-1`}>
            {block.content.items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ListTag>
        );
      
      case 'quote':
        return (
          <blockquote 
            key={block.id} 
            className="mb-4 p-4 border-l-4 border-ljump-green rounded-r-lg"
            style={{ backgroundColor: block.content.backgroundColor || '#f3f4f6' }}
          >
            <p className="italic mb-2">{block.content.text}</p>
            {block.content.author && (
              <cite className="text-sm text-muted-foreground">— {block.content.author}</cite>
            )}
          </blockquote>
        );
      
      case 'code':
        return (
          <div key={block.id} className="mb-4">
            <div className="bg-muted px-3 py-1 text-xs text-muted-foreground rounded-t-lg border-b">
              {block.content.language}
            </div>
            <pre className="bg-card border border-t-0 rounded-b-lg p-4 overflow-x-auto">
              <code className="text-sm font-mono">{block.content.code}</code>
            </pre>
          </div>
        );
      
      case 'video':
        const convertToEmbedUrl = (url: string) => {
          // Convert YouTube URLs to embed format
          const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
          const match = url.match(youtubeRegex);
          if (match) {
            return `https://www.youtube.com/embed/${match[1]}`;
          }
          return url;
        };

        return (
          <div key={block.id} className="mb-4">
            <div className="aspect-video">
              <iframe
                src={convertToEmbedUrl(block.content.url)}
                className="w-full h-full rounded-lg"
                style={{ border: `3px solid ${block.content.borderColor || '#000000'}` }}
                allowFullScreen
              />
            </div>
            {block.content.caption && (
              <p className="text-sm text-muted-foreground mt-2 italic text-center">
                {block.content.caption}
              </p>
            )}
          </div>
        );

      case 'separator':
        return <hr key={block.id} className="my-6 border-gray-300" />;
      
      default:
        return null;
    }
  };

  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map(renderBlock)}
    </div>
  );
};