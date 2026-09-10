'use client';

import { AppShell } from '@/components/app-shell';
import { AppShellSkeleton } from '@/components/app-shell-skeleton';
import { BooksProvider } from '@/context/BookContext';
import { LoansProvider } from '@/context/loanContext';
import { UsersProvider } from '@/context/userContext';
import { IUser } from '@/interfaces/users';
import React, { Suspense } from 'react';

interface Props {
  children: React.ReactNode;
  usersPromise: Promise<{ users: IUser[] }>;
  booksPromise: Promise<any>;
  loansPromise: Promise<any>;
}

export default function AppLayoutClient({
  children,
  usersPromise,
  booksPromise,
  loansPromise,
}: Props) {
  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <UsersProvider usersPromise={usersPromise}>
        <BooksProvider booksPromise={booksPromise}>
          <LoansProvider loansPromise={loansPromise}>
            <AppShell>{children}</AppShell>
          </LoansProvider>
        </BooksProvider>
      </UsersProvider>
    </Suspense>
  );
}
