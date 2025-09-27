import {router} from 'expo-router';
import {useEffect} from 'react';
import Loading from '@/src/features/loading';
import 'react-native-get-random-values';
import 'react-native-get-random-values';
import {useAuth} from '@/src/features/auth/hooks/use-auth';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/shared/libs/i18n';

export default function Home() {
  const {isAuthorized} = useAuth();
  const redirectPath = '/home';
  const loginPath = '/auth/login';

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

  return <Loading.Page title={i18n.t("apps.locding")}/>
}
