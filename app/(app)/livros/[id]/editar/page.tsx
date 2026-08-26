'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BookForm from '../../novo/components/page';
import { useBooksContext } from '@/context/BookContext';
import { IBook } from '@/interfaces/books';

export default function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getBookById } = useBooksContext();
  const router = useRouter();

  const [book, setBook] = useState<IBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBook() {
      try {
        const result = await getBookById(id);
        if (active) setBook(result);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadBook();
    return () => {
      active = false;
    };
  }, [id, getBookById]);

  if (loading) {
    return (
      <p className="text-center text-sm text-muted-foreground">Carregando...</p>
    );
  }

  if (notFound || !book) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm text-muted-foreground">Livro não encontrado.</p>
        <button
          onClick={() => router.push('/livros')}
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Voltar ao acervo
        </button>
      </div>
    );
  }

  return <BookForm key={book.id} book={book} />;
}
