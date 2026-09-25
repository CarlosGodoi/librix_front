import { Suspense } from 'react';
import TableUsers from './components/tableUsers';

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <TableUsers />
    </Suspense>
  );
}
