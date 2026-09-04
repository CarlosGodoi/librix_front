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
    const response = await api.delete(`/user/delete/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao excluir usuário.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao excluir usuário.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro ao processar dados.',
      },
      {
        status: 500,
      },
    );
  }
}
