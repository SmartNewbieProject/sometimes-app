import { useAuth } from '@/src/features/auth';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { View} from 'react-native';
import { getReferralCode } from '../../api';
import { useToast } from '@/src/shared/hooks/use-toast';

// 초대 코드가 바뀌는 일은 극히 드물기 때문에 1시간으로 잡음
const STALE_TIME = 60 * 60 * 1000


function useReferralCode() {
  const { accessToken } = useAuth();
  const {emitToast} = useToast()
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["referral-code"],
    queryFn: getReferralCode,
    enabled: !!accessToken,
    retry: (failureCount, error) => !!accessToken && failureCount < 3,
    staleTime: STALE_TIME
  })

  useEffect(() => {
    if (isError) {
      emitToast("코드를 불러오는데 실패했어요")
    }
  }, [isError])
  return {
    referralCode: data?.code,
    isLoading,
    error
  }
}


export default useReferralCode;