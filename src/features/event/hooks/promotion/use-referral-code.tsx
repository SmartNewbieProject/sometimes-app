import { useAuth } from '@/src/features/auth';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import { View} from 'react-native';
import { getReferralCode } from '../../api';
import { useToast } from '@/src/shared/hooks/use-toast';



function useReferralCode() {
  const { accessToken } = useAuth();
  const {emitToast} = useToast()
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["referral-code"],
    queryFn: getReferralCode,
    enabled: !!accessToken,
    retry: !!accessToken,
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