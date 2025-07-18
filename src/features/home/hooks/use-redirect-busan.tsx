import { useEffect } from 'react';
import { router } from 'expo-router';
import { useCheckBusanQuery } from '../queries';

export const useRedirectBusan = () => {
  const { data: isBusan = false, isLoading } = useCheckBusanQuery();

  useEffect(() => {
    if (!isLoading && isBusan) {
      router.replace('/commingsoon');
    }
  }, [isLoading, isBusan]);

  return {
    isBusan,
    isLoading,
  };
};