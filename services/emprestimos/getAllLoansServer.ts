import 'server-only';

import { cookies } from 'next/headers';
import api from '@/services/api';
import { ILoans } from '@/interfaces/loans';

interface IGetAllLoansParams {
  take: number;
  skip: number;
  search?: string;
}

export interface ILoansResponse {
  users: ILoans[];
}

export async function getAllLoansServer({
  take,
  skip,
  search,
}: IGetAllLoansParams): Promise<ILoansResponse | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get('token')?.value;

  if (!accessToken) {
    throw new Error('Usuário não autenticado');
  }

  const response = await api.get('/loans', {
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
