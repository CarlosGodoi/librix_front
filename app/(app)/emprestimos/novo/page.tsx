import { Suspense } from 'react';
import NewLoanForm from '../components/formLoan';

export default function NewLoanPage() {
  return (
    <Suspense fallback={null}>
      <NewLoanForm />
    </Suspense>
  );
}
