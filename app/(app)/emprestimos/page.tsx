import { Suspense } from 'react';
import TableLoans from './components/tableLoans';

export default function LoansPage() {
  return (
    <Suspense fallback={null}>
      <TableLoans />
    </Suspense>
  );
}
