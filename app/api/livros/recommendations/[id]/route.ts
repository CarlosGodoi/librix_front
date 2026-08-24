import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = req.cookies.get('token')?.value;
  const { id } = await params;

  try {
    const response = await api.get(`/books/recommendations/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar recomendações', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao buscar recomendações',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro interno ao buscar recomendações.',
      },
      {
        status: 500,
      },
    );
  }
}
