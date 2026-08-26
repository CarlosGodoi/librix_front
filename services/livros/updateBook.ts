import { IBook, IUpdateBookPayload } from '@/interfaces/books';
import { apiFront } from '../api';

export const updateBook = async (
  id: string,
  { copies, synopsis }: IUpdateBookPayload,
): Promise<IBook> => {
  const response = apiFront.put(`/api/livros/${id}/editar`, {
    copies,
    synopsis,
  });

  return (await response).data;
};
