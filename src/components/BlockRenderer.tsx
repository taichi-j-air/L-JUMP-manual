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
        const headingStyle = {
          '--heading-color-1': block.content.color1,
          '--heading-color-2': block.content.color2,
          '--heading-color-3': block.content.color3,
        } as React.CSSProperties;

        return (
          <div
            key={block.id}
            className={`heading-style-${block.content.design_style || 1}`}
            style={headingStyle}
          >
            <HeadingTag style={textStyle} className="m-0 p-0 bg-transparent border-none">
              {convertURLsToLinks(block.content.text)}
            </HeadingTag>
          </div>
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

      case 'note':
        return (
          <div key={block.id} className="note-box">
            <p style={textStyle} className="whitespace-pre-wrap">
              {convertURLsToLinks(block.content.text)}
            </p>
          </div>
        );
      
      case 'dialogue':
        return (
          <div key={block.id} className="space-y-2 my-4">
            {block.content.items.map((item: any, index: number) => {
              const isRight = item.alignment === 'right';
              const iconSrc = isRight ? block.content.rightIcon : block.content.leftIcon;
              const name = isRight ? block.content.rightName : block.content.leftName;

              return (
                <div key={index} className={`flex items-start gap-3 ${isRight ? 'flex-row-reverse' : ''}`}>
                  {/* アイコンと名前 */}
                  <div className="flex-shrink-0 text-center w-12 md:w-[70px]">
                    <img
                      src={iconSrc || '/placeholder.svg'}
                      alt="icon"
                      className="w-12 h-12 md:w-[70px] md:h-[70px] rounded-full object-cover border-2 border-gray-200"
                    />
                    {name && (
                      <span className="text-[10px] text-muted-foreground mt-0 break-all whitespace-pre-wrap" style={{ lineHeight: 0.8 }}>
                        {name}
                      </span>
                    )}
                  </div>

                  {/* 吹き出し */}
                  <div className="relative w-[240px] md:w-[300px]">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: block.content.bubbleBackgroundColor || '#f2f2f2' }}
                    >
                      <p className="m-0 text-sm whitespace-pre-wrap leading-relaxed">{convertURLsToLinks(item.text)}</p>
                    </div>
                    {/* 吹き出しのしっぽ */}
                    <div
                      className="absolute top-4 w-3 h-3"
                      style={{
                        backgroundColor: block.content.bubbleBackgroundColor || '#f2f2f2',
                        transform: 'rotate(45deg)',
                        ...(isRight ? { right: '-6px' } : { left: '-6px' })
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      
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