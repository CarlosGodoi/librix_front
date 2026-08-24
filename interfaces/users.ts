import { PROFILE } from '@/enums/profile';
import { STATUS } from '@/enums/userStatus';

export interface IUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  profile: PROFILE;
  situation: STATUS;
  createdAt: Date;
  updatedAt: Date | null;
}
