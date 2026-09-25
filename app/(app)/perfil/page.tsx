import { Suspense } from 'react';
import { Profile } from './components/profile';

export default async function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <Profile />
    </Suspense>
  );
}
