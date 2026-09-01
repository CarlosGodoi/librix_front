import { IUser, UserUpdateFormPayload } from '@/interfaces/users';
import { apiFront } from '../api';

export const updateUser = async (
  id: string,
  { name, email, phone, profile, situation }: UserUpdateFormPayload,
): Promise<IUser> => {
  const response = apiFront.put(`/api/usuarios/editar/${id}`, {
    name,
    email,
    phone,
    profile,
    situation,
  });

  return (await response).data;
};
