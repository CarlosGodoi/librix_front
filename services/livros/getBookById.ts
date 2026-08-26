import { apiFront } from '../api';

export const getBook = async (id: string) => {
  try {
    const response = await apiFront.get(`/api/livros/${id}`);

    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};
