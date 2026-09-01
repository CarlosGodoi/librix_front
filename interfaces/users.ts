import { PROFILE } from '@/enums/profile';
import { STATUS } from '@/enums/userStatus';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile: PROFILE;
  situation: STATUS;
  createdAt: Date;
  updatedAt: Date | null;
}

// Payloads derivados, não duplicados:
export type UserCreatePayload = Omit<
  IUser,
  'id' | 'createdAt' | 'updatedAt'
> & { password: string };
export type UserUpdatePayload = Omit<IUser, 'createdAt'>;
export type UserUpdateFormPayload = Omit<UserUpdatePayload, 'id' | 'updatedAt'>;
