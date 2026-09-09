import { z } from 'zod';

export const loanFormInputSchema = z.object({
  bookId: z.string().min(1, { message: 'Selecione um livro.' }),
  userId: z.string().min(1, { message: 'Selecione um usuário.' }),
  dueDate: z.string().min(1, { message: 'Selecione uma data de devolução.' }),
  loanDate: z.string().min(1, { message: 'Selecione um data de empréstimo.' }),
});

export type LoanFormInput = z.infer<typeof loanFormInputSchema>;
