import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const response = await api.post('/auth', { email, password });

    const { accessToken, refreshToken, user } = response.data;

    const result = NextResponse.json({ user }, { status: 200 });

    result.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    result.cookies.set('refresh', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // cookie de usuário pode continuar legível pelo JS, já que não é sensível
    result.cookies.set('user', JSON.stringify(user), {
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return result;
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.error ?? 'Erro ao autenticar' },
        { status: error.response?.status ?? 500 },
      );
    }
    return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 });
  }
}
