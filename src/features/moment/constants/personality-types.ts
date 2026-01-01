// 성격 유형 영문 키와 한국어 레이블 매핑
export const PERSONALITY_TYPE_LABELS = {
  openness: "감정 개방성",
  agreeableness: "관계 안정감",
  neuroticism: "갈등 성숙도",
  conscientiousness: "가치 명확성",
  extraversion: "열린 태도"
} as const;

// 영문 키 타입 정의
export type PersonalityTypeKey = keyof typeof PERSONALITY_TYPE_LABELS;

// 한국어 레이블 타입 정의
export type PersonalityTypeLabel = typeof PERSONALITY_TYPE_LABELS[PersonalityTypeKey];

// 영문 키 목록
export const PERSONALITY_TYPE_KEYS: PersonalityTypeKey[] = [
  'openness',
  'agreeableness',
  'neuroticism',
  'conscientiousness',
  'extraversion'
];

// 유틸리티 함수: 영문 키로 한국어 레이블 조회
export const getPersonalityTypeLabel = (key: PersonalityTypeKey): PersonalityTypeLabel => {
  return PERSONALITY_TYPE_LABELS[key] || key;
};

// 유틸리티 함수: 영문 키인지 확인
export const isPersonalityTypeKey = (key: string): key is PersonalityTypeKey => {
  return key in PERSONALITY_TYPE_LABELS;
};