import { PROFILE } from '@/enums/profile';
import { STATUS } from '@/enums/userStatus';
import { z } from 'zod';

export const baseSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigátorio.' }).trim(),
  email: z.email().min(1, { message: 'Email é obrigátorio.' }).trim(),
  phone: z.string().min(1, { message: 'Telefone é obrigatório' }),
  profile: z.enum(PROFILE),
  situation: z.enum(STATUS),
});

export const createUserSchema = baseSchema.extend({
  password: z
    .string()
    .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
    .trim(),
});

export const editUserSchema = baseSchema.extend({
  password: z.string().optional(),
});

export type UserFormSchema =
  | z.infer<typeof createUserSchema>
  | z.infer<typeof editUserSchema>;
