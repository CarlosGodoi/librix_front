'use client';

import { AvailabilityBadge } from '@/components/availability-badge';
import { BookDetailModal } from '@/components/book-detail-modal';
import { BookRecommenderChat } from '@/components/book-recommender-chat';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthContext } from '@/context/authContext';
import { useBooksContext } from '@/context/BookContext';
import { PROFILE } from '@/enums/profile';
import { IBook } from '@/interfaces/books';
import { cn } from '@/lib/utils';
import { categories } from '@/utils/categories/categories';
import {
  ArrowLeftRight,
  BookOpen,
  Clock,
  Library,
  Plus,
  Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useDeferredValue, useMemo, useState } from 'react';

export default function BooksPage() {
  const [category, setCategory] = useState('todas');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<IBook | null>(null); // TODO será implementado para chamada do modal
  const [open, setOpen] = useState(false); // TODO será implementado para chamada do modal
  const { books } = useBooksContext();
  const { user } = useAuthContext();
  const deferredQuery = useDeferredValue(query);

  const FALLBACK_COVER = '/images/book-placeholder.png';

  const stats = [
    { label: 'Livros no acervo', value: books.length, icon: Library },
    {
      label: 'Exemplares disponíveis',
      value: books.reduce((s, b) => s + b.copies, 0),
      icon: BookOpen,
    },
    {
      // TODO: Vem da API rota de emprestimos ainda falta implementar
      label: 'Empréstimos ativos',
      value: 12,
      icon: ArrowLeftRight,
    },
  ];

  const filtered = useMemo(() => {
    return [...books]
      .sort((a, b) => new Date(b.year).getTime() - new Date(a.year).getTime())
      .filter((b) => {
        const normalize = (s: string) =>
          s
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const matchesQuery =
          normalize(b.title).includes(normalize(deferredQuery)) ||
          normalize(b.author).includes(normalize(deferredQuery));
        const matchesCategory = category === 'todas' || b.category === category;
        return matchesQuery && matchesCategory;
      });
  }, [books, deferredQuery, category]);

  const openBookDetails = (book: IBook) => {
    setSelected(book);
    setOpen(true);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">LibriX</h1>
          <p className="text-sm text-muted-foreground">
            Livros adicionados recentemente à biblioteca.
          </p>
        </div>
        <Link href="/livros/novo" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          Cadastrar livro
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por titulo ou autor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v ?? 'todas')}
        >
          <SelectTrigger className="sm:w-52">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {categories.map((categorie) => (
              <SelectItem key={categorie} value={categorie}>
                {categorie}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpen className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            nenhum livro encontrado com os filtros atuais.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((book) => (
            <button
              key={book.id}
              onClick={() => openBookDetails(book)}
              type="button"
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-left p-3 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
            >
              <div className="relative aspect-3/4 overflow-hidden bg-muted">
                <Image
                  src={
                    typeof book.coverUrl === 'string' && book.coverUrl
                      ? book.coverUrl
                      : FALLBACK_COVER
                  }
                  alt={`Capa de ${book.title}`}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur">
                  <Clock className="size-3" />
                  Novo
                </span>
              </div>
              <div className="space-y-0.5">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug mt-2">
                  {book.title}
                </h3>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {book.author}
                </p>
              </div>
              <div className="mt-auto pt-1">
                <AvailabilityBadge
                  className="text-[10px]"
                  available={book.copies}
                />
              </div>
            </button>
          ))}
        </div>
      )}
      <BookDetailModal book={selected} open={open} onOpenChange={setOpen} />

      {user?.profile === PROFILE.VISITOR && <BookRecommenderChat />}
    </div>
  );
}
