'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Sparkles, X, ArrowUp, Square, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLibrary } from '@/components/library-store';
import { useBooksContext } from '@/context/BookContext';

const SUGGESTIONS = [
  'O que combina com quem leu ficção recentemente?',
  'Recomende uma leitura de tecnologia',
  'Sugira um livro para quem gostou de história',
];

interface ISuggestions {
  baseadoEm: string[];
  sugestoes: [
    {
      id: string;
      title: string;
      author: string;
      isbn: string;
      publisher: string;
      category: string;
      year: Date;
      copies: number;
      synopsis: string;
      coverUrl: string;
    },
  ];
  explicacao: string;
}

type ChatProps = {
  messages: string;
  sendMessage: (text: string) => ISuggestions;
  status: string;
  stop: () => void;
  error: string;
};

export function BookRecommenderChat() {
  const { loans, getBook, getMember } = useLibrary();
  const { books } = useBooksContext();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Monta o contexto do acervo e dos empréstimos mais recentes
  const catalog = useMemo(
    () =>
      books.map((b) => ({
        title: b.title,
        author: b.author,
        category: b.category,
        year: b.year,
        available: b.copies,
        synopsis: b.synopsis,
      })),
    [books],
  );

  const recentLoans = useMemo(
    () =>
      [...loans]
        .sort((a, b) => b.loanDate.localeCompare(a.loanDate))
        .slice(0, 8)
        .map((l) => {
          const book = getBook(l.bookId);
          const member = getMember(l.memberId);
          return {
            title: book?.title ?? 'Livro removido',
            author: book?.author ?? '—',
            category: book?.category ?? '—',
            reader: member?.name ?? 'Leitor',
            loanDate: l.loanDate,
          };
        }),
    [loans, getBook, getMember],
  );

  const { messages, sendMessage, status, stop, error }: ChatProps = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function submit(text: string) {
    const value = text.trim();
    if (!value || isBusy) return;
    sendMessage({ text: value }, { body: { catalog, recentLoans } });
    setInput('');
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          open
            ? 'Fechar assistente de recomendações'
            : 'Abrir assistente de recomendações'
        }
        className={cn(
          'fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95',
        )}
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {/* Painel do chat */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0',
        )}
        style={{ height: 'min(32rem, calc(100vh - 8rem))' }}
        role="dialog"
        aria-label="Assistente de recomendação de livros"
      >
        {/* Cabeçalho */}
        <header className="flex items-center gap-3 border-b border-border bg-accent/40 px-4 py-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Íris</p>
            <p className="truncate text-xs text-muted-foreground">
              Recomendações do acervo
            </p>
          </div>
        </header>

        {/* Mensagens */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-3 pt-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="size-6" />
              </div>
              <p className="text-pretty text-sm text-muted-foreground">
                Olá! Sou a Íris. Posso sugerir leituras com base nos empréstimos
                recentes e no acervo disponível.
              </p>
              <div className="mt-2 flex w-full flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : 'rounded-bl-sm bg-secondary text-secondary-foreground',
                )}
              >
                {message.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={`${message.id}-${i}`}>{part.text}</span>
                  ) : null,
                )}
              </div>
            </div>
          ))}

          {status === 'submitted' && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3 py-3">
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
              Não consegui gerar uma recomendação agora. Verifique a
              configuração do provedor de IA e tente novamente.
            </div>
          )}
        </div>

        {/* Entrada */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="border-t border-border bg-card p-3"
        >
          <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:border-ring">
            <textarea
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder="Pergunte por uma recomendação..."
              className="max-h-24 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            {isBusy ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-8 shrink-0 rounded-lg"
                onClick={() => stop()}
                aria-label="Parar resposta"
              >
                <Square className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="size-8 shrink-0 rounded-lg"
                disabled={!input.trim()}
                aria-label="Enviar mensagem"
              >
                <ArrowUp className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
