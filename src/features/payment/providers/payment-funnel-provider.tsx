import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePaymentFunnelTracking } from '@/src/shared/hooks/use-payment-funnel-tracking';

interface PaymentFunnelContextType {
  entryData: any;
  setEntryData: (data: any) => void;
  trackPlanView: (planId: string) => void;
  handleStoreExit: () => void;
}

const PaymentFunnelContext = createContext<PaymentFunnelContextType | null>(null);

interface PaymentFunnelProviderProps {
  children: ReactNode;
}

/**
 * 결제 퍼널 추적을 위한 프로바이더 컴포넌트
 * 젬 스토어 페이지에서의 사용자 행동을 추적
 */
export const PaymentFunnelProvider: React.FC<PaymentFunnelProviderProps> = ({ children }) => {
  const [entryData, setEntryData] = useState<any>(null);
  const [pageStartTime, setPageStartTime] = useState<number>(Date.now());
  const [viewedPlans, setViewedPlans] = useState<Set<string>>(new Set());

  const { completeStoreFunnel } = usePaymentFunnelTracking();

  /**
   * 플랜(젬 패키지) 조회 추적
   * @param planId 플랜 ID
   */
  const trackPlanView = (planId: string) => {
    setViewedPlans(prev => new Set(prev).add(planId));

    console.log('👁️ Plan viewed:', {
      planId,
      totalViewed: viewedPlans.size + 1,
      allPlans: Array.from(viewedPlans).concat(planId),
    });
  };

  /**
   * 스토어 페이지 나갈 때 처리
   * 최종 퍼널 데이터를 Amplitude로 전송
   */
  const handleStoreExit = () => {
    if (entryData) {
      const timeOnPage = Math.floor((Date.now() - pageStartTime) / 1000);
      const plansViewed = Array.from(viewedPlans);

      completeStoreFunnel({
        timeOnStorePage: timeOnPage,
        plansViewed: plansViewed,
      });

      console.log('📊 Store analytics summary:', {
        timeOnPage: `${timeOnPage}초`,
        plansViewed: plansViewed.length,
        plans: plansViewed,
        priceComparison: plansViewed.length > 1,
      });
    }

    // 상태 초기화
    setPageStartTime(Date.now());
    setViewedPlans(new Set());
    setEntryData(null);
  };

  // 컴포넌트 마운트 시 시작 시간 기록
  useEffect(() => {
    setPageStartTime(Date.now());

    return () => {
      // 컴포넌트 언마운트 시 자동으로 퍼널 종료 처리
      handleStoreExit();
    };
  }, [handleStoreExit]);

  // 페이지 비활성화 시에도 퍼널 종료 처리
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.hidden) {
        handleStoreExit();
      }
    };

    // 앱 환경에서는 포커스 아웃 처리
    const handleBlur = () => {
      handleStoreExit();
    };

    // 웹 환경인 경우
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleBlur);
      }
    };
  }, [entryData, handleStoreExit]);

  const contextValue: PaymentFunnelContextType = {
    entryData,
    setEntryData,
    trackPlanView,
    handleStoreExit,
  };

  return (
    <PaymentFunnelContext.Provider value={contextValue}>
      {children}
    </PaymentFunnelContext.Provider>
  );
};

/**
 * 결제 퍼널 컨텍스트 사용 훅
 */
export const usePaymentFunnelContext = (): PaymentFunnelContextType => {
  const context = useContext(PaymentFunnelContext);

  if (!context) {
    throw new Error('usePaymentFunnelContext must be used within PaymentFunnelProvider');
  }

  return context;
};