/**
 * Sometimes 앱 공통 날짜 유틸리티 모듈
 * Day.js 기반 한국 시간대(UTC+9) 처리
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import 'dayjs/locale/ko';

// Day.js 플러그인 확장
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('ko', {
  weekStart: 1,
});

// 한국 시간대 기본 설정
export const KOREAN_TIMEZONE = 'Asia/Seoul';

/**
 * 현재 한국 시간대 날짜/시간 반환
 */
export const now = (): dayjs.Dayjs => {
  return dayjs().tz(KOREAN_TIMEZONE);
};

/**
 * 특정 날짜를 한국 시간대로 변환
 */
export const create = (date?: string | number | Date | dayjs.Dayjs): dayjs.Dayjs => {
  return date ? dayjs(date).tz(KOREAN_TIMEZONE) : dayjs().tz(KOREAN_TIMEZONE);
};

/**
 * 날짜 포맷팅
 */
export const format = (
  date: string | number | Date | dayjs.Dayjs,
  formatStr: string = 'YYYY-MM-DD HH:mm:ss',
): string => {
  return dayjs(date).tz(KOREAN_TIMEZONE).format(formatStr);
};

/**
 * 날짜 더하기
 */
export const add = (
  date: string | number | Date | dayjs.Dayjs,
  amount: number,
  unit: dayjs.ManipulateType,
): dayjs.Dayjs => {
  return dayjs(date).tz(KOREAN_TIMEZONE).add(amount, unit);
};

/**
 * 날짜 빼기
 */
export const subtract = (
  date: string | number | Date | dayjs.Dayjs,
  amount: number,
  unit: dayjs.ManipulateType,
): dayjs.Dayjs => {
  return dayjs(date).tz(KOREAN_TIMEZONE).subtract(amount, unit);
};

/**
 * 날짜 비교 (이전)
 */
export const isBefore = (
  date1: string | number | Date | dayjs.Dayjs,
  date2: string | number | Date | dayjs.Dayjs,
): boolean => {
  return dayjs(date1).tz(KOREAN_TIMEZONE).isBefore(dayjs(date2).tz(KOREAN_TIMEZONE));
};

/**
 * 날짜 비교 (이후)
 */
export const isAfter = (
  date1: string | number | Date | dayjs.Dayjs,
  date2: string | number | Date | dayjs.Dayjs,
): boolean => {
  return dayjs(date1).tz(KOREAN_TIMEZONE).isAfter(dayjs(date2).tz(KOREAN_TIMEZONE));
};

/**
 * 날짜 비교 (동일)
 */
export const isSame = (
  date1: string | number | Date | dayjs.Dayjs,
  date2: string | number | Date | dayjs.Dayjs,
  unit?: dayjs.OpUnitType,
): boolean => {
  return dayjs(date1).tz(KOREAN_TIMEZONE).isSame(dayjs(date2).tz(KOREAN_TIMEZONE), unit);
};

/**
 * 날짜의 시작점으로 설정
 */
export const startOf = (
  date: string | number | Date | dayjs.Dayjs,
  unit: dayjs.OpUnitType,
): dayjs.Dayjs => {
  return dayjs(date).tz(KOREAN_TIMEZONE).startOf(unit);
};

/**
 * 날짜의 끝점으로 설정
 */
export const endOf = (
  date: string | number | Date | dayjs.Dayjs,
  unit: dayjs.OpUnitType,
): dayjs.Dayjs => {
  return dayjs(date).tz(KOREAN_TIMEZONE).endOf(unit);
};

/**
 * 한국 시간대 기준 오늘 날짜 (YYYY-MM-DD)
 */
export const getKoreanToday = (): string => {
  return dayjs().tz(KOREAN_TIMEZONE).format('YYYY-MM-DD');
};

/**
 * 한국 시간대 기준 오늘 날짜 (MM-DD)
 */
export const getKoreanTodayShort = (): string => {
  return dayjs().tz(KOREAN_TIMEZONE).format('MM-DD');
};

/**
 * 한국 시간대 기준 어제 날짜 (YYYY-MM-DD)
 */
export const getKoreanYesterday = (): string => {
  return dayjs().tz(KOREAN_TIMEZONE).subtract(1, 'day').format('YYYY-MM-DD');
};

/**
 * 한국 시간대 기준 이번 주 월요일 날짜
 */
export const getKoreanThisFriday = (): string => {
  return dayjs().tz(KOREAN_TIMEZONE).day(5).format('YYYY-MM-DD');
};

/**
 * 한국 시간대 기준 이번 주 일요일 날짜
 */
export const getKoreanThisSunday = (): string => {
  return dayjs().tz(KOREAN_TIMEZONE).day(0).format('YYYY-MM-DD');
};

/**
 * 한국 시간대 기준 시간대별 세션 분류
 */
export const getTimeBasedSessionType = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = dayjs().tz(KOREAN_TIMEZONE).hour();

  if (hour >= 6 && hour < 12) {
    return 'morning';    // 오전 6-12시
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';  // 오후 12-18시
  } else if (hour >= 18 && hour < 24) {
    return 'evening';    // 저녁 18-24시
  } else {
    return 'night';      // 밤 0-6시
  }
};

/**
 * 한국 시간대 기준 자정 시간 확인
 */
export const isMidnightKST = (): boolean => {
  return dayjs().tz(KOREAN_TIMEZONE).hour() === 0;
};

/**
 * 한국 시간대 기준 주말 여부 확인
 */
export const isWeekend = (): boolean => {
  const day = dayjs().tz(KOREAN_TIMEZONE).day();
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
};

/**
 * 한국 시간대 기준 평일 여부 확인
 */
export const isWeekday = (): boolean => {
  return !isWeekend();
};

/**
 * 윤년 여부 확인
 */
export const isLeapYear = (year?: number): boolean => {
  const targetYear = year || dayjs().tz(KOREAN_TIMEZONE).year();
  return ((targetYear % 4 === 0) && (targetYear % 100 !== 0)) || (targetYear % 400 === 0);
};

/**
 * 월의 마지막 날짜 가져오기
 */
export const getEndOfMonth = (date?: string | number | Date | dayjs.Dayjs): dayjs.Dayjs => {
  return create(date).endOf('month');
};

/**
 * 월의 시작 날짜 가져오기
 */
export const getStartOfMonth = (date?: string | number | Date | dayjs.Dayjs): dayjs.Dayjs => {
  return create(date).startOf('month');
};

/**
 * 해당 월의 총 일수 가져오기
 */
export const getDaysInMonth = (date?: string | number | Date | dayjs.Dayjs): number => {
  const endOfMonth = getEndOfMonth(date);
  const startOfMonth = getStartOfMonth(date);
  return endOfMonth.diff(startOfMonth, 'day') + 1;
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (
  startDate: string | number | Date | dayjs.Dayjs,
  endDate: string | number | Date | dayjs.Dayjs,
): number => {
  return create(endDate).diff(create(startDate), 'day');
};

/**
 * 나이 계산 (연 단위)
 */
export const getYearsBetween = (
  startDate: string | number | Date | dayjs.Dayjs,
  endDate: string | number | Date | dayjs.Dayjs,
): number => {
  return create(endDate).diff(create(startDate), 'year');
};

/**
 * 현재 나이 계산
 */
export const getCurrentAge = (birthDate: string | number | Date | dayjs.Dayjs): number => {
  return getYearsBetween(birthDate, now());
};

/**
 * 날짜를 타임스탬프로 변환
 */
export const toTimestamp = (date: string | number | Date | dayjs.Dayjs): number => {
  return create(date).valueOf();
};

/**
 * 타임스탬프를 날짜로 변환
 */
export const fromTimestamp = (timestamp: number): dayjs.Dayjs => {
  return dayjs(timestamp).tz(KOREAN_TIMEZONE);
};

/**
 * 윤리티: 윤년 주간 주차 계산 (기존 코드 호환성)
 */
export const getWeekNumber = (date?: Date): number => {
  const targetDate = date || create().toDate();
  const d = new Date(Date.UTC(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

/**
 * 윤리티: 연도 가져오기 (기존 코드 호환성)
 */
export const getYear = (date?: Date): number => {
  const targetDate = date || create().toDate();
  return targetDate.getFullYear();
};

/**
 * 타임존 정보 테스트 (개발 환경에서만)
 */
export const testTimeZoneHandling = (): void => {
  if (__DEV__) {
    console.log('\n🕒 === 한국 시간대 테스트 (Day.js) ===');
    const now = dayjs().tz(KOREAN_TIMEZONE);
    console.log('Current KST time:', now.format('YYYY-MM-DD HH:mm:ss Z'));
    console.log('Current KST date:', now.format('YYYY-MM-DD'));
    console.log('Session type:', getTimeBasedSessionType());
    console.log('Is midnight KST?', isMidnightKST());
    console.log('Is weekend?', isWeekend());
    console.log('Timezone:', KOREAN_TIMEZONE);
    console.log('UTC time:', dayjs().utc().format('YYYY-MM-DD HH:mm:ss Z'));
    console.log('========================\n');
  }
};

// 자동 테스트 실행
testTimeZoneHandling();