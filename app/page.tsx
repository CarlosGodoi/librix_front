import { FormLogin } from '@/components/form-login';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen, Library } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-sidebar p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg bg-primary text-primary-foreground">
            <Library className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">LibriX</span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="size-7" />
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight">
            Gerencie todo o seu acervo em um só lugar.
          </h1>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Controle livros, usuários e empréstimos com uma plataforma moderna,
            rápida e elegante feita para bibliotecas que valorizam a
            organização.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div>
            <p className="text-2xl font-semibold text-foreground">12k+</p>
            <p>Livros catalogados</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <p className="text-2xl font-semibold text-foreground">3.4k</p>
            <p>Leitores ativos</p>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-10 size-80 rounded-full bg-chart-2/10 blur-3xl"
        />
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Library className="size-4" />
            </div>
            <span className="font-semibold">LibriX</span>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <FormLogin />
      </div>
    </div>
  );
}
