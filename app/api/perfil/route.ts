import api from '@/services/api';
import { isAxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  let userId: string;
  try {
    const decoded = jwtDecode<TokenPayload>(accessToken);
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
  }

  try {
    const response = await api.get(`/user/${userId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Erro ao buscar os dados.', error);

    if (isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data ?? 'Erro ao buscar os dados.' },
        { status: error.response?.status ?? 500 },
      );
    }

    return NextResponse.json(
      { error: 'Erro ao buscar dados.' },
      { status: 500 },
    );
  }
}
