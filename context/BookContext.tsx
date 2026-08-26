'use client';

import { BookFormOutput } from '@/app/(app)/livros/novo/schema/bookFormSchema';
import { IBook, IUpdateBookPayload } from '@/interfaces/books';
import { getAllBooks } from '@/services/livros/getAll';
import { getBook } from '@/services/livros/getBookById';
import { registerBook } from '@/services/livros/registerBook';
import { updateBook } from '@/services/livros/updateBook';
import { uploadImageBook } from '@/services/livros/uploadImage';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface BookFilter {
  title: string;
  author: string;
  search: string;
}

interface IBooksContext {
  books: IBook[];
  filter: BookFilter;
  isLoading: boolean;
  error: string | null;
  selectedBook: IBook | undefined;
  setFilter: React.Dispatch<React.SetStateAction<BookFilter>>;
  refreshBooks: () => Promise<void>;
  createBook: (data: BookFormOutput) => Promise<IBook>;
  editBook: (id: string, data: IUpdateBookPayload) => Promise<IBook>;
  uploadImage: (bookId: string, image: File) => Promise<IBook>;
  getBookById: (id: string) => Promise<IBook>;
}

export const IBooksContext = createContext<IBooksContext>({} as IBooksContext);

interface IProps {
  children: ReactNode;
}

export const BooksProvider: React.FC<IProps> = ({ children }) => {
  const [books, setBooks] = useState<IBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<IBook>();
  const [filter, setFilter] = useState<BookFilter>({
    title: '',
    author: '',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getAllBooks({ take: 12, skip: 0 });

      setBooks(res.books);
    } catch (error) {
      setError('Erro ao buscar livros. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function createBook(data: BookFormOutput) {
    setIsLoading(true);
    setError(null);
    try {
      const created = await registerBook(data);
      setBooks((prev) => [...prev, created]);
      return created;
    } catch (error) {
      setError('Erro ao cadastrar livro.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function editBook(id: string, data: IUpdateBookPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateBook(id, data);
      setBooks((prev) => prev.map((book) => (book.id === id ? updated : book)));
      return updated;
    } catch (error) {
      setError('Erro ao editar livro.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function uploadImage(bookId: string, image: File) {
    setIsLoading(true);
    setError(null);
    try {
      await uploadImageBook(bookId, image); // ignora o retorno
      const refreshed = await getBook(bookId); // busca o livro atualizado

      setBooks((prev) =>
        prev.map((book) => (book.id === bookId ? refreshed : book)),
      );

      if (selectedBook?.id === bookId) {
        setSelectedBook(refreshed);
      }

      return refreshed;
    } catch (error) {
      setError('Erro ao enviar imagem');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function getBookById(id: string) {
    const cached = books.find((b) => b.id === id);
    if (cached) {
      setSelectedBook(cached);
      return cached;
    }
    const book = await getBook(id);
    setSelectedBook(book);
    return book;
  }

  useEffect(() => {
    void refreshBooks();
  }, [refreshBooks]);

  const visibleBooks = useMemo(() => {
    const query = filter.search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesTitle =
        !filter.title ||
        book.title.toLowerCase().includes(filter.title.toLowerCase());

      const matchesAuthor =
        !filter.author ||
        book.author.toLowerCase().includes(filter.author.toLowerCase());

      const matchesQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);

      return matchesTitle && matchesAuthor && matchesQuery;
    });
  }, [filter, books]);

  return (
    <IBooksContext.Provider
      value={{
        books: visibleBooks,
        filter,
        isLoading,
        error,
        setFilter,
        refreshBooks,
        createBook,
        editBook,
        uploadImage,
        getBookById,
        selectedBook,
      }}
    >
      {children}
    </IBooksContext.Provider>
  );
};

export function useBooksContext(): IBooksContext {
  const context = useContext(IBooksContext);

  return context;
}
