import { useEffect, useRef, useState } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import { cn } from '@/lib/utils';
import EditorjsList from '@editorjs/list';
import Underline from '@editorjs/underline';
import Marker from '@editorjs/marker';

interface EditorProps {
  id?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function parseEditorValue(value?: string): OutputData | undefined {
  if (!value?.trim()) return undefined;
  try {
    return value.trim().startsWith('{')
      ? JSON.parse(value)
      : { blocks: [{ type: 'paragraph', data: { text: value } }] };
  } catch {
    return undefined;
  }
}

export function Editor({ id, value, onChange, placeholder, className }: EditorProps) {
  const [mounted, setMounted] = useState(false);
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EditorJS | null>(null);
  const onChangeRef = useRef(onChange);
  const isUserTyping = useRef(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always keep callback fresh
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!mounted || !holderRef.current) return;

    if (initializingRef.current || editorRef.current) return;
    initializingRef.current = true;

    let editorInstance: EditorJS | null = null;

    const initEditor = async () => {
      try {
        const EditorJS = (await import('@editorjs/editorjs')).default;

        if (!holderRef.current) return;

        editorInstance = new EditorJS({
          holder: holderRef.current,
          placeholder: placeholder ?? 'Type here...',
          data: parseEditorValue(value),
          onChange: async (api) => {
            isUserTyping.current = true;
            try {
              const content = await api.saver.save();
              onChangeRef.current(JSON.stringify(content));
            } finally {
              isUserTyping.current = false;
            }
          },
          minHeight: 0,
          onReady: () => {
            editorRef.current = editorInstance;
            initializingRef.current = false;
          },
          tools: {
            List: {
              class: EditorjsList,
              inlineToolbar: true,
              config: {
                defaultStyle: 'unordered'
              },
            },
            Underline: Underline,
            Marker: {
              class: Marker,
              shortcut: 'CMD+SHIFT+M',
            }
          }
        });
      } catch (error) {
        console.error('Failed to initialize editor:', error);
        initializingRef.current = false;
      }
    };

    initEditor();

    return () => {
      initializingRef.current = false;
      const instance = editorRef.current || editorInstance;
      editorRef.current = null;
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    };
  }, [mounted]); // eslint-disable-line react-hooks/exhaustive-deps

  const prevValueRef = useRef(value);

  // External value sync — only when NOT triggered by user typing
  useEffect(() => {
    if (
      editorRef.current &&
      !isUserTyping.current &&
      value !== prevValueRef.current &&
      value?.trim()
    ) {
      const parsed = parseEditorValue(value);
      if (parsed) {
        editorRef.current.render(parsed);
      }
    }
    prevValueRef.current = value;
  }, [value]);

  console.log('editor rendred!');

  return (
    <div
      className={cn(
        'min-h-[120px] w-full border-y border-input bg-muted px-3 py-2 text-base  focus-within:outline-none focus-within:ring-1 focus-within:ring-muted-foreground/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-within:bg-background',
        className,
      )}
    >
      <div id={id} ref={holderRef} className="prose-editor" />
    </div>
  );
}