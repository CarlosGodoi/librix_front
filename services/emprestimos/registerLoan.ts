import { ILoan, Loan } from '@/interfaces/loans';
import { apiFront } from '../api';

export const registerLoan = async ({
  bookId,
  userId,
  dueDate,
  loanDate,
}: ILoan): Promise<Loan> => {
  const response = await apiFront.post('/api/emprestimos/novo', {
    bookId,
    userId,
    dueDate,
    loanDate,
  });

  return response.data;
};
