'use client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TUser } from '@/context/authContext';
import { useLoansContext } from '@/context/loanContext';
import { LoanStatus } from '@/enums/loanStatus';
import { PROFILE } from '@/enums/profile';
import { Loan } from '@/interfaces/loans';
import { initials } from '@/utils/initialsName';
import { loanStatusLabel } from '@/utils/status/translatestatus';
import {
  BookMarked,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface TableProps {
  userRole?: TUser | null | undefined;
}

const formatDate = (value: string | Date | null | undefined) => {
  if (!value) return '-';

  const date =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const parseDate = (value: string | Date) => {
  if (value instanceof Date) return value;

  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
};

function effectiveStatus(
  loan: Pick<Loan, 'status' | 'dueDate'>,
): Loan['status'] {
  if (loan.status === LoanStatus.RETURNED) {
    return LoanStatus.RETURNED;
  }

  const due = parseDate(loan.dueDate);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return due < now ? LoanStatus.DELAYED : LoanStatus.INPROGRESS;
}

function StatusBadge({ status }: { status: LoanStatus }) {
  const map: Record<LoanStatus, string> = {
    [LoanStatus.INPROGRESS]: 'border-chart-2/40 bg-chart-2/10 text-chart-2',

    [LoanStatus.RETURNED]:
      'border-muted-foreground/30 bg-muted text-muted-foreground',

    [LoanStatus.DELAYED]:
      'border-destructive/30 bg-destructive/10 text-destructive',
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {loanStatusLabel[status]}
    </Badge>
  );
}

export default function TableLoans({ userRole }: TableProps) {
  const { loans, returnedLoan } = useLoansContext();
  const safeLoans = loans ?? [];
  const [tab, setTab] = useState<
    'todos' | 'ativos' | 'atrasados' | 'devolvidos'
  >('todos');

  const ISBLOQUED = userRole?.profile === PROFILE.VISITOR;

  const enriched = useMemo(
    () =>
      safeLoans
        .map((loan) => ({
          ...loan,
          computed: effectiveStatus(loan),
        }))
        .sort(
          (a, b) =>
            new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime(),
        ),
    [safeLoans],
  );

  const counts = {
    todos: enriched.length,
    ativos: enriched.filter((l) => l.computed === LoanStatus.INPROGRESS).length,
    atrasados: enriched.filter((l) => l.computed === LoanStatus.DELAYED).length,
    devolvidos: enriched.filter((l) => l.computed === LoanStatus.RETURNED)
      .length,
  };

  const filtered = enriched.filter((l) => {
    if (tab === 'todos') return true;
    if (tab === 'ativos') return l.computed === LoanStatus.INPROGRESS;
    if (tab === 'atrasados') return l.computed === LoanStatus.DELAYED;
    return l.computed === LoanStatus.RETURNED;
  });

  const handleReturn = (loanId: string) => {
    if (ISBLOQUED) return;

    returnedLoan(loanId);
    toast.success('Devolução registrada.');
  };

  return (
    <div className="space-y-8">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="todos">Todos ({counts.todos})</TabsTrigger>
          <TabsTrigger value="ativos">
            Em andamento ({counts.ativos})
          </TabsTrigger>
          <TabsTrigger value="atrasados">
            Atrasados ({counts.atrasados})
          </TabsTrigger>
          <TabsTrigger value="devolvidos">
            Devolvidos ({counts.devolvidos})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <BookMarked className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum empréstimo nesta categoria.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Livro</TableHead>
                <TableHead className="hidden md:table-cell">Leitor</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Empréstimo
                </TableHead>
                <TableHead>Devolução</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((loan) => {
                const book = loan.book;
                const user = loan.user;
                return (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative aspect-3/4 w-9 shrink-0 overflow-hidden rounded bg-muted">
                          {book && (
                            <Image
                              src={
                                typeof book.coverUrl === 'string' &&
                                book.coverUrl
                                  ? book.coverUrl
                                  : '/covers/placeholder.png'
                              }
                              alt={loan.book.title}
                              fill
                              className="object-cover"
                              sizes="36px"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium">
                            {book?.title ?? 'Livro removido'}
                          </p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">
                            {book?.author}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7">
                          <AvatarFallback className="bg-primary/10 text-[12px] font-semibold text-primary">
                            {user ? initials(user.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {user?.name ?? 'Removido'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {formatDate(String(loan.loanDate))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm">
                        <CalendarClock className="size-3.5 text-muted-foreground" />
                        {loan.returnDate
                          ? formatDate(loan.returnDate)
                          : formatDate(loan.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={loan.computed} />
                    </TableCell>
                    <TableCell className="text-right">
                      {loan.computed === LoanStatus.RETURNED ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="size-3.5" />
                          Concluído
                        </span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturn(loan.id)}
                          disabled={ISBLOQUED}
                        >
                          <RotateCcw className="size-3.5" />
                          Devolver
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
