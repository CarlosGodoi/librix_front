'use client';

import { AppShell } from '@/components/app-shell';
import { useAuthContext } from '@/context/authContext';
import { BooksProvider } from '@/context/BookContext';

import { LoansProvider } from '@/context/loanContext';
import { UsersProvider } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <BooksProvider>
      <LoansProvider>
        <UsersProvider>
          <AppShell>{children}</AppShell>
        </UsersProvider>
      </LoansProvider>
    </BooksProvider>
  );
}
