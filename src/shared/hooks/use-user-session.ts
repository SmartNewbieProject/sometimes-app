import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@amplitude/analytics-react-native';
import { AMPLITUDE_KPI_EVENTS } from '@/src/shared/constants/amplitude-kpi-events';

interface UserSessionData {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActiveTime: number;
  totalSessionTime: number;
  isActive: boolean;
  appOpenCount: number;
  featuresUsed: string[];
  sessionType: 'new' | 'returning' | 'background_return';
  previousSessionEnd?: number;
}

interface SessionMetrics {
  totalDuration: number;
  activeDuration: number;
  backgroundDuration: number;
  featuresUsed: string[];
  featureUsageTime: Record<string, number>;
  appOpenCount: number;
  sessionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useUserSession = (userId?: string) => {
  const sessionRef = useRef<UserSessionData>({
    sessionId: generateSessionId(),
    userId,
    startTime: Date.now(),
    lastActiveTime: Date.now(),
    totalSessionTime: 0,
    isActive: true,
    appOpenCount: 0,
    featuresUsed: [],
    sessionType: 'new'
  });

  const backgroundStartTime = useRef<number>(0);
  const featureUsageStart = useRef<string>('');
  const intervalRef = useRef<NodeJS.Timeout>();

  // 세션 ID 생성
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 사용자 세션 시작
  const startUserSession = useCallback((sessionType: 'new' | 'returning' | 'background_return', source: 'direct' | 'push' | 'deeplink' = 'direct') => {
    const currentTime = Date.now();

    // 새 세션인지 확인 (30분 이상 경과)
    const timeSinceLastSession = sessionRef.current.previousSessionEnd
      ? currentTime - sessionRef.current.previousSessionEnd
      : Infinity;

    const isNewSession = timeSinceLastSession > 30 * 60 * 1000; // 30분

    if (isNewSession) {
      sessionRef.current = {
        sessionId: generateSessionId(),
        userId,
        startTime: currentTime,
        lastActiveTime: currentTime,
        totalSessionTime: 0,
        isActive: true,
        appOpenCount: sessionRef.current.appOpenCount + 1,
        featuresUsed: [],
        sessionType,
        previousSessionEnd: sessionRef.current.previousSessionEnd
      };
    } else {
      // 기존 세션 계속
      sessionRef.current.sessionType = 'background_return';
      sessionRef.current.lastActiveTime = currentTime;
      sessionRef.current.isActive = true;
    }

    // 앱 오픈 이벤트 발송
    track(AMPLITUDE_KPI_EVENTS.APP_OPENED, {
      session_id: sessionRef.current.sessionId,
      session_type: sessionRef.current.sessionType,
      app_open_count: sessionRef.current.appOpenCount,
      time_since_last_open: timeSinceLastSession,
      source,
      user_id: userId,
      timestamp: currentTime,
      env: __DEV__ ? 'development' : 'production'
    });

    // 세션 시작 이벤트 (새 세션만)
    if (isNewSession) {
      track(AMPLITUDE_KPI_EVENTS.SESSION_STARTED, {
        session_id: sessionRef.current.sessionId,
        session_start_reason: sessionType === 'new' ? 'app_launch' : 'returning_user',
        time_since_last_session: timeSinceLastSession,
        user_id: userId,
        timestamp: currentTime
      });
    }

    // 세션 데이터 저장
    AsyncStorage.setItem('user_session', JSON.stringify(sessionRef.current));

    // 활동 시간 추적 시작 (1초마다)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (sessionRef.current.isActive) {
        sessionRef.current.lastActiveTime = Date.now();
      }
    }, 1000);

    console.log('🚀 사용자 세션 시작:', {
      sessionId: sessionRef.current.sessionId,
      sessionType: sessionRef.current.sessionType,
      isNewSession,
      userId
    });
  }, [userId]);

  // 기능 사용 시작
  const startFeatureUsage = useCallback((featureName: string) => {
    if (!sessionRef.current.featuresUsed.includes(featureName)) {
      sessionRef.current.featuresUsed.push(featureName);
    }

    featureUsageStart.current = featureName;

    track(AMPLITUDE_KPI_EVENTS.FEATURE_USED, {
      session_id: sessionRef.current.sessionId,
      feature_name: featureName,
      action: 'start',
      session_duration: Date.now() - sessionRef.current.startTime,
      user_id: userId
    });

    console.log('⚡ 기능 사용 시작:', featureName);
  }, [userId]);

  // 기능 사용 종료
  const endFeatureUsage = useCallback((featureName: string, additionalData?: any) => {
    if (featureUsageStart.current === featureName) {
      featureUsageStart.current = '';
    }

    track(AMPLITUDE_KPI_EVENTS.FEATURE_USED, {
      session_id: sessionRef.current.sessionId,
      feature_name: featureName,
      action: 'end',
      session_duration: Date.now() - sessionRef.current.startTime,
      user_id: userId,
      ...additionalData
    });

    console.log('🏁 기능 사용 종료:', featureName);
  }, [userId]);

  // 세션 종료
  const endUserSession = useCallback((endReason: 'app_close' | 'background_timeout' | 'manual_logout') => {
    const currentTime = Date.now();
    const totalSessionTime = currentTime - sessionRef.current.startTime;

    sessionRef.current.totalSessionTime = totalSessionTime;
    sessionRef.current.isActive = false;

    // 세션 품질 평가
    const sessionQuality = assessSessionQuality(sessionRef.current);

    // 세션 종료 이벤트 발송
    track(AMPLITUDE_KPI_EVENTS.SESSION_ENDED, {
      session_id: sessionRef.current.sessionId,
      session_duration: totalSessionTime,
      end_reason,
      total_actions: sessionRef.current.featuresUsed.length,
      features_used: sessionRef.current.featuresUsed,
      engagement_score: calculateEngagementScore(sessionRef.current),
      session_quality: sessionQuality,
      user_id: userId,
      app_open_count: sessionRef.current.appOpenCount
    });

    // 이전 세션 종료 시간 기록
    sessionRef.current.previousSessionEnd = currentTime;

    // 세션 데이터 저장 (다음 시작 시 사용)
    AsyncStorage.setItem('user_session', JSON.stringify(sessionRef.current));
    AsyncStorage.setItem('last_session_end', currentTime.toString());

    // 인터벌 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log('🔚 사용자 세션 종료:', {
      sessionId: sessionRef.current.sessionId,
      totalDuration: `${(totalSessionTime / 1000).toFixed(2)}초`,
      endReason,
      sessionQuality,
      featuresUsed: sessionRef.current.featuresUsed.length
    });

    return {
      sessionId: sessionRef.current.sessionId,
      totalDuration: totalSessionTime,
      featuresUsed: sessionRef.current.featuresUsed,
      sessionQuality
    };
  }, [userId]);

  // 백그라운드 전환
  const handleBackground = useCallback(() => {
    backgroundStartTime.current = Date.now();
    sessionRef.current.isActive = false;

    const sessionDuration = backgroundStartTime.current - sessionRef.current.startTime;

    track(AMPLITUDE_KPI_EVENTS.APP_BACKGROUNDED, {
      session_id: sessionRef.current.sessionId,
      session_duration_at_background: sessionDuration,
      background_reason: 'user_action',
      user_id: userId
    });

    // 세션 데이터 저장
    AsyncStorage.setItem('user_session', JSON.stringify(sessionRef.current));

    console.log('📱 앱 백그라운드 전환:', {
      sessionId: sessionRef.current.sessionId,
      sessionDuration: `${(sessionDuration / 1000).toFixed(2)}초`
    });
  }, [userId]);

  // 포그라운드 복귀
  const handleForeground = useCallback(() => {
    const backgroundDuration = backgroundStartTime.current
      ? Date.now() - backgroundStartTime.current
      : 0;

    // 30초 이상 백그라운드였으면 새 세션 시작
    if (backgroundDuration > 30 * 60 * 1000) {
      endUserSession('background_timeout');
      startUserSession('background_return');
    } else {
      // 30초 미만이면 기존 세션 계속
      sessionRef.current.isActive = true;
      sessionRef.current.lastActiveTime = Date.now();
    }

    console.log('🔥 앱 포그라운드 복귀:', {
      backgroundDuration: `${(backgroundDuration / 1000).toFixed(2)}초`,
      isNewSession: backgroundDuration > 30 * 60 * 1000
    });
  }, [startUserSession, endUserSession, userId]);

  // 현재 세션 정보 가져오기
  const getCurrentSession = useCallback((): UserSessionData => {
    return sessionRef.current;
  }, []);

  // 세션 메트릭 가져오기
  const getSessionMetrics = useCallback((): SessionMetrics => {
    const currentTime = Date.now();
    const totalDuration = currentTime - sessionRef.current.startTime;

    return {
      totalDuration,
      activeDuration: sessionRef.current.totalSessionTime,
      backgroundDuration: backgroundStartTime.current ? currentTime - backgroundStartTime.current : 0,
      featuresUsed: sessionRef.current.featuresUsed,
      featureUsageTime: {}, // 추후 구현 가능
      appOpenCount: sessionRef.current.appOpenCount,
      sessionQuality: assessSessionQuality(sessionRef.current)
    };
  }, []);

  // 앱 상태 변경 감지
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        handleForeground();
      } else if (nextState === 'background') {
        handleBackground();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 컴포넌트 마운트 시 세션 초기화
    AsyncStorage.getItem('user_session').then(storedSession => {
      if (storedSession) {
        const savedSession: UserSessionData = JSON.parse(storedSession);

        // 세션 상태 확인 후 시작
        startUserSession('returning');
      } else {
        // 첫 실행인 경우
        startUserSession('new');
      }
    });

    return () => {
      subscription?.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // 컴포넌트 언마운트 시 세션 종료
      if (sessionRef.current.isActive) {
        endUserSession('app_close');
      }
    };
  }, [startUserSession, handleForeground, handleBackground, endUserSession]);

  // 사용자 ID 변경 시 세션 업데이트
  useEffect(() => {
    if (userId && sessionRef.current.userId !== userId) {
      sessionRef.current.userId = userId;

      // 로그인 이벤트 발송
      track(AMPLITUDE_KPI_EVENTS.AUTH_LOGIN_COMPLETED, {
        session_id: sessionRef.current.sessionId,
        user_id: userId,
        login_method: 'existing_session',
        session_duration: Date.now() - sessionRef.current.startTime
      });
    }
  }, [userId]);

  return {
    // 세션 제어
    startUserSession,
    endUserSession,

    // 기능 사용 추적
    startFeatureUsage,
    endFeatureUsage,

    // 세션 정보
    getCurrentSession,
    getSessionMetrics,

    // 상태 확인
    isSessionActive: () => sessionRef.current.isActive,
    getSessionId: () => sessionRef.current.sessionId
  };
};

// 헬퍼 함수들
function assessSessionQuality(session: UserSessionData): 'excellent' | 'good' | 'fair' | 'poor' {
  const sessionDuration = Date.now() - session.startTime;
  const featureCount = session.featuresUsed.length;

  // 세션 시간 기준
  let timeScore = 0;
  if (sessionDuration > 5 * 60 * 1000) timeScore = 4;      // 5분 이상
  else if (sessionDuration > 2 * 60 * 1000) timeScore = 3; // 2-5분
  else if (sessionDuration > 30 * 1000) timeScore = 2;      // 30초-2분
  else timeScore = 1;                                       // 30초 미만

  // 기능 사용 기준
  let featureScore = Math.min(featureCount, 4);

  const totalScore = (timeScore + featureScore) / 2;

  if (totalScore >= 3.5) return 'excellent';
  if (totalScore >= 2.5) return 'good';
  if (totalScore >= 1.5) return 'fair';
  return 'poor';
}

function calculateEngagementScore(session: UserSessionData): number {
  const sessionDuration = Date.now() - session.startTime;
  const featureCount = session.featuresUsed.length;

  // 시간 점수 (최대 50점)
  const timeScore = Math.min((sessionDuration / (5 * 60 * 1000)) * 50, 50);

  // 기능 사용 점수 (최대 30점)
  const featureScore = Math.min((featureCount / 5) * 30, 30);

  // 앱 오픈 횟수 점수 (최대 20점)
  const openCountScore = Math.min((session.appOpenCount / 10) * 20, 20);

  return Math.round(timeScore + featureScore + openCountScore);
}