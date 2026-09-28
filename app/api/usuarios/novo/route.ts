import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name, email, phone, profile, situation, password } = await req.json();

  const accessToken = req.cookies.get('token')?.value;

  try {
    const response = await api.post(
      '/register',
      {
        name,
        email,
        phone,
        profile,
        situation,
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao cadastrar usuário.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        {
          error: error.response?.data ?? 'Erro ao cadastrar usuário.',
        },
        {
          status: error.response?.status ?? 500,
        },
      );
    }

    return NextResponse.json(
      {
        error: 'Erro ao cadastrar usuário.',
      },
      {
        status: 500,
      },
    );
  }
}
