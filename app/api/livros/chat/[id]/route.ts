import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = req.cookies.get('token')?.value;
  const { id } = await params;
  const { message } = await req.json();

  try {
    const response = await api.post(
      `/chat/${id}/message`,
      { message },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao enviar mensagem para o chat.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao enviar mensagem',
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
