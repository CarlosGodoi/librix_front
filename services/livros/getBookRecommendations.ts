import { IBookRecommendations } from '@/interfaces/recommendations';
import { apiFront } from '../api';

export const getBookRecommendations = async (
  userId: string,
): Promise<IBookRecommendations> => {
  const response = await apiFront.get<IBookRecommendations>(
    `/api/livros/recommendations/${userId}`,
  );

  return response.data;
};
