import { Redirect } from 'expo-router';
import { useAuth } from '@/src/features/auth';

export default function Home() {
  const { isAuthorized } = useAuth();
  const redirectPath = process.env.NODE_ENV === 'production' ? '/commingsoon' : '/home';

  if (!isAuthorized) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Redirect href={redirectPath} />
  )
}
