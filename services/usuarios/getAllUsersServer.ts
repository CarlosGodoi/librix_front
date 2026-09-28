import 'server-only';

import { cookies } from 'next/headers';
import api from '@/services/api';
import { IUser } from '@/interfaces/users';

interface IGetAllUsersParams {
  take: number;
  skip: number;
  search?: string;
}

export interface IUsersResponse {
  users: IUser[];
}

export async function getAllUsersServer({
  take,
  skip,
  search,
}: IGetAllUsersParams): Promise<IUsersResponse | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('token')?.value;

  try {
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
  } catch (error) {
    console.error('SERVER USER ERROR:', error);
    console.log('Sessão inválida ou expirada.');
    return null;
  }
}
