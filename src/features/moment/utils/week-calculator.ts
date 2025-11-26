import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { KOREAN_TIMEZONE } from '@/src/shared/utils/date-utils';

// Day.js 플러그인 확장
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 한국 시간대 기준으로 현재 주차 정보를 계산합니다.
 */
export const getCurrentWeekInfo = () => {
  const now = dayjs().tz(KOREAN_TIMEZONE);
  
  // ISO 8601 기준 주차 계산 (월요일 시작)
  const weekNumber = now.isoWeek();
  const year = now.year();
  
  return {
    weekNumber,
    year,
  };
};

/**
 * 특정 날짜의 주차 정보를 계산합니다.
 */
export const getWeekInfo = (date?: string | number | Date | dayjs.Dayjs) => {
  const targetDate = date ? dayjs(date).tz(KOREAN_TIMEZONE) : dayjs().tz(KOREAN_TIMEZONE);
  
  const weekNumber = targetDate.isoWeek();
  const year = targetDate.year();
  
  return {
    weekNumber,
    year,
  };
};

/**
 * 한국 시간대 기준으로 해당 연도의 총 주차 수를 반환합니다.
 */
export const getTotalWeeksInYear = (year?: number): number => {
  const targetYear = year || dayjs().tz(KOREAN_TIMEZONE).year();
  const lastWeek = dayjs(`${targetYear}-12-31`).tz(KOREAN_TIMEZONE).isoWeek();
  
  // 12월 31일이 해당 연도의 첫 주에 속할 경우를 대비
  return lastWeek === 1 ? 52 : lastWeek;
};

/**
 * 주차 정보가 유효한지 확인합니다.
 */
export const isValidWeekInfo = (weekNumber: number, year: number): boolean => {
  if (weekNumber < 1 || weekNumber > 53) return false;
  if (year < 2020 || year > 2100) return false;
  
  const totalWeeks = getTotalWeeksInYear(year);
  return weekNumber <= totalWeeks;
};