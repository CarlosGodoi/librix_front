import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = req.cookies.get('token')?.value;
  const { id } = await params;

  try {
    const formData = await req.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json(
        {
          error: 'Nenhum arquivo enviado.',
        },
        {
          status: 400,
        },
      );
    }

    const forwardFormData = new FormData();
    forwardFormData.append('image', image, image.name);

    const baseApi =
      process.env.NEXT_PUBLIC_BASE_API || 'http://192.168.1.2:3334';

    const response = await fetch(`${baseApi}/book/upload/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: forwardFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      return NextResponse.json(
        {
          error: errorData ?? 'Erro ao fazer upload da imagem.',
        },
        {
          status: response.status,
        },
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao fazer upload..', error);

    return NextResponse.json(
      {
        error: 'Erro ao fazer upload da imagem',
      },
      {
        status: 500,
      },
    );
  }
}
