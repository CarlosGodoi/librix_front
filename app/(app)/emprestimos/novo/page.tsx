import { Suspense } from 'react';

export default function NewLoanPage() {
  return (
    <Suspense fallback={null}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Novo empréstimo
          </h1>
          <p className="text-sm text-muted-foreground">
            Registre a retirada de um livro por um leitor.
          </p>
        </div>
      </div>
    </Suspense>
  );
}
