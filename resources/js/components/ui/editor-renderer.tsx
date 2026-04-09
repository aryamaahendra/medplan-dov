import React, { ElementType } from 'react';
import { cn } from '@/lib/utils';

interface ListItem {
  content: string;
  items: ListItem[];
  meta?: Record<string, any>;
}

interface EditorBlock {
  type: string;
  data: {
    text?: string;
    level?: number;
    items?: (string | ListItem)[];
    style?: 'ordered' | 'unordered';
    [key: string]: any;
  };
}

interface EditorData {
  blocks: EditorBlock[];
}

interface EditorRendererProps {
  value?: string | null;
  className?: string;
}

export function EditorRenderer({ value, className }: EditorRendererProps) {
  if (!value) return null;

  let data: EditorData;


  try {
    if (value.trim().startsWith('{')) {
      data = JSON.parse(value);
    } else {
      data = {
        blocks: [
          {
            type: 'paragraph',
            data: { text: value },
          },
        ],
      };
    }
  } catch (e) {
    return (
      <p className={cn('text-sm leading-relaxed whitespace-pre-wrap', className)}>
        {value}
      </p>
    );
  }

  if (!data?.blocks || data.blocks.length === 0) return null;

  return (
    <div className={cn('space-y-4 prose-editor', className)}>
      {data.blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p
                key={index}
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );

          case 'header': {
            const Tag = `h${block.data.level || 2}` as ElementType;
            return (
              <Tag
                key={index}
                className={cn(
                  'font-bold tracking-tight',
                  block.data.level === 1 && 'text-2xl',
                  block.data.level === 2 && 'text-xl',
                  block.data.level === 3 && 'text-lg',
                  block.data.level === 4 && 'text-base',
                )}
                dangerouslySetInnerHTML={{ __html: block.data.text || '' }}
              />
            );
          }

          case 'list':
          case 'List': {
            return (
              <RenderList
                key={index}
                items={block.data.items || []}
                style={block.data.style}
              />
            );
          }

          default:
            console.warn(`Unknown block type: ${block.type}`, block);
            return null;
        }
      })}
    </div>
  );
}
function RenderList({
  items,
  style,
  className,
}: {
  items: (string | ListItem)[];
  style?: 'ordered' | 'unordered';
  className?: string;
}) {
  const ListTag = (style === 'ordered' ? 'ol' : 'ul') as ElementType;

  return (
    <ListTag
      className={cn(
        'ml-6 space-y-1',
        style === 'ordered' ? 'list-decimal' : 'list-disc',
        className,
      )}
    >
      {items.map((item, i) => {
        const isString = typeof item === 'string';
        const content = isString ? item : item.content;
        const nestedItems = isString ? [] : item.items;

        return (
          <li key={i} className="text-sm leading-relaxed">
            <span dangerouslySetInnerHTML={{ __html: content }} />
            {nestedItems && nestedItems.length > 0 && (
              <RenderList items={nestedItems} style={style} className="mt-1" />
            )}
          </li>
        );
      })}
    </ListTag>
  );
}
