'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { PROFILE } from '@/enums/profile';
import { useRouter } from 'next/navigation';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { useRequest } from './apiRequestContext';

export type TUser = {
  id: string;
  name: string;
  email: string;
  profile: PROFILE;
};

interface IPropsSignin {
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
  user?: TUser;
}

interface IAuthContext {
  user: TUser | null;
  isLoading: boolean;
  signIn: (data: IPropsSignin) => Promise<{ status: boolean; message: string }>;
  signOut: VoidFunction;
  updateUserContext: ({ name, email }: { name: string; email: string }) => void;
}

interface IProps {
  children: ReactNode;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

const AuthProvider: React.FC<IProps> = ({ children }) => {
  const { apiRequest } = useRequest();
  const router = useRouter();
  const [user, setUser] = useState<TUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function signIn(
    data: IPropsSignin,
  ): Promise<{ status: boolean; message: string }> {
    return apiRequest('post', '/api/login', { data })
      .then(({ data }) => {
        const { user } = data;

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

  useEffect(() => {
    try {
      const userCookie = getCookie('user');
      if (userCookie) {
        const parseUser = JSON.parse(userCookie.toString()) as TUser;
        setUser(parseUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('AUTH: erro ao recuperar usuário:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, signIn, signOut, updateUserContext }}
    >
      {children}
    </AuthContext.Provider>
  );
};

function useAuthContext(): IAuthContext {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuthContext };
