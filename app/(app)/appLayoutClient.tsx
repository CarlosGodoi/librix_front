'use client';

import { AppShell } from '@/components/app-shell';
import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { TUser } from '@/context/authContext';
import { BooksProvider } from '@/context/BookContext';
import { LoansProvider } from '@/context/loanContext';
import { UsersProvider } from '@/context/userContext';
import { IBook } from '@/interfaces/books';
import { ILoans } from '@/interfaces/loans';
import { IUser } from '@/interfaces/users';
import React, { Suspense } from 'react';

interface Props {
  children: React.ReactNode;
  usersPromise: Promise<{ users: IUser[] }>;
  booksPromise: Promise<{ books: IBook[]; total: number; totalPage: number }>;
  loansPromise: Promise<{ loans: ILoans[] }>;
  user?: TUser | null | undefined;
}

export default function AppLayoutClient({
  children,
  usersPromise,
  booksPromise,
  loansPromise,
  user,
}: Props) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <UsersProvider usersPromise={usersPromise}>
        <BooksProvider booksPromise={booksPromise}>
          <LoansProvider loansPromise={loansPromise}>
            <AppShell userRole={user}>{children}</AppShell>
          </LoansProvider>
        </BooksProvider>
      </UsersProvider>
    </Suspense>
  );
}
