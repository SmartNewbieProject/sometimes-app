import { Redirect } from 'expo-router';
import { useAuth } from '@/src/features/auth';

export default function Home() {
  const { isAuthorized } = useAuth();

  if (!isAuthorized) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <Redirect href="/home" />
  )
}
