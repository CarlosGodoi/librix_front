import { IBook, IRegisterBookPayload } from '@/interfaces/books';
import { apiFront } from '../api';

export const registerBook = async ({
  title,
  author,
  isbn,
  publisher,
  category,
  year,
  copies,
  synopsis,
}: IRegisterBookPayload): Promise<IBook> => {
  const response = apiFront.post('/api/livros/novo', {
    title,
    author,
    isbn,
    publisher,
    category,
    year,
    copies,
    synopsis,
  });

  return (await response).data;
};
