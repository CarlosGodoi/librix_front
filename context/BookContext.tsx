'use client';

import { BookFormOutput } from '@/app/(app)/livros/novo/schema/bookFormSchema';
import { BOOKS_PAGE_SIZE } from '@/constants/pagination';
import { BooksResponse, IBook, IUpdateBookPayload } from '@/interfaces/books';
import { deleteBook } from '@/services/livros/delete';
import { getAllBooks } from '@/services/livros/getAll';
import { getBook } from '@/services/livros/getBookById';
import { registerBook } from '@/services/livros/registerBook';
import { updateBook } from '@/services/livros/updateBook';
import { uploadImageBook } from '@/services/livros/uploadImage';

import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useContext,
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
  page: number;
  totalPages: number;
  goToPage: (page: number) => void;
  setFilter: React.Dispatch<React.SetStateAction<BookFilter>>;
  refreshBooks: () => Promise<void>;
  createBook: (data: BookFormOutput) => Promise<IBook>;
  editBook: (id: string, data: IUpdateBookPayload) => Promise<IBook>;
  uploadImage: (bookId: string, image: File) => Promise<IBook>;
  getBookById: (id: string) => Promise<IBook>;
  removeBook: (id: string) => Promise<void>;
}

export const IBooksContext = createContext<IBooksContext>({} as IBooksContext);

interface IProps {
  children: ReactNode;
  booksPromise: Promise<BooksResponse>;
}

export const BooksProvider: React.FC<IProps> = ({ children, booksPromise }) => {
  const initialData = use(booksPromise);
  const [books, setBooks] = useState<IBook[]>(initialData.books);
  const [totalPages, setTotalPages] = useState(initialData.totalPage);
  const [page, setPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState<IBook>();
  const [filter, setFilter] = useState<BookFilter>({
    title: '',
    author: '',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const skip = (targetPage - 1) * BOOKS_PAGE_SIZE;
      const res: BooksResponse = await getAllBooks({
        take: BOOKS_PAGE_SIZE,
        skip: targetPage,
      });

      setBooks(res.books);
      setTotalPages(res.totalPage);
      setPage(targetPage);
    } catch (error) {
      setError('Erro ao buscar livros. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshBooks = useCallback(() => fetchBooks(page), [fetchBooks, page]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === page) {
        return;
      }
      fetchBooks(targetPage);
    },
    [fetchBooks, totalPages, page],
  );

  async function createBook(data: BookFormOutput) {
    setIsLoading(true);
    setError(null);
    try {
      const created = await registerBook(data);
      await fetchBooks(page);

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

  async function removeBook(id: string) {
    setIsLoading(true);
    setError(null);

    try {
      await deleteBook(id);

      const isLastItemOfPage = books.length === 1 && page > 1;
      await fetchBooks(isLastItemOfPage ? page - 1 : page);
    } catch (error) {
      setError('Erro ao excluir livro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

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
        page,
        totalPages,
        goToPage,
        setFilter,
        refreshBooks,
        createBook,
        editBook,
        uploadImage,
        getBookById,
        removeBook,
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
