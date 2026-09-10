import { useAuthContext } from '@/context/authContext';
import { cn } from '@/lib/utils';
import {
  ArrowLeftRight,
  BookMarked,
  BookPlus,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { initials } from '@/utils/initialsName';

const nav = [
  { href: '/livros', label: 'Acervo', icon: LayoutDashboard },
  { href: '/livros/novo', label: 'Cadastrar livro', icon: BookPlus },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/emprestimos/novo', label: 'Novo empréstimo', icon: ArrowLeftRight },
  { href: '/emprestimos', label: 'Empréstimos', icon: BookMarked },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const isActive = (href: string) =>
    href === '/livros'
      ? pathname === '/livros'
      : pathname === href || pathname.startsWith(href + '/');

  const SidebarContent = () => (
    <>
      <div className=" flex items-center gap-2.5 px-5 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Library className="size-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">LibriX</p>
          <p className="text-xs text-muted-foreground">Gestão de biblioteca</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
              )}
            >
              <Icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials(user?.name ?? '')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-medium">{user?.name ?? ''}</p>
            <p className="truncate text-muted-foreground text-xs ">
              {user?.email ?? ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sair"
            onClick={handleLogout}
            className="size-8 shrink-0 text-muted-foreground"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <aside className="absolute inset-0 left-0 flex w-64 flex-col bg-sidebar shadow-xl">
              <SidebarContent />
            </aside>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
          >
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
          <div className="flex flex-1 items-center gap-2">
            <BookMarked className="hidden size-4 text-muted-foreground sm:block" />
            <span className="text-sm text-muted-foreground">
              Bem-vindo de volta ao painel
            </span>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
