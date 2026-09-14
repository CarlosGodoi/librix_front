import 'server-only';

import { cookies } from 'next/headers';
import api from '@/services/api';

interface IGetLoansByUserIdParams {
  userId: string;
  take: number;
  skip: number;
  search?: string;
}

export async function getLoansByUserIdServer({
  userId,
  take,
  skip,
  search,
}: IGetLoansByUserIdParams) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  try {
    if (!accessToken) {
      throw new Error('Usuário não autenticado');
    }

    const response = await api.get(`/loans/user/${userId}`, {
      params: {
        take,
        skip,
        ...(search ? { search } : {}),
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('SERVER LOANS BY USER ERROR:', error);
    return null;
  }
}
