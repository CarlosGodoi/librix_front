'use client';

import { useRef, useState, useEffect } from 'react';
import { Sparkles, X, ArrowUp, Square, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/authContext';
import { useBookRecommendations } from '@/app/hooks/useBookRecommendations';
import { useBookChat } from '@/app/hooks/useBookChat';
import { IChatBook } from '@/services/livros/sendMessage';

const SUGGESTIONS = [
  'Me recomende alguns livros',
  'Quero descobrir uma nova leitura',
  'Sugira livros com base nas minhas últimas leituras',
];

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  books?: IChatBook[];
};

export function BookRecommenderChat() {
  const { user } = useAuthContext();

  const {
    sendMessage: sendChatMessage,
    isLoading: isChatLoading,
    error: chatError,
  } = useBookChat();

  const {
    recommendations,
    isLoading: isRecommendationLoading,
    error: recommendationError,
    fetchRecommendations,
  } = useBookRecommendations();

  const [open, setOpen] = useState(false);

  const [input, setInput] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  /*
   * Faz o chat acompanhar automaticamente
   * a última mensagem/conteúdo.
   */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, recommendations, isRecommendationLoading, open]);

  /*
   * Adiciona uma mensagem ao histórico.
   */
  function addMessage(
    role: ChatMessage['role'],
    content: string,
    books?: IChatBook[],
  ) {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role,
        content,
        books,
      },
    ]);
  }

  /*
   * Envia a mensagem do usuário e dispara
   * a recomendação.
   */
  async function submit(text: string) {
    const value = text.trim();

    if (!value || isBusy) return;

    if (!user?.id) {
      addMessage('assistant', 'Não consegui identificar o usuário atual.');

      return;
    }

    // mensagem do usuário
    addMessage('user', value);
    // limpa input
    setInput('');

    const isHistoryRequest =
      value === 'Sugira livros com base nas minhas últimas leituras';

    if (isHistoryRequest) {
      try {
        await fetchRecommendations(user.id);
      } catch (error) {
        console.error('ERRO NAS RECOMENDAÇÕES:', error);
        addMessage(
          'assistant',
          'Desculpe, não consegui gerar recomendações agora.',
        );
      }
      return;
    }

    try {
      const response = await sendChatMessage(user.id, value);
      // resposta da IA
      addMessage('assistant', response.message, response.books);

      console.log('RESPOSTA DO CHAT:', response);
    } catch (error) {
      console.error('ERRO NO CHAT:', error);
      chatError;
      addMessage(
        'assistant',
        'Desculpe, não consegui processar sua solicitação agora.',
      );
    }
  }

  const isBusy = isRecommendationLoading || isChatLoading;

  return (
    <>
      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          open
            ? 'Fechar assistente de recomendações'
            : 'Abrir assistente de recomendações'
        }
        className={cn(
          'fixed bottom-3 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 sm:bottom-1 sm:right-6',
          open ? 'size-12 sm:size-14' : 'h-12 px-4 sm:h-14 sm:px-5',
        )}
      >
        {open ? (
          <X className="size-5 sm:size-6" />
        ) : (
          <>
            <Sparkles className="size-5 shrink-0 sm:size-6" />
            <span className="text-sm font-medium whitespace-nowrap">
              Recomendações
            </span>
          </>
        )}
      </button>

      {/* Painel */}
      <div
        className={cn(
          'fixed bottom-24 right-6 z-50 flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all duration-200',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-4 opacity-0',
        )}
        style={{
          height: 'min(32rem, calc(100vh - 8rem))',
        }}
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
          {/* Estado inicial */}
          {messages.length === 0 && !recommendations && (
            <div className="flex flex-col items-center gap-3 pt-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <BookOpen className="size-6" />
              </div>

              <p className="text-pretty text-sm text-muted-foreground">
                Olá! Sou a Íris. Posso sugerir leituras com base nos seus
                empréstimos recentes e no acervo disponível.
              </p>

              <div className="mt-2 flex w-full flex-col gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submit(suggestion)}
                    disabled={isBusy}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Histórico de mensagens */}
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
                {message.content}
              </div>
            </div>
          ))}

          {/* Loading */}
          {isRecommendationLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-secondary px-3 py-3">
                <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />

                <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />

                <span className="size-2 animate-bounce rounded-full bg-muted-foreground/60" />
              </div>
            </div>
          )}

          {/* Erro */}
          {recommendationError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
              Não consegui gerar uma recomendação agora. Tente novamente.
            </div>
          )}

          {/* Recomendações */}
          {recommendations && (
            <div className="flex justify-start">
              <div className="w-full max-w-[92%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                <p className="text-sm font-semibold text-secondary-foreground">
                  Sugestões para você
                </p>

                {/* Baseado em */}
                {recommendations.baseadoEm.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Baseado nas suas últimas leituras:
                    </p>

                    <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                      {recommendations.baseadoEm.map((book) => (
                        <li key={book}>{book}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Livros */}
                <div className="mt-4 space-y-3">
                  {recommendations.sugestoes.map((book) => (
                    <div
                      key={book.id}
                      className="rounded-xl border border-border bg-background p-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {book.title}
                      </p>

                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {book.author}
                      </p>

                      {book.category && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {book.category}
                        </p>
                      )}

                      {book.synopsis && (
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                          {book.synopsis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Explicação */}
                {recommendations.explicacao && (
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs font-medium text-foreground">
                      Por que essas sugestões?
                    </p>

                    <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                      {recommendations.explicacao}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Entrada */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit(input);
          }}
          className="border-t border-border bg-card p-3"
        >
          <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:border-ring">
            <textarea
              value={input}
              onChange={(event) => setInput(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing &&
                  event.keyCode !== 229
                ) {
                  event.preventDefault();
                  submit(input);
                }
              }}
              rows={1}
              placeholder="Pergunte por uma recomendação..."
              disabled={isBusy}
              className="max-h-24 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />

            {isBusy ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="size-8 shrink-0 rounded-lg"
                disabled
                aria-label="Buscando recomendações"
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
