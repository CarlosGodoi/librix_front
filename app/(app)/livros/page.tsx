'use client';

import { getAllBooks } from '@/services/livros/getAll';
import { useEffect } from 'react';

export default function BooksPage() {
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await getAllBooks({
          take: 10,
          skip: 0,
        });

        console.log('RETORNO:', res);
      } catch (error) {
        console.error('ERRO:', error);
      }
    };

    fetchBooks();
  }, []);

  return <div>Livros</div>;
}
