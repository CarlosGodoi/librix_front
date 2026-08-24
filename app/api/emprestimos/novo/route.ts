import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { bookId, userId, dueDate, loanDate } = await req.json();
  const accessToken = req.cookies.get('token')?.value;

  try {
    const response = await api.post(
      '/loan/register',
      {
        bookId,
        userId,
        dueDate,
        loanDate,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.log('Erro ao efetuar empréstimo.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Error ao efetuar empréstimo.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro ao gerar empréstimo.',
      },
      {
        status: 500,
      },
    );
  }
}
