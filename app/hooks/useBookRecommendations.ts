import { IBookRecommendations } from '@/interfaces/recommendations';
import { getBookRecommendations } from '@/services/livros/getBookRecommendations';
import { isAxiosError } from 'axios';
import { useCallback, useState } from 'react';

export function useBookRecommendations() {
  const [recommendations, setRecommendations] =
    useState<IBookRecommendations | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getBookRecommendations(userId);

      setRecommendations(data);

      return data;
    } catch (error) {
      let message = 'Não foi possível buscar as recomendações.';

      if (isAxiosError(error)) {
        message =
          error.response?.data?.error ??
          'Não foi possível buscar as recomendações.';
      } else if (error instanceof Error) {
        message = error.message;
      }

      setError(message);

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    fetchRecommendations,
  };
}
