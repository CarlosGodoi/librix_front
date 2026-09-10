'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeftRight, BookOpen, User, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { AvailabilityBadge } from '@/components/availability-badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUsersContext } from '@/context/userContext';
import { useLoansContext } from '@/context/loanContext';
import { useBooksContext } from '@/context/BookContext';
import { useEffect, useState } from 'react';
import { STATUS } from '@/enums/userStatus';
import { getBook } from '@/services/livros/getBookById';
import { IBook } from '@/interfaces/books';
import { Controller, useForm } from 'react-hook-form';
import {
  LoanFormInput,
  loanFormInputSchema,
} from '../novo/schema/loanFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldLabel } from '@/components/ui/field';

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export default function NewLoanForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { users } = useUsersContext();
  const { registerNewLoan, isLoading } = useLoansContext();
  const { books } = useBooksContext();

  const [selectedBook, setSelectedBook] = useState<IBook | undefined>();
  const [loadingBook, setLoadingBook] = useState(false);

  const initialBookId = params.get('bookId') ?? '';

  const form = useForm<LoanFormInput>({
    resolver: zodResolver(loanFormInputSchema),
    defaultValues: {
      bookId: initialBookId,
      userId: '',
      dueDate: defaultDueDate(),
      loanDate: new Date().toISOString().slice(0, 10),
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const bookId = watch('bookId');
  const memberId = watch('userId');

  const availableBooks = books.filter(
    (book) => book.copies > 0 || book.id === initialBookId,
  );
  const activeMembers = users.filter(
    (user) => user.situation === STATUS.ACTIVE,
  );

  const selectedBookLabel = selectedBook
    ? `${selectedBook.title} — ${selectedBook.author}`
    : undefined;

  const selectedMember = activeMembers.find((m) => m.id === memberId);

  useEffect(() => {
    if (!bookId) {
      setSelectedBook(undefined);
      return;
    }
    let cancelled = false;
    setLoadingBook(true);
    getBook(bookId)
      .then((book) => {
        if (!cancelled) setSelectedBook(book);
      })
      .catch(() => {
        if (!cancelled) setSelectedBook(undefined);
      })
      .finally(() => {
        if (!cancelled) setLoadingBook(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  async function onSubmitForm(data: LoanFormInput) {
    try {
      const newLoan = await registerNewLoan(data);
      if (newLoan) {
        toast.success('Empréstimo registrado com sucesso!');
        router.push('/emprestimos');
      }
    } catch {
      toast.error('Erro ao registrar empréstimo. Tente novamente.');
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Novo empréstimo
        </h1>
        <p className="text-sm text-muted-foreground">
          Registre a retirada de um livro por um leitor.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-5 rounded-xl border border-border bg-card p-6"
        >
          <Field className="space-y-2">
            <FieldLabel htmlFor="book" className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Livro
            </FieldLabel>
            <Controller
              name="bookId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="book">
                    <SelectValue placeholder="Selecione um livro">
                      {selectedBookLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableBooks.map((book) => (
                      <SelectItem
                        key={book.id}
                        value={book.id}
                        disabled={book.copies <= 0}
                      >
                        {book.title} — {book.author}
                        {book.copies <= 0 ? '(Indisponivel)' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field className="space-y-2">
            <FieldLabel htmlFor="member" className="flex items-center gap-2">
              <User className="size-4 text-muted-foreground" />
              Usuário
            </FieldLabel>
            <Controller
              name="userId"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="member">
                    <SelectValue placeholder="Selecione um usuário">
                      {selectedMember?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {activeMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field className="space-y-2">
            <FieldLabel htmlFor="dueDate" className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              Data de devolução
            </FieldLabel>
            <Input id="dueDate" type="date" {...register('dueDate')} />
          </Field>

          <Field className="space-y-2">
            <FieldLabel htmlFor="loanDate" className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              Data de empréstimo
            </FieldLabel>
            <Input id="loanDate" type="date" {...register('loanDate')} />
          </Field>

          <div className="flex gap-2 border-t border-border pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/emprestimos')}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 sm:flex-none">
              <ArrowLeftRight className="size-4" />
              {isLoading ? 'Registrando...' : 'Registrar empréstimo'}
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resumo
          </p>
          {selectedBook ? (
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative aspect-3/4 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={
                      typeof selectedBook.coverUrl === 'string' &&
                      selectedBook.coverUrl
                        ? selectedBook.coverUrl
                        : '/covers/placeholder.png'
                    }
                    alt={selectedBook.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-semibold leading-snug">
                    {selectedBook.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedBook.author}
                  </p>
                </div>
              </div>
              <AvailabilityBadge available={selectedBook.copies} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecione um livro para ver o resumo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
