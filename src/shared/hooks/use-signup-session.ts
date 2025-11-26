import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '@amplitude/analytics-react-native';
import { AMPLITUDE_KPI_EVENTS } from '@/src/shared/constants/amplitude-kpi-events';

interface SignupSessionData {
  startTime: number;
  isAnonymous: boolean;
  totalTime: number;
  milestones: {
    app_launch: number;
    first_interaction?: number;
    signup_started?: number;
    profile_image_uploaded?: number;
    interest_selected?: number;
    signup_completed?: number;
  };
  interactions: {
    action: string;
    timestamp: number;
    duration?: number;
  }[];
}

interface SignupSessionResult {
  totalTime: number;
  milestones: SignupSessionData['milestones'];
  completionRate: number;
  dropOffPoints: string[];
  timePerMilestone: Record<string, number>;
}

export const useSignupSession = () => {
  const sessionRef = useRef<SignupSessionData>({
    startTime: 0,
    isAnonymous: true,
    totalTime: 0,
    milestones: {
      app_launch: 0
    },
    interactions: []
  });

  const backgroundTimeRef = useRef<number>(0);

  // 회원가입 세션 시작
  const startSignupSession = useCallback(() => {
    const startTime = Date.now();

    sessionRef.current = {
      startTime,
      isAnonymous: true,
      totalTime: 0,
      milestones: {
        app_launch: startTime
      },
      interactions: [{
        action: 'app_launch',
        timestamp: startTime
      }]
    };

    // 세션 데이터 저장
    AsyncStorage.setItem('signup_session', JSON.stringify(sessionRef.current));

    // 회원가입 세션 시작 이벤트
    track(AMPLITUDE_KPI_EVENTS.ONBOARDING_STARTED, {
      is_anonymous_user: true,
      session_start_time: startTime,
      env: __DEV__ ? 'development' : 'production'
    });

    console.log('📝 회원가입 세션 시작:', new Date(startTime).toISOString());
  }, []);

  // 마일스톤 기록
  const recordMilestone = useCallback((milestone: keyof SignupSessionData['milestones'], additionalData?: any) => {
    const currentTime = Date.now();

    if (!sessionRef.current.milestone) {
      sessionRef.current.startTime = currentTime;
      sessionRef.current.milestones.app_launch = currentTime;
    }

    sessionRef.current.milestones[milestone] = currentTime;

    // 상호작용 기록
    sessionRef.current.interactions.push({
      action: milestone,
      timestamp: currentTime,
      duration: currentTime - sessionRef.current.startTime
    });

    // 세션 데이터 업데이트
    AsyncStorage.setItem('signup_session', JSON.stringify(sessionRef.current));

    // 마일스톤 이벤트 발송
    const milestoneEvents = {
      signup_started: AMPLITUDE_KPI_EVENTS.SIGNUP_STARTED,
      profile_image_uploaded: AMPLITUDE_KPI_EVENTS.SIGNUP_PROFILE_IMAGE_UPLOADED,
      interest_selected: AMPLITUDE_KPI_EVENTS.SIGNUP_INTEREST_SELECTED,
      signup_completed: AMPLITUDE_KPI_EVENTS.SIGNUP_COMPLETED
    };

    if (milestoneEvents[milestone]) {
      const timeFromStart = currentTime - sessionRef.current.startTime;

      track(milestoneEvents[milestone], {
        time_from_app_launch: timeFromStart,
        milestone_step: milestone,
        session_duration: timeFromStart,
        is_anonymous_user: true,
        ...additionalData
      });
    }

    console.log(`🏃 마일스톤 기록: ${milestone}`, {
      timeFromStart: currentTime - sessionRef.current.startTime,
      totalInteractions: sessionRef.current.interactions.length
    });
  }, []);

  // 회원가입 세션 완료
  const completeSignupSession = useCallback((userData?: any) => {
    const endTime = Date.now();
    const totalTime = endTime - sessionRef.current.startTime;

    const sessionResult: SignupSessionResult = {
      totalTime,
      milestones: sessionRef.current.milestones,
      completionRate: calculateCompletionRate(sessionRef.current.milestones),
      dropOffPoints: findDropOffPoints(sessionRef.current.milestones),
      timePerMilestone: calculateTimePerMilestone(sessionRef.current.milestones)
    };

    // 최종 회원가입 완료 이벤트
    track(AMPLITUDE_KPI_EVENTS.SIGNUP_COMPLETED, {
      total_signup_time: totalTime,
      completion_rate: sessionResult.completionRate,
      time_per_milestone: sessionResult.timePerMilestone,
      drop_off_points: sessionResult.dropOffPoints,
      total_interactions: sessionRef.current.interactions.length,
      user_data: userData ? {
        has_profile_image: !!userData.profileImage,
        interest_count: userData.interests?.length || 0,
        profile_completion_rate: userData.profileCompletionRate || 0
      } : undefined
    });

    // 세션 데이터 정리
    AsyncStorage.removeItem('signup_session');

    console.log('✅ 회원가입 세션 완료:', {
      totalTime: `${(totalTime / 1000).toFixed(2)}초`,
      completionRate: `${sessionResult.completionRate}%`,
      milestones: Object.keys(sessionResult.milestones).length
    });

    return sessionResult;
  }, []);

  // 세션 중단 처리
  const abortSignupSession = useCallback((reason: string, lastMilestone?: string) => {
    const endTime = Date.now();
    const totalTime = endTime - sessionRef.current.startTime;

    const sessionResult: SignupSessionResult = {
      totalTime,
      milestones: sessionRef.current.milestones,
      completionRate: calculateCompletionRate(sessionRef.current.milestones),
      dropOffPoints: findDropOffPoints(sessionRef.current.milestones),
      timePerMilestone: calculateTimePerMilestone(sessionRef.current.milestones)
    };

    // 회원가입 중단 이벤트
    track('Signup_Abandoned', {
      total_time_spent: totalTime,
      last_milestone: lastMilestone || 'app_launch',
      completion_rate: sessionResult.completionRate,
      drop_off_reason: reason,
      time_per_milestone: sessionResult.timePerMilestone,
      total_interactions: sessionRef.current.interactions.length
    });

    // 세션 데이터 정리
    AsyncStorage.removeItem('signup_session');

    console.log('❌ 회원가입 세션 중단:', {
      totalTime: `${(totalTime / 1000).toFixed(2)}초`,
      lastMilestone,
      reason,
      completionRate: `${sessionResult.completionRate}%`
    });

    return sessionResult;
  }, []);

  // 백그라운드/포그라운드 처리
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        backgroundTimeRef.current = Date.now();

        // 백그라운드 전환 시 현재 세션 저장
        AsyncStorage.setItem('signup_session', JSON.stringify(sessionRef.current));

      } else if (nextState === 'active') {
        // 포그라운드 복귀 시 세션 복원
        AsyncStorage.getItem('signup_session').then(storedSession => {
          if (storedSession) {
            sessionRef.current = JSON.parse(storedSession);

            const backgroundDuration = Date.now() - backgroundTimeRef.current;

            // 5분 이상 백그라운드였으면 세션 초기화
            if (backgroundDuration > 5 * 60 * 1000) {
              startSignupSession();
            }
          } else if (sessionRef.current.isAnonymous) {
            // 저장된 세션이 없으면 새로 시작
            startSignupSession();
          }
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // 컴포넌트 마운트 시 세션 확인
    AsyncStorage.getItem('signup_session').then(storedSession => {
      if (storedSession) {
        sessionRef.current = JSON.parse(storedSession);
        console.log('📱 저장된 회원가입 세션 복원');
      } else {
        startSignupSession();
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [startSignupSession]);

  return {
    startSignupSession,
    recordMilestone,
    completeSignupSession,
    abortSignupSession,
    getCurrentSession: () => sessionRef.current,
    getSessionTime: () => Date.now() - sessionRef.current.startTime,
    isSessionActive: () => sessionRef.current.isAnonymous
  };
};

// 헬퍼 함수들
function calculateCompletionRate(milestones: SignupSessionData['milestones']): number {
  const possibleMilestones = [
    'app_launch',
    'signup_started',
    'profile_image_uploaded',
    'interest_selected',
    'signup_completed'
  ];

  const completedMilestones = possibleMilestones.filter(milestone => milestones[milestone]);

  return Math.round((completedMilestones.length / possibleMilestones.length) * 100);
}

function findDropOffPoints(milestones: SignupSessionData['milestones']): string[] {
  const allMilestones = [
    'app_launch',
    'signup_started',
    'profile_image_uploaded',
    'interest_selected',
    'signup_completed'
  ];

  const dropOffPoints: string[] = [];
  let foundIncomplete = false;

  for (const milestone of allMilestones) {
    if (foundIncomplete || !milestones[milestone]) {
      dropOffPoints.push(milestone);
      foundIncomplete = true;
    }
  }

  return dropOffPoints;
}

function calculateTimePerMilestone(milestones: SignupSessionData['milestones']): Record<string, number> {
  const times: Record<string, number> = {};
  const sortedMilestones = Object.entries(milestones)
    .filter(([_, time]) => time > 0)
    .sort(([_, a], [__, b]) => a - b);

  for (let i = 0; i < sortedMilestones.length; i++) {
    const [milestone, timestamp] = sortedMilestones[i];
    const previousTimestamp = i > 0 ? sortedMilestones[i - 1][1] : milestones.app_launch;

    times[milestone] = timestamp - previousTimestamp;
  }

  return times;
}