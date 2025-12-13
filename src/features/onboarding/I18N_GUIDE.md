# 온보딩 국제화(i18n) 가이드

## 개요

온보딩 기능은 한국어(ko), 일본어(ja), 영어(en) 3개 언어를 지원합니다.
사용자의 기기 언어 설정에 따라 자동으로 언어가 전환됩니다.

## 지원 언어

- 🇰🇷 **한국어 (ko)** - 기본 언어
- 🇯🇵 **일본어 (ja)** - 일본 시장 지원
- 🇬🇧 **영어 (en)** - 국제 사용자 지원

## 번역 파일 위치

```
src/shared/libs/locales/
├── ko/features/onboarding.json    # 한국어
├── ja/features/onboarding.json    # 일본어
└── en/features/onboarding.json    # 영어
```

## 번역 키 구조

모든 온보딩 텍스트는 `features.onboarding` 네임스페이스를 사용합니다:

```typescript
// 슬라이드 텍스트
t('features.onboarding.slides.welcome.headline')
t('features.onboarding.slides.welcome.subtext')

// 네비게이션
t('features.onboarding.navigation.next')
t('features.onboarding.navigation.start')
t('features.onboarding.navigation.skip')
```

### 전체 키 목록

#### 슬라이드 (11개)

1. **welcome** - 환영 슬라이드
   - `slides.welcome.headline`
   - `slides.welcome.subtext`

2. **story** - 스토리
   - `slides.story.headline`
   - `slides.story.subtext`

3. **matchingTime** - 매칭 시간
   - `slides.matchingTime.headline`
   - `slides.matchingTime.subtext`
   - `slides.matchingTime.countdownLabel`

4. **verification** - 인증 시스템
   - `slides.verification.headline`
   - `slides.verification.subtext`
   - `slides.verification.badges.pass`
   - `slides.verification.badges.email`
   - `slides.verification.badges.photo`

5. **studentOnly** - 대학생 전용
   - `slides.studentOnly.headline`
   - `slides.studentOnly.subtext`

6. **aiMatching** - AI 매칭
   - `slides.aiMatching.headline`
   - `slides.aiMatching.subtext`

7. **likeGuide** - 좋아요 가이드
   - `slides.likeGuide.headline`
   - `slides.likeGuide.subtext`

8. **chatGuide** - 채팅 가이드
   - `slides.chatGuide.headline`
   - `slides.chatGuide.subtext`

9. **refund** - 환불 정책
   - `slides.refund.headline`
   - `slides.refund.subtext`

10. **region** - 지역 매칭
    - `slides.region.headline`
    - `slides.region.subtext`

11. **cta** - CTA
    - `slides.cta.headline`
    - `slides.cta.subtext`

#### 네비게이션

- `navigation.next` - "다음" 버튼
- `navigation.start` - "시작하기" 버튼
- `navigation.skip` - "건너뛰기" 버튼

## 사용 예시

### 컴포넌트에서 사용

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <Text>{t('features.onboarding.slides.welcome.headline')}</Text>
  );
};
```

### 개행 처리

번역 파일의 `\n`은 자동으로 개행 문자로 처리됩니다:

```json
{
  "headline": "반가워요! 👋\n썸타임에 오신 걸 환영해요"
}
```

→ 화면에서 2줄로 표시됩니다.

## 언어 전환 테스트

### 방법 1: 기기 설정 변경

1. iOS: 설정 > 일반 > 언어 및 지역 > 언어 변경
2. Android: 설정 > 시스템 > 언어 및 입력 > 언어 변경
3. 앱 재시작

### 방법 2: 코드에서 직접 변경

```typescript
import i18n from '@/src/shared/libs/i18n';

// 일본어로 변경
i18n.changeLanguage('ja');

// 한국어로 변경
i18n.changeLanguage('ko');

// 영어로 변경
i18n.changeLanguage('en');
```

## 새 언어 추가하기

### 1. 번역 파일 생성

```bash
# 예: 중국어 추가
cp src/shared/libs/locales/ko/features/onboarding.json \
   src/shared/libs/locales/zh/features/onboarding.json
```

### 2. 번역 수정

`onboarding.json` 파일을 열고 모든 텍스트를 해당 언어로 번역합니다.

### 3. index.ts 수정

```typescript
// src/shared/libs/locales/zh/index.ts
import featuresOnboarding from './features/onboarding.json';

const features = {
  // ... 기존 features
  'onboarding': featuresOnboarding,
};
```

### 4. i18n.ts에 언어 추가

```typescript
// src/shared/libs/i18n.ts
import zh from './locales/zh';

const resources = {
  ja: { translation: ja },
  ko: { translation: ko },
  en: { translation: en },
  zh: { translation: zh }, // 추가
};
```

## 번역 가이드라인

### 한국어 → 일본어

- **존댓말 유지**: 한국어의 존댓말 톤을 일본어에서도 유지
- **이모지**: 그대로 유지
- **구체적 표현**: "목·일" → "木・日" (요일 한자 사용)

### 한국어 → 영어

- **캐주얼 톤**: 친근하고 캐주얼한 톤 유지
- **길이 조절**: 영어는 한국어보다 길어질 수 있으므로 적절히 조절
- **문화적 맥락**: 한국 대학 문화를 글로벌하게 이해할 수 있도록 표현

## 주의사항

### ✅ 할 것

- 모든 텍스트를 번역 키로 관리
- 일관된 톤과 보이스 유지
- 이모지는 모든 언어에서 동일하게 사용
- 개행 위치 신중하게 결정

### ❌ 하지 말 것

- 하드코딩된 텍스트 사용
- 번역 키 누락
- 언어별 다른 이모지 사용
- 번역 파일 구조 변경 시 index.ts 업데이트 누락

## 트러블슈팅

### 번역이 표시되지 않음

1. 번역 파일 경로 확인
2. index.ts에 import/export 추가 확인
3. 캐시 삭제: `npm start -- --reset-cache`

### 개행이 작동하지 않음

`\n` 문자가 JSON에 올바르게 들어가 있는지 확인:

```json
// ✅ 올바른 예
"headline": "첫 줄\n두 번째 줄"

// ❌ 잘못된 예
"headline": "첫 줄\\n두 번째 줄"
```

### 기기 언어 변경 후 반영 안 됨

앱을 완전히 종료하고 재시작하세요.

## 참고 자료

- [i18next 공식 문서](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [Expo Localization](https://docs.expo.dev/versions/latest/sdk/localization/)

---

**업데이트**: 2025-12-13
**버전**: 1.0.0
