import { LoanStatus } from '@/enums/loanStatus';
import { PROFILE } from '@/enums/profile';
import { STATUS } from '@/enums/userStatus';

export const loanStatusLabel: Record<LoanStatus, string> = {
  [LoanStatus.INPROGRESS]: 'Em andamento',
  [LoanStatus.RETURNED]: 'Devolvido',
  [LoanStatus.DELAYED]: 'Atrasado',
};

export const userSituationStatusLabel: Record<STATUS, string> = {
  [STATUS.ACTIVE]: 'Ativo',
  [STATUS.INACTIVE]: 'Inativo',
};

export const profileStatusLabel: Record<PROFILE, string> = {
  [PROFILE.ADMIN]: 'Admin',
  [PROFILE.LIBRARIAN]: 'Bibliotecário',
  [PROFILE.VISITOR]: 'Visitante',
};
