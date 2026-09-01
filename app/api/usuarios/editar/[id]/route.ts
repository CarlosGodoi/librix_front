import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = req.cookies.get('token')?.value;
  const { id } = await params;
  const { name, email, phone, profile, situation } = await req.json();

  try {
    const response = await api.put(
      `/user/update/${id}`,
      { name, email, phone, profile, situation },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao atualizar os dados.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao atualizar os dados.',
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
