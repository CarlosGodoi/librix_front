import { BooksResponse } from '@/interfaces/books';
import { apiFront } from '../api';

export const getAllBooks = async (data?: {
  take: number;
  skip: number;
  search?: string;
}): Promise<BooksResponse> => {
  try {
    const urlApi = '/api/livros';

    const params = new URLSearchParams();

    if (data?.take !== undefined) {
      params.set('take', String(data.take));
    }

    if (data?.skip !== undefined) {
      params.set('skip', String(data.skip));
    }

    if (data?.search) {
      params.set('search', data.search);
    }

    const url = `${urlApi}?${params.toString()}`;

    const res = await apiFront.get(url);

    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
