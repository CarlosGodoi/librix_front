import { ILoans } from '@/interfaces/loans';
import { getAllLoans } from '@/services/emprestimos/getAllLoans';
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

  useEffect(() => {
    refreshLoans();
  }, [refreshLoans]);

  return (
    <ILoansContext.Provider value={{ loans, isLoading, refreshLoans, error }}>
      {children}
    </ILoansContext.Provider>
  );
};

export function useLoansContext(): ILoansContext {
  const context = useContext(ILoansContext);

  return context;
}
