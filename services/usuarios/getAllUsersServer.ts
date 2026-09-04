import 'server-only';

import { cookies } from 'next/headers';
import api from '@/services/api';

interface IGetAllUsersParams {
  take: number;
  skip: number;
  search?: string;
}

export async function getAllUsersServer({
  take,
  skip,
  search,
}: IGetAllUsersParams) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('token')?.value;

  if (!accessToken) {
    throw new Error('Usuário não autenticado');
  }

  const response = await api.get('/users', {
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
}
