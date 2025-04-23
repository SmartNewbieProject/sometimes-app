import { router } from 'expo-router';
import { useAuth } from '@/src/features/auth';
import { useEffect } from 'react';
import Loading from '@/src/features/loading';

export default function Home() {
  const { isAuthorized } = useAuth();
  const redirectPath = process.env.NODE_ENV === 'production' ? '/event/pre-signup' : '/home';
  const loginPath = process.env.NODE_ENV === 'production' ? '/event/pre-signup' : '/auth/login';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthorized) {
        router.push(redirectPath);
      } else {
        router.push(loginPath);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthorized, redirectPath]);

  return <Loading.Page title="앱을 불러오고 있어요!" />
}
