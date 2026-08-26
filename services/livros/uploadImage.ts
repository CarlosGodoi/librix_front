import { IBook } from '@/interfaces/books';
import { apiFront } from '../api';

export const uploadImageBook = async (
  id: string,
  image: File,
): Promise<IBook> => {
  const formData = new FormData();
  formData.append('image', image);

  const response = await apiFront.post(`/api/livros/${id}/upload`, formData);

  return response.data;
};
