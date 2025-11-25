/**
 * Sometimes 앱 DAU 측정을 위한 앱 사용 추적 유틸리티
 * 한국 시간대(UTC+9) 기준 날짜 중복 제거 로직 포함
 * Day.js 공통 모듈 활용으로 간소화
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getKoreanToday, getTimeBasedSessionType } from './date-utils';

const STORAGE_KEYS = {
  LAST_TRACKED_DATE: '@sometimes/last_tracked_date',
  DAILY_OPEN_COUNT: '@sometimes/daily_open_count',
  APP_VERSION: '@sometimes/app_version',
} as const;

interface DailyAppStats {
  lastTrackedDate: string;
  dailyOpenCount: number;
  appVersion: string;
  sessionTimeType: 'morning' | 'afternoon' | 'evening' | 'night';
  kstTimestamp: string;
}

// 🗑️ 이 함수는 date-utils.ts의 getKoreanToday()를 사용하세요
// export { getKoreanToday } from './date-utils';

// 🗑️ 이 함수는 date-utils.ts의 getTimeBasedSessionType()를 사용하세요
// export { getTimeBasedSessionType } from './date-utils';


/**
 * 현재 앱 버전 가져오기
 */
const getCurrentAppVersion = (): string => {
  // 실제 앱 버전 정보로 수정 필요
  // package.json이나 expo-constants에서 가져오기
  try {
    return '1.0.0'; // 임시값 - 실제 버전으로 교체 필요
  } catch (error) {
    return 'unknown';
  }
};

/**
 * APP_OPENED 이벤트를 발생시켜야 하는지 확인 (한국 시간대 기준)
 */
export const shouldTrackAppOpen = async (): Promise<boolean> => {
  try {
    const today = getKoreanTodayDate();
    const lastTrackedDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TRACKED_DATE);
    const currentAppVersion = await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION);

    // 날짜가 바뀌었거나, 앱 버전이 업데이트되었으면 이벤트 발생
    const shouldTrack = lastTrackedDate !== today || currentAppVersion !== getCurrentAppVersion();

    if (shouldTrack) {
      // 새로운 날짜 정보 저장
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.LAST_TRACKED_DATE, today],
        [STORAGE_KEYS.APP_VERSION, getCurrentAppVersion()],
        [STORAGE_KEYS.DAILY_OPEN_COUNT, '1'],
      ]);

      console.log(`[AppTracker] 🆕 New KST day detected: ${today}, tracking APP_OPENED`);
    } else {
      // 같은 날짜면 열기 횟수만 증가
      const currentCount = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_OPEN_COUNT);
      const newCount = (parseInt(currentCount || '0') + 1).toString();
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_OPEN_COUNT, newCount);

      console.log(`[AppTracker] Same KST day, open count: ${newCount}`);
    }

    return shouldTrack;
  } catch (error) {
    console.error('[AppTracker] Error checking app open tracking:', error);
    // 에러 발생 시 이벤트 발생하여 데이터 누락 방지
    return true;
  }
};

/**
 * 일일 앱 사용 통계 가져오기
 */
export const getDailyAppStats = async (): Promise<DailyAppStats> => {
  try {
    const lastTrackedDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TRACKED_DATE) || '';
    const dailyOpenCount = parseInt(await AsyncStorage.getItem(STORAGE_KEYS.DAILY_OPEN_COUNT) || '0');
    const appVersion = await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION) || '';

    return {
      lastTrackedDate,
      dailyOpenCount,
      appVersion,
      sessionTimeType: getTimeBasedSessionType(),
      kstTimestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[AppTracker] Error getting daily stats:', error);
    return {
      lastTrackedDate: '',
      dailyOpenCount: 0,
      appVersion: '',
      sessionTimeType: 'morning',
      kstTimestamp: new Date().toISOString(),
    };
  }
};

/**
 * 스토리지 초기화 (앱 초기화 시 호출)
 */
export const initializeAppTracker = async (): Promise<void> => {
  try {
    // 앱 버전이 변경되었을 경우 이전 데이터 정리
    const currentVersion = getCurrentAppVersion();
    const storedVersion = await AsyncStorage.getItem(STORAGE_KEYS.APP_VERSION);

    if (storedVersion && storedVersion !== currentVersion) {
      console.log(`[AppTracker] App version updated: ${storedVersion} → ${currentVersion}`);
      // 필요하다면 이전 버전 데이터 마이그레이션 로직 추가
    }
  } catch (error) {
    console.error('[AppTracker] Error initializing app tracker:', error);
  }
};


// 자동 스토리지 초기화 (모듈 로드 시)
initializeAppTracker();