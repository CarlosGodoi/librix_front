import { Suspense } from 'react';
import TableLoans from './components/tableLoans';
import { getUserServer } from '@/services/usuarios/getUserServer';

export default async function LoansPage() {
  const user = await getUserServer();
  return (
    <Suspense fallback={null}>
      <TableLoans userRole={user} />
    </Suspense>
  );
}
