// proxy.ts (antes era middleware.ts)
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:3334';

const PROTECTED_ROUTES = ['/livros', '/emprestimos', '/usuarios'];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(`${route}/`));
}

function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return true;
    }

    const decodedPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8'),
    );

    if (!decodedPayload.exp) {
      return true;
    }

    return decodedPayload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get('token')?.value;
  const refreshToken = req.cookies.get('refresh')?.value;

  // Rotas pública não precisam de autenticação
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  // Rota protegida sem token
  if (!token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Token ainda válido
  if (!isTokenExpired(token)) {
    return NextResponse.next();
  }

  //AccessToken expirou e não existe refreshToken
  if (!refreshToken) {
    const response = NextResponse.next();
    response.cookies.delete('token');
    response.cookies.delete('refresh');
    response.cookies.delete('user');
    return response;
  }

  try {
    const response = await axios.post(
      `${BASE_API}/refresh`,
      { refreshToken },
      { timeout: 5000 },
    );

    const { accessToken } = response.data;

    if (!accessToken) {
      throw new Error('Access token não retornado pelo servidor.');
    }

    const requestHeaders = new Headers(req.headers);

    const cookies = req.cookies
      .getAll()
      .map(({ name, value }) => {
        if (name === 'token') {
          return `${name}=${accessToken}`;
        }

        return `${name}=${value}`;
      })
      .join('; ');

    requestHeaders.set('cookie', cookies);

    const nextResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    nextResponse.cookies.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return nextResponse;
  } catch {
    const nextResponse = NextResponse.redirect(new URL('/', req.url));

    nextResponse.cookies.delete('token');
    nextResponse.cookies.delete('refresh');
    nextResponse.cookies.delete('user');

    return nextResponse;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
