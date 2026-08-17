import { IBook } from '@/interfaces/books';
import {
  ArrowLeftRight,
  Building2,
  Calendar,
  Hash,
  Layers,
  Pencil,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { AvailabilityBadge } from './availability-badge';
import { Button } from './ui/button';

type Props = {
  book: IBook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BookDetailModal({ book, open, onOpenChange }: Props) {
  const router = useRouter();

  if (!book) return null;

  const meta = [
    { icon: Hash, label: 'ISBN', value: book.isbn },
    { icon: Calendar, label: 'Ano', value: String(book.year) },
    { icon: Building2, label: 'Editora', value: book.publisher },
    {
      icon: Layers,
      label: 'Exemplares',
      value: `4 de ${book.copies} disponíveis`, //TODO implementar a logica quando Loan estiver pronto
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl overflow-hidden p-0">
        <div className="grid sm:grid-cols-[300px_1fr]">
          <div className="relative hidden bg-muted sm:block">
            <Image
              src={
                typeof book.coverUrl === 'string' && book.coverUrl
                  ? book.coverUrl
                  : '/images/book-placeholder.png'
              }
              alt={`Capa de ${book.title}`}
              fill
              className="object-cover"
              sizes="200px"
            />
          </div>

          <div className="flex flex-col gap-5 p-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{book.category}</Badge>
                <AvailabilityBadge available={book.copies} />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-pretty text-xl font-semibold leading-tight">
                  {book.title}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  por {book.author}
                </p>
              </div>
            </div>

            <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
              {book.synopsis}
            </p>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/40 p-4">
              {meta.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="flex items-start gap-2.5" key={item.label}>
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="truncate text-sm font-medium">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/livros/${book.id}/editar`);
                }}
              >
                <Pencil className="size-4" />
                Editar
              </Button>
              <Button
                className="flex-1"
                disabled={book.copies <= 0}
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/emprestimos/novo?book=${book.id}`);
                }}
              >
                <ArrowLeftRight className="size-4" />
                Emprestar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
