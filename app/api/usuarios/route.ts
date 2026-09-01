import api from '@/services/api';
import { NextRequest, NextResponse } from 'next/server';
import { isAxiosError } from 'axios';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const accessToken = req.cookies.get('token')?.value;

  try {
    const response = await api.get('/users', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: Object.fromEntries(searchParams.entries()),
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('erro:', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao buscar usuários.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro interno ao buscar usuários.',
      },
      {
        status: 500,
      },
    );
  }
}
