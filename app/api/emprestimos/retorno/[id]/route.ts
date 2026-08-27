import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = req.cookies.get('token')?.value;
  const { id } = await params;

  try {
    const response = await api.patch(
      `/loan/return/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao devolver livro.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao devolver o livro.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro ao processar mensagem.',
      },
      {
        status: 500,
      },
    );
  }
}
