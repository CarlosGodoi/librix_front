import { NextResponse } from 'next/server';

export async function POST() {
  const result = NextResponse.json({ ok: true }, { status: 200 });

  result.cookies.delete('token');
  result.cookies.delete('refresh');
  result.cookies.delete('usuario');

  return result;
}
