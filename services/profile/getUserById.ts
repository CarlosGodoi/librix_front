import { IUser } from '@/interfaces/users';
import { apiFront } from '../api';

export const getUser = async (): Promise<IUser> => {
  const response = await apiFront.get(`/api/perfil`);

  return response.data.user;
};
