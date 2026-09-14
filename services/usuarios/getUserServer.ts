import 'server-only';

import { cookies } from 'next/headers';
import api from '@/services/api';
import { TUser } from '@/context/authContext';
import { isAxiosError } from 'axios';

export async function getUserServer(): Promise<TUser | null> {
  const cookieStore = await cookies();

  const userCookie = cookieStore.get('user')?.value;
  const accessToken = cookieStore.get('token')?.value;

  if (!userCookie || !accessToken) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie) as { id: string };

    if (!user.id) {
      return null;
    }

    const response = await api.get(`/user/${user.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id, name, email, profile } = response.data.user;

    return {
      id,
      name,
      email,
      profile,
    };
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      return null;
    }

    console.error('SERVER USER ERROR:', error);

    return null;
  }
}
