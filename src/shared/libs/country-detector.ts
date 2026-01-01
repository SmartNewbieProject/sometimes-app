/**
 * i18n 언어 설정 기반 국가 감지 유틸리티
 */
import i18n from './i18n';

export type Country = 'KR' | 'JP';

/**
 * 현재 i18n 언어 설정에서 국가 코드 추론
 * i18n 초기화 전에 호출되면 fallback ('KR') 반환
 */
export const getCountryFromLocale = (): Country => {
  try {
    const language = i18n.language || i18n.options.lng;
    if (language === 'ko') return 'KR';
    if (language === 'ja') return 'JP';

    // i18n 초기화 전이거나 지원하지 않는 언어
    console.warn('[Country Detector] Unknown language, using fallback:', language);
    return 'KR'; // 기본값: 한국
  } catch (error) {
    console.error('[Country Detector] Error detecting country:', error);
    return 'KR'; // 에러 발생 시 안전한 기본값
  }
};
