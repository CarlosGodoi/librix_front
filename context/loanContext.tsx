import { LoanStatus } from '@/enums/loanStatus';
import { ILoans, ReturnedLoanOutput } from '@/interfaces/loans';
import { getAllLoans } from '@/services/emprestimos/getAllLoans';
import { returnLoan } from '@/services/emprestimos/returnLoan';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface ILoansContext {
  loans: ILoans[];
  isLoading: boolean;
  error: string | null;
  refreshLoans: () => Promise<void>;
  returnedLoan: (id: string) => Promise<boolean>;
}

export const ILoansContext = createContext<ILoansContext>({} as ILoansContext);

interface IProps {
  children: ReactNode;
}

export const LoansProvider: React.FC<IProps> = ({ children }) => {
  const [loans, setLoans] = useState<ILoans[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLoans = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getAllLoans({ take: 5, skip: 0 });

      setLoans(res.loans);
    } catch (error) {
      setError('Erro ao buscar empréstimos. Tente noavemnte');
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    refreshLoans();
  }, [refreshLoans]);

  return (
    <ILoansContext.Provider
      value={{ loans, isLoading, refreshLoans, error, returnedLoan }}
    >
      {children}
    </ILoansContext.Provider>
  );
};

export function useLoansContext(): ILoansContext {
  const context = useContext(ILoansContext);

  return context;
}
