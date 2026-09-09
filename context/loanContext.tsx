'use client';

import { LoanStatus } from '@/enums/loanStatus';
import {
  ICreateLoanPayload,
  ILoans,
  Loan,
  ReturnedLoanOutput,
} from '@/interfaces/loans';
import { getAllLoans } from '@/services/emprestimos/getAllLoans';
import { registerLoan } from '@/services/emprestimos/registerLoan';
import { returnLoan } from '@/services/emprestimos/returnLoan';
import {
  createContext,
  ReactNode,
  use,
  useCallback,
  useContext,
  useState,
} from 'react';
interface ILoansContext {
  loans: ILoans[];
  isLoading: boolean;
  error: string | null;
  refreshLoans: () => Promise<void>;
  returnedLoan: (id: string) => Promise<boolean>;
  registerNewLoan: (data: ICreateLoanPayload) => Promise<Loan[] | null>;
}

export const ILoansContext = createContext<ILoansContext>({} as ILoansContext);
interface IProps {
  children: ReactNode;
  loansPromise: Promise<{ loans: ILoans[] }>;
}

export const LoansProvider: React.FC<IProps> = ({ children, loansPromise }) => {
  const initialData = use(loansPromise);
  const [loans, setLoans] = useState<ILoans[]>(initialData.loans);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLoans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAllLoans({ take: 5, skip: 0 });
      setLoans(res.loans);
    } catch (error) {
      setError('Erro ao buscar empréstimos. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function registerNewLoan(
    data: ICreateLoanPayload,
  ): Promise<Loan[] | null> {
    setIsLoading(true);
    setError(null);

    try {
      const newLoan = await registerLoan(data);
      await refreshLoans();
      return [newLoan];
    } catch (error) {
      setError('Erro ao registrar empréstimo. Tente novamente.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function returnedLoan(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      await returnLoan(id);
      setLoans((prev) =>
        prev.map((loan) =>
          loan.id === id
            ? { ...loan, status: LoanStatus.RETURNED, returnDate: new Date() }
            : loan,
        ),
      );
      return true;
    } catch (error) {
      setError('Erro ao fazer a devolução.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ILoansContext.Provider
      value={{
        loans,
        isLoading,
        refreshLoans,
        error,
        returnedLoan,
        registerNewLoan,
      }}
    >
      {children}
    </ILoansContext.Provider>
  );
};

export function useLoansContext(): ILoansContext {
  const context = useContext(ILoansContext);
  return context;
}
