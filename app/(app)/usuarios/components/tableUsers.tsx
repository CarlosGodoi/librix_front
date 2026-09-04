'use client';

import { useMemo, useOptimistic, useState, useTransition } from 'react';
import { Search, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsersContext } from '@/context/userContext';
import { useLoansContext } from '@/context/loanContext';
import { LoanStatus } from '@/enums/loanStatus';
import { IUser } from '@/interfaces/users';
import { STATUS } from '@/enums/userStatus';
import {
  profileStatusLabel,
  userSituationStatusLabel,
} from '@/utils/status/translatestatus';
import { UserFormDialog } from './userFormDialog';

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export default function TableUsers() {
  const { users, removeUser } = useUsersContext();
  const [isPending, startTransition] = useTransition();
  const { loans } = useLoansContext();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IUser | null>(null);

  const [optimisticUsers, removeOptimisticUser] = useOptimistic(
    users,
    (state, id: string) => state.filter((user) => user.id !== id),
  );

  const filtered = useMemo(
    () =>
      optimisticUsers.filter(
        (user) =>
          user?.name?.toLowerCase().includes(query.toLowerCase()) ||
          user?.email?.toLowerCase().includes(query.toLowerCase()),
      ),
    [optimisticUsers, query],
  );

  const loanCount = (memberId: string) =>
    loans.filter(
      (loan) => loan.userId === memberId && loan.status !== LoanStatus.RETURNED,
    ).length;

  const handleNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const handleEdit = (user: IUser) => {
    setEditing(user);
    setOpen(true);
  };

  const handleDelete = (user: IUser) => {
    startTransition(async () => {
      removeOptimisticUser(user.id);
      try {
        await removeUser(user.id);
        toast.success('Usuário removido.');
      } catch (error) {
        toast.error('Erro ao remover usuário.');
      }
    });
  };

  function StatusBadge({ status }: { status: STATUS }) {
    const map: Record<STATUS, string> = {
      [STATUS.ACTIVE]: 'border-primary/30 bg-primary/10 text-primary',
      [STATUS.INACTIVE]:
        'border-destructive/30 bg-destructive/10 text-destructive',
    };

    return (
      <Badge variant="outline" className={map[status]}>
        {userSituationStatusLabel[status]}
      </Badge>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os leitores cadastrados na biblioteca.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="size-4" />
          Cadastrar usuário
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Users className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuário</TableHead>
                <TableHead className="hidden md:table-cell">Perfil</TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead>Empréstimos</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">
                      {profileStatusLabel[user.profile]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                    {user.phone || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {loanCount(user.id) > 0 ? (
                      <span className="font-medium text-primary">
                        {loanCount(user.id)} ativos
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Nenhum</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={user.situation} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        aria-label="Editar"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Excluir"
                        onClick={() => handleDelete(user)}
                        disabled={isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <UserFormDialog open={open} onOpenChange={setOpen} user={editing} />
    </div>
  );
}
