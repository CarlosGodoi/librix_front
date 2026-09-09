import { apiFront } from '../api';

export const deleteBook = async (id: string) => {
  const response = apiFront.delete(`/api/livros/${id}/delete`);

  return (await response).data;
};
