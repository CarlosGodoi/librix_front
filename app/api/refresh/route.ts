import api from '@/services/api';
import { isAxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get('refresh')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Sem refresh token' }, { status: 401 });
  }

  try {
    const response = await api.post('/refresh', { refreshToken });
    const { accessToken } = response.data;

    const result = NextResponse.json({ ok: true }, { status: 200 });

    result.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return result;
  } catch (error) {
    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: 'Falha ao renovar sessão' },
        { status: error.response?.status ?? 401 },
      );
    }
    return NextResponse.json({ error: 'Erro inesperado' }, { status: 500 });
  }
}
