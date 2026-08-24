import { LoanStatus } from '@/enums/loanStatus';

export const loanStatusLabel: Record<LoanStatus, string> = {
  [LoanStatus.INPROGRESS]: 'Em andamento',
  [LoanStatus.RETURNED]: 'Devolvido',
  [LoanStatus.DELAYED]: 'Atrasado',
};
