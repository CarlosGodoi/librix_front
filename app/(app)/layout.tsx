import AppLayoutClient from './appLayoutClient';
import { getAllUsersServer } from '@/services/usuarios/getAllUsersServer';
import { getAllBooksServer } from '@/services/livros/getAllBooksServer';
import { getAllLoansServer } from '@/services/emprestimos/getAllLoansServer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const usersPromise = getAllUsersServer({ take: 10, skip: 0 });
  const booksPromise = getAllBooksServer({ take: 10, skip: 0 });
  const loansPromise = getAllLoansServer({ take: 10, skip: 0 });

  return (
    <AppLayoutClient
      usersPromise={usersPromise}
      booksPromise={booksPromise}
      loansPromise={loansPromise}
    >
      {children}
    </AppLayoutClient>
  );
}
