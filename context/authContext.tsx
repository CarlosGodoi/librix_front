'use client';

import { ReactNode, createContext, useContext, useState } from 'react';
import { PROFILE } from '@/enums/profile';
import { useRouter } from 'next/navigation';
import { deleteCookie, setCookie } from 'cookies-next';
import { useRequest } from './apiRequestContext';

export type TUser = {
  id: string;
  name: string;
  email: string;
  profile: PROFILE;
};

type SignInData = {
  email: string;
  password: string;
};

type SignInResponse = {
  user: TUser;
};

interface IAuthContext {
  user: TUser | null;
  signIn: (data: SignInData) => Promise<{ status: boolean; message: string }>;
  signOut: VoidFunction;
  updateUserContext: ({ name, email }: { name: string; email: string }) => void;
}

interface IProps {
  children: ReactNode;
  initialUser: TUser | null;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

const AuthProvider: React.FC<IProps> = ({ children, initialUser }) => {
  const { apiRequest } = useRequest();
  const router = useRouter();
  const [user, setUser] = useState<TUser | null>(initialUser ?? null);

  async function signIn(
    data: SignInData,
  ): Promise<{ status: boolean; message: string }> {
    return apiRequest<SignInData>('post', '/api/login', { data })
      .then(({ data }) => {
        const { user } = data as unknown as SignInResponse;

        if (user) {
          setUser(user);

          setCookie('user', JSON.stringify(user), {
            path: '/',
            maxAge: 60 * 60 * 24,
            sameSite: 'strict',
          });
        }

        return { status: true, message: '' };
      })
      .catch((err) => ({
        status: false,
        message: err.response?.data.message ?? 'Erro ao autenticar.',
      }));
  }

  async function signOut() {
    await apiRequest('post', '/api/logout');

    setUser(null);
    deleteCookie('user');

    router.push('/');
  }

  const updateUserContext = ({
    name,
    email,
  }: {
    name: string;
    email: string;
  }) => {
    if (user) {
      const updatedUser = { ...user, email, name };

      setUser(updatedUser);

      setCookie('user', JSON.stringify(updatedUser), {
        path: '/',
        maxAge: 60 * 60 * 24,
        sameSite: 'strict',
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuthContext(): IAuthContext {
  return useContext(AuthContext);
}

export { AuthProvider, useAuthContext };
