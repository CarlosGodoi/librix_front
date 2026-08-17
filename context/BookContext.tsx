'use client';
import { IBooks } from '@/interfaces/books';
import { getAllBooks } from '@/services/livros/getAll';
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
  books: IBooks[];
  filter: BookFilter;
  isLoading: boolean;
  error: string | null;
  setFilter: React.Dispatch<React.SetStateAction<BookFilter>>;
  refreshBooks: () => Promise<void>;
}

export const IBooksContext = createContext<IBooksContext>({} as IBooksContext);

interface IProps {
  children: ReactNode;
}

export const BooksProvider: React.FC<IProps> = ({ children }) => {
  const [books, setBooks] = useState<IBooks[]>([]);
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
      const res = await getAllBooks({ take: 10, skip: 0 });

      setBooks(res.books);
    } catch (error) {
      setError('Erro ao buscar livros. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
