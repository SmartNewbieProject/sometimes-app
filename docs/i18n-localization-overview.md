# 다국어 지원(i18n) 기술 개발 작업 개요서

## 1. 프로젝트 개요

### 1.1 프로젝트명
Sometimes App 다국어 지원 시스템 구축

### 1.2 개발 목적
- 일본 시장 진출을 위한 일본어(Japanese) 현지화 지원
- 글로벌 확장을 위한 다국어 인프라 구축
- 영어(English) 지원을 통한 글로벌 사용자 접근성 확보

### 1.3 개발 기간
2024년 12월

---

## 2. 기술 스택

### 2.1 핵심 기술

| 기술 | 버전 | 용도 |
|-----|------|------|
| **i18next** | 23.x | 국제화(i18n) 핵심 프레임워크 |
| **react-i18next** | 14.x | React/React Native 바인딩 |
| **expo-localization** | 15.x | 디바이스 언어 감지 |
| **TypeScript** | 5.x | 타입 안정성 확보 |

### 2.2 기술 선정 이유

#### i18next
- React Native 생태계에서 가장 널리 사용되는 국제화 라이브러리
- 풍부한 플러그인 생태계 및 커뮤니티 지원
- 네임스페이스 기반 번역 파일 분리로 유지보수 용이
- 동적 언어 변경 및 Fallback 메커니즘 지원

#### react-i18next
- React Hooks 기반 API (`useTranslation`) 제공
- 컴포넌트 레벨의 선언적 번역 지원
- SSR/CSR 모두 지원하는 유연한 아키텍처

---

## 3. 시스템 아키텍처

### 3.1 디렉토리 구조

```
src/shared/libs/
├── i18n.ts                    # i18n 초기화 및 설정
└── locales/
    ├── ko/                    # 한국어 (기본 언어)
    │   ├── index.ts
    │   ├── global.json
    │   ├── apps/              # 앱 레벨 번역
    │   ├── features/          # 기능별 번역
    │   ├── widgets/           # 위젯 번역
    │   └── shareds/           # 공통 컴포넌트 번역
    ├── ja/                    # 일본어
    │   ├── index.ts
    │   ├── global.json
    │   ├── apps/
    │   ├── features/
    │   ├── widgets/
    │   └── shareds/
    └── en/                    # 영어
        ├── index.ts
        └── global.json
```

### 3.2 번역 키 네이밍 컨벤션

```
{카테고리}.{모듈}.{컴포넌트}.{키}

예시:
- global.not_found.title
- features.moment.navigation.roulette_title
- apps.auth.login.submit_button
```

### 3.3 Fallback 전략

```
요청 언어 → 지원 언어 확인 → Fallback (한국어)
     ja   →      ja        →    -
     en   →      en        →    ko (부족한 키)
     zh   →      -         →    ko
```

---

## 4. 개발 작업 내역

### 4.1 인프라 구축

| 작업 항목 | 상세 내용 |
|----------|----------|
| i18n 초기화 설정 | `src/shared/libs/i18n.ts` 구성 |
| 언어 리소스 로더 | 각 언어별 index.ts 모듈 번들링 |
| Provider 통합 | 앱 최상위에 I18nextProvider 연동 |

### 4.2 일본어 번역 파일 구축

#### 번역 카테고리별 파일 수

| 카테고리 | 파일 수 | 주요 내용 |
|---------|--------|----------|
| **global** | 1 | 공통 UI 텍스트 (확인, 취소, 닫기 등) |
| **apps** | 16 | 인증, 홈, 커뮤니티, 프로필 등 화면별 |
| **features** | 28 | 매칭, 결제, 이벤트, 모먼트, 채팅 등 기능별 |
| **widgets** | 5 | 폼, 셀렉터, 티켓 등 공통 위젯 |
| **shareds** | 10 | 유틸리티, 상수, 프로바이더, 네비게이션 등 |

**총 번역 파일**: 61개 JSON 파일 (일본어 기준)

#### 총 번역 키 규모

| 언어 | 번역 키 수 | 비고 |
|-----|-----------|------|
| **한국어 (ko)** | 2,004 키 | 기준 언어 (Full Coverage) |
| **일본어 (ja)** | 1,931 키 | 한국어 대비 96% 커버리지 |
| **영어 (en)** | 50+ 키 | 핵심 글로벌 키 (확장 예정) |

#### 번역 작업량 상세

| 항목 | 수량 | 설명 |
|-----|------|------|
| 총 번역 문자열 | **약 4,000건** | 한국어 + 일본어 합산 |
| 평균 문자열 길이 | 약 15자 | 버튼, 라벨, 안내 문구 등 |
| 추정 총 글자 수 | **약 60,000자** | 전체 번역 콘텐츠 |
| 문맥 검토 화면 수 | 50+ 화면 | UI/UX 맥락 확인 필요 |
| 동적 변수 처리 | 150+ 건 | 플레이스홀더 ({{name}}, {{count}} 등) |

### 4.3 주요 번역 적용 화면

| 화면/기능 | 번역 적용 항목 |
|----------|---------------|
| 인증 플로우 | 로그인, 회원가입, 본인인증 |
| 홈 화면 | 매칭 타이머, 파트너 카드, 알림 |
| 모먼트 | 데일리 룰렛, 나의 모먼트, 주간 리포트 |
| 커뮤니티 | 게시글, 댓글, 카테고리 |
| 결제 | 구슬 구매, 패스 구독, 영수증 |
| 설정 | 알림 설정, 계정 관리, 고객센터 |
| 에러 처리 | 404 페이지, 네트워크 오류, 서버 오류 |

---

## 5. 구현 세부 사항

### 5.1 i18n 초기화 코드

```typescript
// src/shared/libs/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ko from './locales/ko';
import ja from './locales/ja';
import en from './locales/en';

const resources = {
  ja: { translation: ja },
  ko: { translation: ko },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja',              // 기본 언어: 일본어
    fallbackLng: 'ko',      // Fallback: 한국어
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
```

### 5.2 컴포넌트 적용 예시

```tsx
import { useTranslation } from 'react-i18next';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <View>
      <Text>{t('global.not_found.title')}</Text>
      <Text>{t('global.not_found.description')}</Text>
      <Button title={t('global.not_found.go_home')} />
    </View>
  );
}
```

### 5.3 번역 파일 예시

```json
// locales/ja/global.json
{
  "loading": "読み込み中…",
  "cancel": "キャンセル",
  "confirm": "確認",
  "not_found": {
    "title": "あれ、迷子になっちゃった！",
    "description": "お探しのページが見つからないか、\n間違ったパスでアクセスしました",
    "go_home": "ホームに戻る"
  }
}
```

---

## 6. 품질 보증

### 6.1 번역 품질 관리

| 항목 | 적용 방안 |
|-----|----------|
| 네이티브 검수 | 일본어 원어민 번역가 검수 |
| 컨텍스트 제공 | 화면 스크린샷과 함께 번역 의뢰 |
| 용어 일관성 | 용어집(Glossary) 정의 및 준수 |
| A/B 테스트 | 주요 CTA 문구 현지화 효과 측정 |

### 6.2 기술적 품질 관리

| 항목 | 적용 방안 |
|-----|----------|
| TypeScript 타입 | 번역 키 자동완성 및 오타 방지 |
| 누락 키 감지 | i18next-parser로 미번역 키 추출 |
| 플레이스홀더 검증 | 동적 값 바인딩 정상 동작 확인 |

---

## 7. 향후 계획

### 7.1 단기 계획 (1-3개월)

- [ ] 일본어 번역 100% 커버리지 달성
- [ ] 번역 관리 도구(Crowdin/Lokalise) 도입 검토
- [ ] 일본 현지 베타 테스트 진행

### 7.2 중장기 계획 (6-12개월)

- [ ] 영어 번역 완성 (글로벌 출시)
- [ ] 중국어(간체/번체) 지원 추가
- [ ] 동적 언어 변경 기능 (앱 내 설정)
- [ ] RTL(Right-to-Left) 언어 지원 기반 마련

---

## 8. 기대 효과

### 8.1 비즈니스 효과

| 효과 | 설명 |
|-----|------|
| 일본 시장 진출 | 일본어 현지화로 일본 사용자 접근성 확보 |
| 사용자 경험 향상 | 모국어 서비스로 신뢰도 및 만족도 증가 |
| 글로벌 확장 기반 | 다국어 인프라로 추가 언어 확장 용이 |

### 8.2 기술적 효과

| 효과 | 설명 |
|-----|------|
| 유지보수 효율화 | 번역 파일 분리로 개발/번역 병렬 작업 가능 |
| 확장성 확보 | 새 언어 추가 시 번역 파일만 추가하면 됨 |
| 코드 품질 | 하드코딩된 문자열 제거로 코드 품질 향상 |

---

## 9. 결론

본 프로젝트를 통해 Sometimes App에 체계적인 다국어 지원 시스템을 구축하였습니다. i18next 기반의 국제화 프레임워크를 도입하여 일본어 현지화를 완료하였으며, 이를 통해 일본 시장 진출을 위한 기술적 기반을 마련하였습니다.

향후 번역 관리 도구 도입과 추가 언어 확장을 통해 글로벌 서비스로의 성장을 지원할 예정입니다.

---

**문서 작성일**: 2024년 12월
**작성자**: Sometimes App 개발팀
**문서 버전**: v1.0
