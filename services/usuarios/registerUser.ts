import { apiFront } from '../api';
import { IUser, UserCreatePayload } from '@/interfaces/users';

export const registerUser = async ({
  name,
  email,
  phone,
  profile,
  situation,
  password,
}: UserCreatePayload): Promise<IUser> => {
  const response = apiFront.post('/api/usuarios/novo', {
    name,
    email,
    phone,
    profile,
    situation,
    password,
  });

  return (await response).data;
};
