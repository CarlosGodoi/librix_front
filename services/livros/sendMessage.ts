import { apiFront } from '../api';

export interface IChatBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  category: string;
  year: number;
  copies: number;
  synopsis: string;
  coverUrl: string;
}

export interface IChatResponse {
  message: string;
  books: IChatBook[];
}

export async function sendChatMessage(
  userId: string,
  message: string,
): Promise<IChatResponse> {
  const response = await apiFront.post<{ reply: string; books?: IChatBook[] }>(
    `/api/livros/chat/${userId}`,
    {
      message,
    },
  );

  return {
    message: response.data.reply,
    books: response.data.books ?? [],
  };
}
