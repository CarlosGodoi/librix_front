import AppLayoutClient from './appLayoutClient';
import { getAllUsersServer } from '@/services/usuarios/getAllUsersServer';
import { getAllBooksServer } from '@/services/livros/getAllBooksServer';
import { getAllLoansServer } from '@/services/emprestimos/getAllLoansServer';
import { getUserServer } from '@/services/usuarios/getUserServer';
import { getLoansByUserIdServer } from '@/services/emprestimos/getLoanByIdServer';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserServer();
  const canListUsers =
    user?.profile === 'ADMIN' || user?.profile === 'LIBRARIAN';

  const usersPromise = canListUsers
    ? getAllUsersServer({ take: 10, skip: 0 })
    : Promise.resolve({ users: [] });
  const booksPromise = getAllBooksServer({ take: 10, skip: 0 });
  const loansPromise =
    canListUsers || !user?.id
      ? getAllLoansServer({ take: 10, skip: 0 })
      : getLoansByUserIdServer({ userId: user.id, take: 10, skip: 0 });

  return (
    <AppLayoutClient
      usersPromise={usersPromise}
      booksPromise={booksPromise}
      loansPromise={loansPromise}
      user={user}
    >
      {children}
    </AppLayoutClient>
  );
}
