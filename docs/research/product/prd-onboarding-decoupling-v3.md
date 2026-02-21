---
linear_id: "c112527a-a600-43a5-85ea-d61ea6ef810f"
title: "PRD: 온보딩 디커플링 전략 - \"선체험, 후가입\" (v3.0)"
url: "https://linear.app/smartnewbie/document/prd-온보딩-디커플링-전략-선체험-후가입-v30-52b50efe47fa"
creator_email: "smartnewb2@gmail.com"
created_at: "2026-01-02T16:00:58.275Z"
updated_at: "2026-01-06T02:47:31.347Z"
---
# PRD: 가치 선행 디커플링 전략

## "선체험, 후가입" - 전환율 3배 향상 프로젝트

**작성일**: 2026-01-03
**버전**: v3.0 (Final)
**예상 기간**: 7주
**상태**: 기술 피칭 준비 완료

---

## Executive Summary

### 핵심 문제

```
현재: 광고 → 앱스토어 → 로그인 → 7단계 가입 → 11슬라이드 온보딩 → 홈
전환율: <1% (광고 → 가입 완료)
소요 시간: 5-7분
```

### 해결 전략: 디커플링

```
변경: 광고 → 가치 체험(가입 없이) → 결과 저장 시 가입(4단계) → 간소화 온보딩(4슬라이드) → 홈
목표 전환율: 3%+
목표 소요 시간: 2분
```

### 신경과학적 근거

| 현상 | 메커니즘 | 적용 |
| -- | -- | -- |
| **보유 효과** | 내가 만든 것 = 내 것 | 퀴즈 결과를 "내 것"으로 인식 |
| **손실 회피** | 잃는 고통 > 얻는 기쁨 | "저장하면 맞춤 매칭 시작" |
| **긍정적 RPE** | 기대 < 실제 보상 → 도파민↑ | 가입 없이 바로 체험 |

### 핵심 변경 요약

| 항목 | 현재 | 변경 |
| -- | -- | -- |
| 가입 전 체험 | 없음 | 이상형 퀴즈 (5문항, 30초) |
| 가입 단계 | 7단계 | **4단계** |
| 온보딩 | 11슬라이드 | **4슬라이드** |
| 프로필 사진 | 3장 필수 | **1장 필수** + 2장 권장 |
| 인스타/초대코드 | 가입 시 | 홈에서 지연 수집 |

---

## 1\. 현재 시스템 분석 (코드베이스 기준)

### 1.1 현재 회원가입 플로우 (7단계)

```
SignupSteps (src/features/signup/hooks/use-signup-progress.tsx):
├── UNIVERSITY = 1      # 대학교 검색/선택
├── UNIVERSITY_DETAIL = 2  # 학과/학년/학번
├── INSTAGRAM = 3       # 인스타그램 ID (선택)
├── PROFILE_IMAGE = 4   # 프로필 사진 3장
└── INVITE_CODE = 5     # 초대코드 (선택)

+ cluster 확인 화면 (university-cluster.tsx)
+ 완료 화면 (done.tsx)
= 실제 7개 화면
```

### 1.2 현재 로그인 옵션

```
// app/auth/login/index.tsx → LoginForm
KR: PASS 인증, 카카오 로그인, Apple 로그인
JP: SMS 인증, Apple 로그인
```

### 1.3 현재 온보딩 (11슬라이드)

```
src/features/onboarding/ui/:
├── slide-welcome.tsx
├── slide-story.tsx
├── slide-matching-time.tsx
├── slide-verification.tsx
├── slide-student-only.tsx
├── slide-ai-matching.tsx
├── slide-like-guide.tsx
├── slide-chat-guide.tsx
├── slide-refund.tsx
├── slide-region.tsx
└── slide-cta.tsx
```

### 1.4 재활용 가능한 기존 기능

| 기능 | 위치 | 활용 방안 |
| -- | -- | -- |
| Interest (취향설정) | `app/interest/*` | 퀴즈 선택지 로직 참고 |
| OppositeGenderPreview | `widgets/opposite-gender-preview` | 결과 화면 미리보기 UI |
| UniversityLogos | `features/signup/ui/university-logos` | 신뢰감 UI 컴포넌트 |
| use-interest-form | `features/interest/hooks/` | 폼 상태 관리 로직 |

---

## 2\. 변경 요구사항

### 2.1 Phase 1: 즉각 가치 체험 (신규)

#### A. 이상형 퀴즈 (비회원 체험)

**목적**: 도파민 보상 + 심리적 소유권 생성

```
퀴즈 흐름:
1. 랜딩/로그인 화면 CTA: "내 이상형 분석해보기 (30초)"
2. 5문항 퀴즈 (가입 없이 진행)
3. 결과 화면 + 학교 현황
4. CTA: "결과 저장하고 매칭 시작하기" → 가입 유도
```

**퀴즈 문항 설계**:

```
// src/features/quiz/constants/questions.ts
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "첫 데이트 장소는?",
    options: [
      { id: 'a', text: "분위기 좋은 카페", trait: 'romantic' },
      { id: 'b', text: "재밌는 영화관", trait: 'playful' },
      { id: 'c', text: "여유로운 공원 산책", trait: 'calm' },
      { id: 'd', text: "맛있는 맛집 탐방", trait: 'adventurous' },
    ]
  },
  {
    id: 2,
    question: "의견 충돌이 생기면?",
    options: [
      { id: 'a', text: "바로 대화로 해결", trait: 'direct' },
      { id: 'b', text: "서로 생각할 시간 갖기", trait: 'reflective' },
      { id: 'c', text: "일단 분위기 풀고 나중에", trait: 'harmonious' },
      { id: 'd', text: "각자 입장 명확히 정리", trait: 'logical' },
    ]
  },
  {
    id: 3,
    question: "연락 스타일은?",
    options: [
      { id: 'a', text: "수시로 일상 공유", trait: 'frequent' },
      { id: 'b', text: "하루 한 번 안부", trait: 'moderate' },
      { id: 'c', text: "필요할 때만 연락", trait: 'independent' },
      { id: 'd', text: "문자보다 전화파", trait: 'voice' },
    ]
  },
  {
    id: 4,
    question: "이상적인 주말은?",
    options: [
      { id: 'a', text: "함께 액티비티", trait: 'active' },
      { id: 'b', text: "집에서 같이 휴식", trait: 'homebody' },
      { id: 'c', text: "새로운 곳 여행", trait: 'explorer' },
      { id: 'd', text: "각자 시간 + 저녁 데이트", trait: 'balanced' },
    ]
  },
  {
    id: 5,
    question: "끌리는 매력은?",
    options: [
      { id: 'a', text: "다정하고 따뜻한", trait: 'warm' },
      { id: 'b', text: "똑똑하고 유머있는", trait: 'witty' },
      { id: 'c', text: "열정적이고 당당한", trait: 'confident' },
      { id: 'd', text: "차분하고 신뢰가는", trait: 'stable' },
    ]
  },
];
```

**결과 계산 로직**:

```
// src/features/quiz/utils/calculate-result.ts

interface QuizResult {
  idealType: string;
  typeEmoji: string;
  description: string;
  matchScore: number;
  traits: string[];
}

const IDEAL_TYPES: Record<string, QuizResult> = {
  'romantic_reflective_moderate_homebody_warm': {
    idealType: '따뜻한 힐링형',
    typeEmoji: '🌷',
    description: '편안하고 다정한 관계를 원하는 당신',
    matchScore: 87,
    traits: ['다정함', '안정감', '배려'],
  },
  'playful_direct_frequent_active_witty': {
    idealType: '에너지 넘치는 활발형',
    typeEmoji: '⚡',
    description: '함께 웃고 즐기는 관계를 원하는 당신',
    matchScore: 85,
    traits: ['유머', '적극성', '솔직함'],
  },
  'adventurous_logical_independent_explorer_confident': {
    idealType: '자유로운 탐험가형',
    typeEmoji: '🌍',
    description: '서로의 성장을 응원하는 관계를 원하는 당신',
    matchScore: 83,
    traits: ['독립심', '모험심', '존중'],
  },
  // ... 추가 조합
};

export const calculateQuizResult = (answers: string[]): QuizResult => {
  const traitKey = answers.join('_');
  
  // 정확한 매칭이 있으면 반환
  if (IDEAL_TYPES[traitKey]) {
    return IDEAL_TYPES[traitKey];
  }
  
  // 없으면 가장 많은 trait 기반으로 계산
  const traitCounts = answers.reduce((acc, trait) => {
    acc[trait] = (acc[trait] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantTrait = Object.entries(traitCounts)
    .sort(([,a], [,b]) => b - a)[0][0];
  
  // 기본 결과 반환
  return {
    idealType: '밸런스형',
    typeEmoji: '✨',
    description: '다양한 매력을 가진 상대와 잘 맞는 당신',
    matchScore: 80 + Math.floor(Math.random() * 10), // 80-89
    traits: ['균형감', '적응력', '개방성'],
  };
};
```

**결과 화면 UX**:

```
┌─────────────────────────────────────┐
│  🎯 당신의 이상형 분석 완료!          │
├─────────────────────────────────────┤
│                                     │
│  🌷 따뜻한 힐링형                    │
│                                     │
│  "편안하고 다정한 관계를 원하는 당신"  │
│                                     │
│  매칭 적합도: ████████░░ 87%        │
│                                     │
│  #다정함 #안정감 #배려               │
│                                     │
├─────────────────────────────────────┤
│  💡 ○○대에서 23명이 활동 중이에요    │
│     지금 가입하면 바로 매칭 시작!     │
├─────────────────────────────────────┤
│                                     │
│  [결과 저장하고 매칭 시작] ← Primary  │
│                                     │
│  나중에 할게요                       │
│                                     │
└─────────────────────────────────────┘
```

**프레이밍 원칙** (일관된 긍정 프레이밍):

| ❌ 부정적 압박 | ✅ 긍정적 혜택 |
| -- | -- |
| "30분 후 사라져요" | "저장하면 맞춤 매칭 바로 시작" |
| "지금 안 하면 다시 해야 해요" | "결과 저장하면 언제든 확인 가능" |
| "놓치지 마세요" | "○○대 23명과 매칭 준비 완료" |

#### B. 학교별 현황 API

```
// Backend: GET /api/universities/:id/stats

interface UniversityStats {
  universityId: number;
  universityName: string;
  activeUsers: number;      // 최근 7일 활성 유저
  weeklyMatches: number;    // 이번 주 매칭 수
  waitingUsers: number;     // 매칭 대기 중인 유저
  lastUpdated: string;      // 캐시 갱신 시간
}

// 응답 예시
{
  "universityId": 1,
  "universityName": "충남대학교",
  "activeUsers": 156,
  "weeklyMatches": 23,
  "waitingUsers": 12,
  "lastUpdated": "2026-01-03T10:00:00Z"
}

// 주의: 실제 데이터 기반, 허위 표시 금지
// 데이터 부족 시: "10명 이상 활동 중" 범위형 표현
```

---

### 2.2 Phase 2: 가입 단계 축소 (7단계 → 4단계)

#### 현재 → 변경 비교

```
[현재 7단계]                    [변경 4단계]
1. 대학교 선택                   1. 소셜 로그인 (카카오 최상단)
2. 클러스터 확인                 2. 대학교 선택
3. 학과/학년/학번                3. 학과/학년 (학번 선택적)
4. 인스타그램 (선택)             4. 프로필 사진 (1장 필수 + 2장 권장)
5. 프로필 사진 3장               → 완료 → 홈
6. 초대코드 (선택)
7. 완료

[지연 수집 - 홈에서 유도]
- 추가 사진 (2장) → "사진 추가하면 매칭률 3배↑"
- 인스타그램 → 첫 매칭 성공 후
- 학번 → 선택적 입력
- 초대코드 → 설정 메뉴
- 클러스터 정보 → 홈에서 자연스럽게 노출
```

#### 코드 변경

```
// src/features/signup/hooks/use-signup-progress.tsx

// 기존 enum
export enum SignupSteps {
  UNIVERSITY = 1,
  UNIVERSITY_DETAIL = 2,
  INSTAGRAM = 3,
  PROFILE_IMAGE = 4,
  INVITE_CODE = 5,
}

// 변경 enum
export enum SignupSteps {
  UNIVERSITY = 1,           // 대학교 선택 (기존 유지)
  UNIVERSITY_DETAIL = 2,    // 학과/학년만 (학번 optional)
  PROFILE_IMAGE = 3,        // 1장 필수 + 2장 권장
  DONE = 4,                 // 완료
}

// 제거되는 단계
// - INSTAGRAM → 홈에서 유도
// - INVITE_CODE → 설정에서 입력
// - university-cluster 화면 → 홈에서 자연스럽게 안내
```

#### 프로필 사진 로직 변경

```
// app/auth/signup/profile-image.tsx

// 기존: 3장 필수
const MIN_IMAGES = 3;

// 변경: 1장 필수 + 2장 권장
const MIN_IMAGES = 1;
const RECOMMENDED_IMAGES = 3;

// UI 변경
<View>
  <Text>프로필 사진</Text>
  <Text style={styles.subtitle}>
    최소 1장 필수, 3장 등록하면 매칭률 3배↑
  </Text>
  
  {/* 첫 번째 슬롯: 필수 표시 */}
  <ImageSlot index={0} required label="필수" />
  
  {/* 2-3번째 슬롯: 권장 표시 */}
  <ImageSlot index={1} label="권장" />
  <ImageSlot index={2} label="권장" />
  
  {/* 1장만 있어도 다음 버튼 활성화 */}
  <Button 
    disabled={images.length < MIN_IMAGES}
    title={images.length < RECOMMENDED_IMAGES 
      ? "다음 (나중에 추가 가능)" 
      : "다음"
    }
  />
</View>
```

---

### 2.3 Phase 3: 온보딩 축소 (11슬라이드 → 4슬라이드)

#### 슬라이드 통합 계획

```
[현재 11슬라이드]              [변경 4슬라이드]

1. welcome                    1. welcome + story (통합)
2. story                         "썸타임에 온 걸 환영해요"
3. matching-time              
4. verification               2. matching-time + verification (통합)
5. student-only                  "매일 밤 10시, 검증된 대학생만"
6. ai-matching
7. like-guide                 3. like-guide + chat-guide (통합)
8. chat-guide                    "좋아요 보내고, 대화 시작하기"
9. refund
10. region                    4. cta (유지)
11. cta                          "지금 시작하기"

[홈에서 점진적 안내]
- ai-matching → 첫 매칭 시 툴팁
- refund → 결제 화면에서 안내
- region → 매칭 카드에서 자연스럽게 노출
- student-only → 이미 가입 시 인지됨
```

#### 코드 변경

```
// src/features/onboarding/constants/slides.ts

// 기존
export const ONBOARDING_SLIDES = [
  'welcome', 'story', 'matching-time', 'verification',
  'student-only', 'ai-matching', 'like-guide', 'chat-guide',
  'refund', 'region', 'cta'
];

// 변경
export const ONBOARDING_SLIDES = [
  'welcome-combined',      // welcome + story
  'matching-combined',     // matching-time + verification + student-only
  'guide-combined',        // like-guide + chat-guide
  'cta',
];

// 퀴즈 완료자용 더 축소된 버전
export const QUIZ_USER_SLIDES = [
  'matching-combined',     // 핵심만
  'guide-combined',
  'cta',
];
```

---

### 2.4 Phase 4: 비회원 세션 관리

#### 데이터 구조

```
// src/shared/hooks/use-guest-session.ts

export interface GuestSession {
  deviceId: string;
  quizResult: {
    idealType: string;
    typeEmoji: string;
    description: string;
    matchScore: number;
    traits: string[];
    answers: string[];  // 원본 답변 저장
  };
  selectedUniversity?: {
    id: number;
    name: string;
  };
  createdAt: number;
  expiresAt: number;  // 24시간 TTL (30분은 너무 짧음)
}

// AsyncStorage 키
const GUEST_SESSION_KEY = '@sometime/guest_session';
```

#### 마이그레이션 시퀀스

```
[사용자 플로우]
퀴즈 완료 → 결과 저장 클릭 → 소셜 로그인 → 가입 완료
                                              ↓
                                    [마이그레이션 트리거]

[마이그레이션 시퀀스]

1. 클라이언트: 가입 완료 감지
   ↓
2. 클라이언트: AsyncStorage에서 GuestSession 조회
   ↓
3. 클라이언트: POST /api/quiz/migrate 호출
   {
     "deviceId": "xxx",
     "userId": "yyy",
     "quizResult": { ... }
   }
   ↓
4. 서버: quiz_sessions 테이블에 저장
   - migrated_to_user_id = userId
   - 기존 deviceId 데이터 있으면 업데이트
   ↓
5. 서버: 사용자 프로필에 idealType 태그 추가 (매칭 알고리즘용)
   ↓
6. 클라이언트: AsyncStorage에서 GuestSession 삭제
   ↓
7. 클라이언트: 홈으로 이동 (퀴즈 결과 기반 첫 매칭 준비)
```

#### 서버 스키마

```
-- 신규 테이블: quiz_sessions
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id),  -- 마이그레이션 후 연결
  
  -- 퀴즈 결과
  ideal_type VARCHAR(100) NOT NULL,
  match_score INTEGER NOT NULL,
  quiz_answers JSONB NOT NULL,
  
  -- 메타데이터
  selected_university_id INTEGER REFERENCES universities(id),
  created_at TIMESTAMP DEFAULT NOW(),
  migrated_at TIMESTAMP,
  
  -- 인덱스
  INDEX idx_device_id (device_id),
  INDEX idx_user_id (user_id)
);

-- 기존 profiles 테이블에 컬럼 추가
ALTER TABLE profiles ADD COLUMN ideal_type VARCHAR(100);
ALTER TABLE profiles ADD COLUMN ideal_type_traits JSONB;
```

---

## 3\. 기술 요구사항

### 3.1 개발 공수 산정

| 기능 | 우선순위 | 예상 공수 | 담당 | 의존성 |
| -- | -- | -- | -- | -- |
| 퀴즈 UI/UX | P0 | 3일 | FE | \- |
| 퀴즈 결과 계산 로직 | P0 | 1일 | FE | \- |
| 비회원 세션 관리 | P0 | 2일 | FE | \- |
| 대학 통계 API | P0 | 2일 | BE | \- |
| 퀴즈 마이그레이션 API | P0 | 1일 | BE | 대학 통계 API |
| 가입 플로우 축소 | P0 | 2일 | FE | \- |
| 온보딩 축소 | P1 | 1일 | FE | \- |
| 홈 프로필 완성 유도 카드 | P1 | 1일 | FE | \- |
| A/B 테스트 설정 | P1 | 1일 | FE+BE | 전체 완료 후 |
| **총계** |  | **15일 (3주)** |  |  |

### 3.2 신규 파일 구조

```
app/
├── quiz/
│   ├── index.tsx              # 퀴즈 메인 화면
│   ├── result.tsx             # 결과 화면
│   └── _layout.tsx            # 레이아웃

src/
├── features/
│   └── quiz/
│       ├── apis/
│       │   ├── index.ts
│       │   ├── migrate-quiz.ts
│       │   └── get-university-stats.ts
│       ├── hooks/
│       │   ├── use-quiz.ts
│       │   └── use-quiz-result.ts
│       ├── ui/
│       │   ├── quiz-question.tsx
│       │   ├── quiz-progress.tsx
│       │   ├── quiz-result-card.tsx
│       │   └── university-stats.tsx
│       ├── utils/
│       │   └── calculate-result.ts
│       ├── constants/
│       │   └── questions.ts
│       └── types.ts
│
├── shared/
│   └── hooks/
│       └── use-guest-session.ts   # 비회원 세션 관리
```

### 3.3 수정 파일 목록

| 파일 | 변경 내용 |
| -- | -- |
| `app/auth/login/index.tsx` | 퀴즈 CTA 버튼 추가 |
| `features/signup/ui/login-form.tsx` | 카카오 로그인 최상단 배치 |
| `features/signup/hooks/use-signup-progress.tsx` | SignupSteps enum 수정 (7→4) |
| `app/auth/signup/university-details.tsx` | 학번 optional 처리 |
| `app/auth/signup/profile-image.tsx` | 1장 필수 + 2장 권장 |
| `app/auth/signup/_layout.tsx` | 단계 수 축소 반영 |
| `features/onboarding/constants/slides.ts` | 11→4 슬라이드 |
| `features/onboarding/ui/onboarding-screen.tsx` | 통합 슬라이드 렌더링 |

### 3.4 API 엔드포인트

```
// 신규 API

// 1. 대학 통계 조회
GET /api/universities/:id/stats
Response: UniversityStats

// 2. 퀴즈 결과 마이그레이션
POST /api/quiz/migrate
Body: {
  deviceId: string;
  userId: string;
  quizResult: QuizResult;
  selectedUniversityId?: number;
}
Response: { success: boolean; profileUpdated: boolean; }

// 3. 퀴즈 결과 조회 (가입 후)
GET /api/users/:userId/quiz-result
Response: QuizResult | null
```

---

## 4\. 사용자 플로우

### 4.1 신규 사용자 - 최적 경로

```
[인스타그램 광고]
        ↓
[랜딩/로그인 페이지]
    ┌─────────────────────────────┐
    │ 썸타임                       │
    │                             │
    │ [카카오로 시작하기]           │
    │ [Apple로 시작하기]           │
    │                             │
    │ ─────── 또는 ───────        │
    │                             │
    │ [내 이상형 분석해보기 👀]     │ ← 신규 CTA
    │ 30초면 끝나요                │
    └─────────────────────────────┘
        ↓ (퀴즈 CTA 클릭)
        
[이상형 퀴즈] (5문항)
    Q1. 첫 데이트 장소는?
    Q2. 의견 충돌이 생기면?
    Q3. 연락 스타일은?
    Q4. 이상적인 주말은?
    Q5. 끌리는 매력은?
        ↓
        
[결과 화면]
    🌷 따뜻한 힐링형
    매칭 적합도 87%
    ○○대 23명 활동 중
    
    [결과 저장하고 매칭 시작] ← Primary CTA
    나중에 할게요
        ↓ (저장 클릭)
        
[간소화 가입] (4단계)
    1. 카카오 로그인 (1탭)
    2. 대학교 선택
    3. 학과/학년 입력
    4. 프로필 사진 1장
        ↓
        
[간소화 온보딩] (4슬라이드)
    1. 환영 + 스토리
    2. 매칭 시간 + 인증
    3. 사용 가이드
    4. 시작하기
        ↓
        
[홈]
    - 퀴즈 결과 기반 첫 매칭 대기
    - 프로필 완성 유도 카드 표시
```

### 4.2 기존 사용자 - 바로 로그인

```
[로그인 페이지]
        ↓
[카카오/Apple 로그인] (1탭)
        ↓
[홈] (바로 진입)
```

### 4.3 퀴즈만 하고 이탈한 사용자 - 재방문

```
[앱 재실행]
        ↓
[로그인 페이지]
    - AsyncStorage에서 GuestSession 감지
    - 배너 표시: "아까 분석 결과 기억나요? 🌷 따뜻한 힐링형"
        ↓
[결과 저장하기] 클릭
        ↓
[가입 플로우 진행]
```

---

## 5\. 성공 지표

### 5.1 Primary Metrics

| 지표 | 현재 | 목표 (8주 후) | 측정 방법 |
| -- | -- | -- | -- |
| 광고→가입 전환율 | <1% | **3%** | Mixpanel: ad_click → signup_done |
| 가입 완료율 | \~40% | **70%** | signup_started → signup_done |
| 평균 가입 소요 시간 | 5분+ | **2분** | 타임스탬프 차이 |

### 5.2 Secondary Metrics

| 지표 | 목표 | 측정 방법 |
| -- | -- | -- |
| 퀴즈 시작률 | \>30% (로그인 페이지 방문자 중) | quiz_started / login_page_view |
| 퀴즈 완료율 | \>75% | quiz_completed / quiz_started |
| 퀴즈→가입 전환율 | \>35% | signup_started (from_quiz=true) / quiz_completed |
| D1 Retention | \>45% | 다음날 앱 오픈 |
| 프로필 완성률 (D7) | \>60% | 사진 3장 + 인스타 연결 |

### 5.3 Mixpanel 이벤트 추가

```
// 신규 이벤트
track('quiz_cta_viewed');           // 로그인 화면에서 퀴즈 CTA 노출
track('quiz_started', { source });  // 퀴즈 시작
track('quiz_question_answered', { 
  questionId, 
  answerId,
  timeSpent  // 문항별 소요 시간
});
track('quiz_completed', { 
  resultType,
  matchScore,
  totalTimeSpent
});
track('quiz_result_cta_clicked', { 
  ctaType: 'save' | 'later',
  universityViewed: boolean
});
track('quiz_to_signup', { 
  timeFromQuizComplete  // 결과 확인 후 가입까지 시간
});
track('quiz_session_restored');     // 재방문 시 세션 복원

// 기존 이벤트 속성 추가
track('signup_done', { 
  ...existing,
  fromQuiz: true | false,
  quizResultType: string | null
});
```

---

## 6\. 일정

| Phase | 기간 | 산출물 | 담당 |
| -- | -- | -- | -- |
| **Week 1** | 설계 확정 | PRD 최종, 디자인 시안, API 스펙 | 기획/디자인 |
| **Week 2-3** | 퀴즈 개발 | 퀴즈 UI, 결과 계산, 비회원 세션 | FE |
| **Week 3** | API 개발 | 대학 통계, 마이그레이션 | BE |
| **Week 4** | 플로우 수정 | 가입 4단계, 온보딩 4슬라이드 | FE |
| **Week 5** | 통합/연동 | FE-BE 연동, 엣지케이스 처리 | FE+BE |
| **Week 6** | QA | 버그 수정, 성능 최적화 | QA |
| **Week 7** | 배포 | 앱스토어 업데이트, A/B 테스트 시작 | DevOps |

**총 기간**: 7주

---

## 7\. A/B 테스트 계획

### 7.1 테스트 그룹

| 그룹 | 플로우 | 트래픽 | 측정 |
| -- | -- | -- | -- |
| **Control** | 기존 (7단계+11슬라이드) | 40% | 전환율, 리텐션 기준선 |
| **Test A** | 간소화만 (4단계+4슬라이드) | 30% | 간소화 효과 측정 |
| **Test B** | 퀴즈 + 간소화 (Full) | 30% | 퀴즈 추가 효과 측정 |

### 7.2 성공 기준

```
Test A 성공 조건: 전환율 Control 대비 +50% (0.75% → 1.5%)
Test B 성공 조건: 전환율 Control 대비 +100% (0.75% → 1.5%+)

2주 후 중간 점검:
- 유의미한 차이 있으면 → 우세 그룹 트래픽 확대
- 차이 없으면 → 2주 더 진행 또는 롤백 검토
```

---

## 8\. 리스크 및 대응

| 리스크 | 확률 | 영향 | 대응 |
| -- | -- | -- | -- |
| 퀴즈만 하고 이탈 | 높음 | 중간 | 세션 저장 + 재방문 시 복원 배너 |
| 학교 통계 데이터 부족 | 중간 | 낮음 | "10명 이상" 범위형 표현 |
| 프로필 1장으로 매칭 질 저하 | 중간 | 중간 | 홈에서 적극적 추가 유도 |
| 기존 사용자 혼란 | 낮음 | 낮음 | 기존 로그인 버튼 유지 (퀴즈는 선택) |
| 온보딩 축소로 기능 이해도 저하 | 중간 | 중간 | 홈에서 컨텍스트 기반 툴팁 |

### 롤백 계획

1. **Feature Flag**: 퀴즈 기능 서버에서 on/off 제어
2. **점진적 배포**: 20% → 50% → 100%
3. **실패 기준**: 2주 후 전환율 개선 없거나 D1 리텐션 하락 시
4. **롤백 시간**: 30분 내 (서버 플래그 변경)

---

## 9\. 마이크로카피 가이드

### 9.1 프레이밍 원칙

| 상황 | ❌ 부정적 | ✅ 긍정적 |
| -- | -- | -- |
| 결과 저장 유도 | "안 하면 사라져요" | "저장하면 맞춤 매칭 바로 시작" |
| 추가 사진 유도 | "사진이 부족해요" | "사진 추가하면 매칭률 3배↑" |
| 인스타 연결 | "인스타 없으면 불리해요" | "연결하면 더 자세히 소개돼요" |
| 가입 유도 | "회원가입 필수" | "30초면 시작할 수 있어요" |

### 9.2 CTA 버튼 문구

| 상황 | 카피 |
| -- | -- |
| 로그인 화면 퀴즈 CTA | "내 이상형 분석해보기 👀" |
| 퀴즈 시작 | "30초면 끝나요" |
| 퀴즈 다음 문항 | "다음" |
| 퀴즈 결과 저장 | "결과 저장하고 매칭 시작" |
| 소셜 로그인 | "카카오로 3초 시작" |
| 프로필 사진 (1장만) | "다음 (나중에 추가 가능)" |
| 프로필 사진 (3장) | "완료" |
| 온보딩 완료 | "매칭 시작하기 💕" |

### 9.3 홈 프로필 완성 유도 카드

```
┌─────────────────────────────────────┐
│ 📸 사진을 더 추가해볼까요?            │
│                                     │
│ 사진 3장이면 매칭률이 3배 높아져요    │
│                                     │
│ [지금 추가하기]        [나중에]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📱 인스타그램 연결                   │
│                                     │
│ 매칭 상대에게 더 많은 모습을 보여줘요  │
│                                     │
│ [연결하기]             [나중에]      │
└─────────────────────────────────────┘
```

---

## 10\. Appendix

### 10.1 파일 변경 체크리스트

```
[신규 파일]
[ ] app/quiz/index.tsx
[ ] app/quiz/result.tsx
[ ] app/quiz/_layout.tsx
[ ] src/features/quiz/apis/index.ts
[ ] src/features/quiz/apis/migrate-quiz.ts
[ ] src/features/quiz/apis/get-university-stats.ts
[ ] src/features/quiz/hooks/use-quiz.ts
[ ] src/features/quiz/hooks/use-quiz-result.ts
[ ] src/features/quiz/ui/quiz-question.tsx
[ ] src/features/quiz/ui/quiz-progress.tsx
[ ] src/features/quiz/ui/quiz-result-card.tsx
[ ] src/features/quiz/ui/university-stats.tsx
[ ] src/features/quiz/utils/calculate-result.ts
[ ] src/features/quiz/constants/questions.ts
[ ] src/features/quiz/types.ts
[ ] src/shared/hooks/use-guest-session.ts
[ ] src/features/home/ui/profile-completion-card.tsx

[수정 파일]
[ ] app/auth/login/index.tsx - 퀴즈 CTA 추가
[ ] src/features/signup/ui/login-form.tsx - 카카오 최상단
[ ] src/features/signup/hooks/use-signup-progress.tsx - enum 수정
[ ] app/auth/signup/university-details.tsx - 학번 optional
[ ] app/auth/signup/profile-image.tsx - 1장 필수
[ ] app/auth/signup/_layout.tsx - 단계 수 반영
[ ] src/features/onboarding/constants/slides.ts - 4슬라이드
[ ] src/features/onboarding/ui/onboarding-screen.tsx - 통합 렌더링

[삭제/비활성화]
[ ] app/auth/signup/university-cluster.tsx - 제거 또는 스킵
[ ] app/auth/signup/instagram.tsx - 홈으로 이동
[ ] app/auth/signup/invite-code.tsx - 설정으로 이동
```

### 10.2 Backend API 스펙

```
# OpenAPI 3.0 스펙

/api/universities/{id}/stats:
  get:
    summary: 대학교 활동 통계 조회
    parameters:
      - name: id
        in: path
        required: true
        schema:
          type: integer
    responses:
      200:
        content:
          application/json:
            schema:
              type: object
              properties:
                universityId:
                  type: integer
                universityName:
                  type: string
                activeUsers:
                  type: integer
                  description: 최근 7일 활성 유저
                weeklyMatches:
                  type: integer
                waitingUsers:
                  type: integer
                lastUpdated:
                  type: string
                  format: date-time

/api/quiz/migrate:
  post:
    summary: 퀴즈 결과를 사용자 계정에 연결
    requestBody:
      content:
        application/json:
          schema:
            type: object
            required:
              - deviceId
              - userId
              - quizResult
            properties:
              deviceId:
                type: string
              userId:
                type: string
                format: uuid
              quizResult:
                type: object
                properties:
                  idealType:
                    type: string
                  matchScore:
                    type: integer
                  traits:
                    type: array
                    items:
                      type: string
                  answers:
                    type: array
                    items:
                      type: string
              selectedUniversityId:
                type: integer
    responses:
      200:
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                profileUpdated:
                  type: boolean
```

### 10.3 디자인 참고사항

**퀴즈 UI 스타일**:

* 카드 스와이프 또는 선택지 탭 (틴더 스타일)
* 프로그레스 바: 상단 고정, 5단계 표시
* 애니메이션: 문항 전환 시 fade + slide

**결과 화면 스타일**:

* 카드 뉴스 형태 (인스타 공유 가능하게)
* 이상형 유형: 이모지 + 큰 타이틀
* 매칭 점수: 프로그레스 바 시각화
* 학교 현황: 하단 배너 형태

**색상**:

* Primary CTA: 브랜드 핑크/코랄
* Secondary: 회색
* 결과 카드 배경: 그라데이션

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
| -- | -- | -- |
| v1.0 | 2026-01-03 | 초안 작성 |
| v2.0 | 2026-01-03 | 실제 코드베이스 반영 |
| v3.0 | 2026-01-03 | 피드백 반영 최종본 (4단계 가입, 긍정 프레이밍, 계산 로직 추가) |
