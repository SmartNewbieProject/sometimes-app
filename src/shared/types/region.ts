/**
 * 지원 국가 enum
 */
export enum Country {
  KR = 'KR', // 한국
  JP = 'JP', // 일본
}

/**
 * 로케일 (언어)
 */
export enum Locale {
  KO = 'ko', // 한국어
  JA = 'ja', // 일본어
}

/**
 * 국가별 설정 인터페이스
 */
export interface RegionConfig {
  country: Country;
  locale: Locale;
  currency: 'KRW' | 'JPY';
  phoneFormat: string;
  apiBaseUrl?: string; // 국가별 API 서버 (필요 시)
}

/**
 * 국가별 기본 설정
 */
export const REGION_CONFIGS: Record<Country, RegionConfig> = {
  [Country.KR]: {
    country: Country.KR,
    locale: Locale.KO,
    currency: 'KRW',
    phoneFormat: '010-XXXX-XXXX',
  },
  [Country.JP]: {
    country: Country.JP,
    locale: Locale.JA,
    currency: 'JPY',
    phoneFormat: '+81-XX-XXXX-XXXX',
  },
};
