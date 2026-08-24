import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import TableLoans from './components/tableLoans';

export default function LoansPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Empréstimos</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe os livros emprestados e suas devoluções.
          </p>
        </div>
        <Link href="/emprestimos/novo" className={cn(buttonVariants())}>
          <Plus className="size-4" />
          Novo empréstimo
        </Link>
      </div>
      <TableLoans />
    </div>
  );
}
