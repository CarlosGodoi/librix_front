import { useCallback, useState } from 'react';
import { isAxiosError } from 'axios';
import { sendChatMessage } from '@/services/livros/sendMessage';

export function useBookChat() {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userId: string, message: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await sendChatMessage(userId, message);

      return response;
    } catch (error) {
      let messageError = 'Não foi possível processar sua mensagem.';

      if (isAxiosError(error)) {
        messageError = error.response?.data?.error ?? messageError;
      } else if (error instanceof Error) {
        messageError = error.message;
      }

      setError(messageError);

      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
}
