/**
 * JP 전화번호 포맷 유틸리티
 *
 * 일본 휴대폰 번호 형식:
 * - 로컬: 090-1234-5678 (11자리, 0으로 시작)
 * - 국제: +81-90-1234-5678 (국가코드 포함)
 */

/**
 * 입력된 전화번호를 API 요청용 국제 형식으로 변환
 * 예: "09012345678" → "+81-90-1234-5678"
 * 테스트: "01026554276" → "+82-10-2655-4276"
 */
export const formatJpPhoneForApi = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  // 한국 번호 처리 (테스트용)
  if (cleaned.startsWith('010') && cleaned.length === 11) {
    const firstPart = cleaned.slice(1, 3);
    const secondPart = cleaned.slice(3, 7);
    const thirdPart = cleaned.slice(7);
    return `+82-${firstPart}-${secondPart}-${thirdPart}`;
  }

  // 일본 번호 처리
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const areaCode = cleaned.slice(1, 3);
    const firstPart = cleaned.slice(3, 7);
    const secondPart = cleaned.slice(7);
    return `+81-${areaCode}-${firstPart}-${secondPart}`;
  }

  if (cleaned.startsWith('81') && cleaned.length === 12) {
    const areaCode = cleaned.slice(2, 4);
    const firstPart = cleaned.slice(4, 8);
    const secondPart = cleaned.slice(8);
    return `+81-${areaCode}-${firstPart}-${secondPart}`;
  }

  return `+81-${cleaned}`;
};

/**
 * 전화번호를 사용자 친화적인 표시 형식으로 변환
 * 예: "09012345678" → "090-1234-5678"
 */
export const formatJpPhoneDisplay = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length >= 10) {
    const digits = cleaned.startsWith('0') ? cleaned : `0${cleaned}`;
    if (digits.length === 11) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
  }

  return phone;
};

/**
 * 테스트용 번호 패턴
 * 2655-4276이 포함된 번호는 테스트 번호로 인식
 */
const TEST_PHONE_PATTERN = '26554276';

/**
 * 테스트 번호 여부 확인
 * 번호에 2655-4276 패턴이 포함되어 있으면 테스트 번호로 간주
 */
export const isTestPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.includes(TEST_PHONE_PATTERN);
};

/**
 * 일본 휴대폰 번호 유효성 검사
 * - 070, 080, 090으로 시작하는 11자리
 * - 테스트 번호 (2655-4276 패턴 포함): 항상 허용
 */
export const validateJpPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');

  // 테스트용 번호 체크 (2655-4276 패턴 포함)
  if (isTestPhoneNumber(cleaned)) {
    return cleaned.length >= 10;
  }

  // 일본 번호 형식 검사
  if (cleaned.startsWith('0')) {
    return /^0[789]0\d{8}$/.test(cleaned);
  }

  if (cleaned.startsWith('81')) {
    return /^81[789]0\d{8}$/.test(cleaned);
  }

  if (cleaned.length === 10 && /^[789]0\d{8}$/.test(cleaned)) {
    return true;
  }

  return false;
};

/**
 * 입력 중인 전화번호 자동 포맷팅
 * 타이핑할 때마다 하이픈 자동 삽입
 */
export const autoFormatJpPhoneInput = (input: string): string => {
  const cleaned = input.replace(/\D/g, '').slice(0, 11);

  if (cleaned.length <= 3) {
    return cleaned;
  }
  if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
};
