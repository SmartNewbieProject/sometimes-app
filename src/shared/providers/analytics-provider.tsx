import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { usePathname, useSegments } from 'expo-router';
import { GA_TRACKING_ID, sendPageView } from '@/src/shared/utils';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * 웹 환경에서 Google Analytics를 초기화하고 페이지 뷰를 추적하는 Provider
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // 웹 환경에서만 실행
    if (Platform.OS !== 'web') {
      return;
    }

    // Google Analytics 스크립트 로드
    if (!document.querySelector(`script[src="https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}"]`)) {
      const script1 = document.createElement('script');
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
      script1.async = true;
      document.head.appendChild(script1);

      // gtag 초기화 스크립트
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  // 경로 변경 감지 및 페이지 뷰 전송
  useEffect(() => {
    if (Platform.OS === 'web') {
      sendPageView(pathname);
    }
  }, [pathname, segments]);

  return <>{children}</>;
}

// TypeScript용 전역 window 타입 확장
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}
