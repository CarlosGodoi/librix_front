'use client';

import {
  IUser,
  UserCreatePayload,
  UserUpdateFormPayload,
} from '@/interfaces/users';
import { getUser } from '@/services/profile/getUserById';
import { deleteUser } from '@/services/usuarios/delete';
import { getAllUsers } from '@/services/usuarios/getAll';
import { registerUser } from '@/services/usuarios/registerUser';
import { updateUser } from '@/services/usuarios/updateUser';
import React, {
  createContext,
  ReactNode,
  use,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

interface UserFilter {
  name: string;
  search: string;
}

interface IUsersContext {
  users: IUser[];
  user: IUser;
  filter: UserFilter;
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<UserFilter>>;
  createUser: (data: UserCreatePayload) => Promise<IUser>;
  getUserById: () => Promise<IUser>;
  editUser: (id: string, data: UserUpdateFormPayload) => Promise<IUser>;
  removeUser: (id: string) => Promise<void>;
}

export const IUsersContext = createContext<IUsersContext>({} as IUsersContext);
interface IProps {
  children: ReactNode;
  usersPromise: Promise<{ users: IUser[] }>;
}

// Fica fora do componente: garante que a Promise só é criada uma vez,
// não a cada render. Se preferir escopar por instância do provider,
// dá pra usar useMemo/useState(() => ...) dentro do componente também.
function UsersProvider({ children, usersPromise }: IProps) {
  const initialData = use(usersPromise);
  const [users, setUsers] = useState<IUser[]>(initialData.users);
  const [user, setUser] = useState<IUser>({} as IUser);
  const [filter, setFilter] = useState<UserFilter>({ name: '', search: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = useCallback(async (data: UserCreatePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await registerUser(data);
      setUsers((prev) => [...prev, created]);
      return created;
    } catch (error) {
      setError('Erro ao cadastrar usuário.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUser();
      setUser(result);
      return result;
    } catch (error) {
      setError('Erro ao buscar dados do usuário.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editUser = useCallback(
    async (id: string, data: UserUpdateFormPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const updated = await updateUser(id, data);
        setUsers((prev) =>
          prev.map((user) => (user.id === id ? updated : user)),
        );
        return updated;
      } catch (error) {
        setError('Erro ao editar dados do usuário.');
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const removeUser = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (error) {
      setError('Erro ao remover usuário.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Continua existindo para refetch manual (ex: botão "atualizar",
  // ou após alguma ação externa) — isso não é fetch de montagem,
  // então useCallback + chamada explícita continua correto.
  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAllUsers({ take: 10, skip: 0 });
      setUsers(response.users);
    } catch (error) {
      setError('Erro ao buscar usuários.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const visibleUsers = useMemo(() => {
    const query = filter.search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesName =
        !filter.name ||
        user.name.toLowerCase().includes(filter.name.toLowerCase());
      const matchesQuery = !query || user.name.toLowerCase().includes(query);
      return matchesName && matchesQuery;
    });
  }, [filter, users]);

  return (
    <IUsersContext.Provider
      value={{
        users: visibleUsers,
        user,
        filter,
        isLoading,
        error,
        createUser,
        getUserById,
        editUser,
        removeUser,
        setFilter,
        refreshUsers,
      }}
    >
      {children}
    </IUsersContext.Provider>
  );
}

export { UsersProvider };

export function useUsersContext(): IUsersContext {
  return useContext(IUsersContext);
}
