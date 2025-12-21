import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useMixpanel } from '@/src/shared/hooks/use-mixpanel';

/**
 * 앱 세션 추적 컴포넌트
 *
 * - App_Opened: 앱 최초 실행 시 1회 호출
 * - Session_Started: 앱이 foreground로 올 때마다 호출
 * - Session_Ended: 앱이 background로 갈 때 호출
 *
 * User Properties 자동 업데이트:
 * - last_active_date: 세션 시작 시 자동 갱신
 */
export function SessionTracker() {
  const { sessionEvents, featureEvents } = useMixpanel();
  const appState = useRef(AppState.currentState);
  const sessionStartTime = useRef<number | null>(null);
  const isFirstLaunch = useRef(true);

  useEffect(() => {
    // 앱 최초 실행 이벤트
    if (isFirstLaunch.current) {
      featureEvents.trackAppOpened();
      sessionEvents.trackSessionStarted('app_launch');
      sessionStartTime.current = Date.now();
      isFirstLaunch.current = false;
    }

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const wasInactive = appState.current.match(/inactive|background/);
      const isNowActive = nextAppState === 'active';

      if (wasInactive && isNowActive) {
        // Background → Foreground: 세션 시작
        sessionEvents.trackSessionStarted('app_foreground');
        sessionStartTime.current = Date.now();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // Foreground → Background: 세션 종료
        if (sessionStartTime.current) {
          const sessionDuration = Math.floor((Date.now() - sessionStartTime.current) / 1000);
          sessionEvents.trackSessionEnded(sessionDuration);
          sessionStartTime.current = null;
        }

        featureEvents.trackAppBackgrounded();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [sessionEvents, featureEvents]);

  return null;
}
