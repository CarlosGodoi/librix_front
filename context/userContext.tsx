'use client';

import {
  IUser,
  UserCreatePayload,
  UserUpdateFormPayload,
} from '@/interfaces/users';
import { getAllUsers } from '@/services/usuarios/getAll';
import { registerUser } from '@/services/usuarios/registerUser';
import { updateUser } from '@/services/usuarios/updateUser';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

interface UserFilter {
  name: string;
  search: string;
}

interface IUsersContext {
  users: IUser[];
  filter: UserFilter;
  isLoading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<UserFilter>>;
  createUser: (data: UserCreatePayload) => Promise<IUser>;
  editUser: (id: string, data: UserUpdateFormPayload) => Promise<IUser>;
  // getById: (id: string) => Promise<IUser>;
  // delete: (id: string) => void;
}

export const IUsersContext = createContext<IUsersContext>({} as IUsersContext);

interface IProps {
  children: ReactNode;
}

export const UsersProvider: React.FC<IProps> = ({ children }) => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filter, setFilter] = useState<UserFilter>({
    name: '',
    search: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createUser(data: UserCreatePayload) {
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
  }

  async function editUser(id: string, data: UserUpdateFormPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateUser(id, data);
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)));
      return updated;
    } catch (error) {
      setError('Erro ao editar dados do usuário.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllUsers({ take: 10, skip: 0 });
      console.log('Response_Users=>', response.data);

      setUsers(response.users);
    } catch (error) {
      setError('Erro ao buscar usuários.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUsers();
  }, [refreshUsers]);

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
        filter,
        isLoading,
        error,
        createUser,
        editUser,
        setFilter,
        refreshUsers,
      }}
    >
      {children}
    </IUsersContext.Provider>
  );
};

export function useUsersContext(): IUsersContext {
  const context = useContext(IUsersContext);

  return context;
}
