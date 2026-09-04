import { Skeleton } from '@/components/ui/skeleton';

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <Skeleton className="size-9 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            >
              <Skeleton className="size-4.5 shrink-0 rounded" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-2">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <Skeleton className="size-9 rounded-md lg:hidden" />
          <div className="flex flex-1 items-center gap-2">
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="size-9 rounded-md" />
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Cabeçalho da página */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>

            {/* Campo de busca */}
            <Skeleton className="h-9 max-w-sm rounded-md" />

            {/* Tabela */}
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <div className="flex gap-6">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16 hidden md:block" />
                  <Skeleton className="h-3.5 w-20 hidden lg:block" />
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              </div>

              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-6 border-b border-border px-4 py-3.5 last:border-0"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <Skeleton className="size-9 shrink-0 rounded-full" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full hidden md:block" />
                  <Skeleton className="h-3.5 w-20 hidden lg:block" />
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
