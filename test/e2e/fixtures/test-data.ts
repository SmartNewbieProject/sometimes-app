/**
 * E2E 테스트용 테스트 데이터
 */

export const TEST_USERS = {
  newUser: {
    phoneNumber: '01012345678',
    verificationCode: '000000', // 테스트 환경에서 사용하는 고정 코드
    name: '테스트유저',
    birthdate: '1995-01-01',
    gender: '남성',
    nickname: `테스터${Date.now()}`,
    university: '서울대학교',
  },
  existingUser: {
    phoneNumber: '01098765432',
    verificationCode: '000000',
  },
};

export const TEST_PROFILE = {
  mbti: 'ENFP',
  interests: ['영화감상', '운동', '여행'],
  height: 175,
  location: '서울특별시 강남구',
  bio: '안녕하세요! 만나서 반갑습니다 :)',
};

export const TEST_CHAT = {
  message: '안녕하세요!',
  longMessage: '이것은 긴 메시지입니다. '.repeat(10),
  emoji: '👋',
};

export const TEST_COMMUNITY = {
  post: {
    title: '테스트 게시글',
    content: '이것은 테스트용 게시글입니다.',
  },
  comment: '좋은 글이네요!',
};

export const TEST_MOMENT = {
  caption: '오늘의 순간 #일상 #행복',
  hashtags: ['일상', '행복', '좋은날'],
};

/**
 * 환경별 설정
 */
export const TEST_CONFIG = {
  // 로컬 개발 환경
  local: {
    baseURL: 'http://localhost:19006',
    apiURL: 'http://localhost:3000',
  },
  // 스테이징 환경
  staging: {
    baseURL: 'https://staging.sometimes.app',
    apiURL: 'https://api-staging.sometimes.app',
  },
  // 프로덕션 환경 (읽기 전용 테스트만)
  production: {
    baseURL: 'https://sometimes.app',
    apiURL: 'https://api.sometimes.app',
  },
};

/**
 * 현재 환경에 맞는 설정 가져오기
 */
export function getTestConfig() {
  const env = process.env.TEST_ENV || 'local';
  return TEST_CONFIG[env as keyof typeof TEST_CONFIG] || TEST_CONFIG.local;
}
