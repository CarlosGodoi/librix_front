import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const {
    title,
    author,
    isbn,
    category,
    year,
    copies,
    publisher,
    synopsis,
    coverUrl,
  } = await req.json();

  const accessToken = req.cookies.get('token')?.value;

  try {
    const response = await api.post(
      '/book/register',
      {
        title,
        author,
        isbn,
        category,
        year,
        copies,
        publisher,
        synopsis,
        coverUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao registrar livro', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao cadastrar livro.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro ao cadastrar livro.',
      },
      {
        status: 500,
      },
    );
  }
}
