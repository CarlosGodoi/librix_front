import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = req.cookies.get('token')?.value;
  const { id } = await params;

  try {
    const response = await api.delete(`/book/delete/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao excluir livro.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao excluir livro.',
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
