# E2E 테스트 가이드

Playwright를 사용한 Sometimes App의 E2E (End-to-End) 테스트 자동화 문서입니다.

## 📋 목차

1. [개요](#개요)
2. [시작하기](#시작하기)
3. [디렉터리 구조](#디렉터리-구조)
4. [테스트 실행](#테스트-실행)
5. [테스트 작성 가이드](#테스트-작성-가이드)
6. [주요 도메인별 테스트 시나리오](#주요-도메인별-테스트-시나리오)
7. [CI/CD 통합](#cicd-통합)
8. [트러블슈팅](#트러블슈팅)

---

## 개요

### 목적
- React Native Web 앱의 주요 사용자 플로우 자동화 테스트
- 회귀 테스트를 통한 품질 보증
- 빠른 피드백 루프로 개발 속도 향상

### 기술 스택
- **Playwright**: 브라우저 자동화 및 E2E 테스트
- **TypeScript**: 타입 안전한 테스트 코드
- **Page Object Model**: 유지보수 용이한 테스트 구조

---

## 시작하기

### 1. 사전 요구사항
- Node.js 18+
- npm 또는 yarn

### 2. 의존성 설치
Playwright는 이미 설치되어 있습니다. 브라우저만 설치하면 됩니다:

```bash
npx playwright install chromium
```

### 3. 개발 서버 시작
테스트를 실행하기 전에 로컬 개발 서버를 시작해야 합니다:

```bash
npm start -- --web
```

서버가 `http://localhost:19006`에서 실행되는지 확인하세요.

### 4. 첫 테스트 실행
```bash
npm run test:e2e
```

---

## 디렉터리 구조

```
test/e2e/
├── fixtures/              # 테스트 데이터
│   └── test-data.ts      # 테스트용 사용자 데이터, 설정 등
├── helpers/               # 헬퍼 함수
│   └── test-helpers.ts   # 공통 헬퍼 함수
├── pages/                 # Page Object Models
│   ├── base.page.ts      # 기본 Page Object
│   ├── auth.page.ts      # 인증/회원가입
│   ├── home.page.ts      # 홈 화면
│   ├── chat.page.ts      # 채팅
│   └── index.ts          # 배럴 export
├── specs/                 # 테스트 스펙
│   ├── auth/             # 인증 테스트
│   │   └── signup.spec.ts
│   ├── home/             # 홈 화면 테스트
│   │   └── home.spec.ts
│   ├── chat/             # 채팅 테스트
│   │   └── chat.spec.ts
│   ├── community/        # 커뮤니티 테스트
│   ├── moment/           # 모먼트 테스트
│   ├── somemate/         # 썸메이트 테스트
│   ├── match/            # 매칭 테스트
│   ├── like/             # 좋아요 테스트
│   ├── mypage/           # 마이페이지 테스트
│   ├── profile/          # 프로필 조회 테스트
│   └── settings/         # 설정 테스트
├── test-results/          # 테스트 결과 (gitignore)
├── playwright.config.ts   # Playwright 설정
└── README.md             # 이 문서
```

---

## 테스트 실행

### 기본 실행
```bash
npm run test:e2e
```

### UI 모드 (추천)
대화형 UI에서 테스트를 실행하고 디버깅:
```bash
npm run test:e2e:ui
```

### Headed 모드
브라우저를 보면서 테스트 실행:
```bash
npm run test:e2e:headed
```

### 디버그 모드
단계별 디버깅:
```bash
npm run test:e2e:debug
```

### 특정 테스트 파일만 실행
```bash
npx playwright test test/e2e/specs/auth/signup.spec.ts
```

### 특정 브라우저에서만 실행
```bash
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

### 테스트 리포트 보기
```bash
npm run test:e2e:report
```

---

## 테스트 작성 가이드

### 1. Page Object 패턴 사용

**Bad ❌**
```typescript
test('로그인 테스트', async ({ page }) => {
  await page.goto('http://localhost:19006/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
});
```

**Good ✅**
```typescript
test('로그인 테스트', async ({ page }) => {
  const authPage = new AuthPage(page);
  await authPage.gotoLogin();
  await authPage.login('test@example.com', 'password');
  await authPage.expectLoginSuccess();
});
```

### 2. 테스트 데이터는 fixtures 사용

**Bad ❌**
```typescript
await authPage.enterPhoneNumber('01012345678');
```

**Good ✅**
```typescript
import { TEST_USERS } from '../../fixtures/test-data';

await authPage.enterPhoneNumber(TEST_USERS.newUser.phoneNumber);
```

### 3. 명확한 테스트 이름
```typescript
// Given-When-Then 패턴 추천
test('신규 사용자가 회원가입을 완료하면 홈 화면으로 이동한다', async ({ page }) => {
  // Given: 회원가입 페이지에 접근
  const authPage = new AuthPage(page);
  await authPage.gotoSignup();

  // When: 회원가입 정보 입력
  await authPage.completeSignupFlow(TEST_USERS.newUser);

  // Then: 홈 화면으로 이동
  await authPage.expectSignupComplete();
});
```

### 4. 독립적인 테스트
각 테스트는 독립적으로 실행 가능해야 합니다:
```typescript
test.beforeEach(async ({ page }) => {
  // 각 테스트마다 초기화
  await page.goto('/');
});
```

### 5. 적절한 대기 사용
```typescript
// Bad ❌
await page.waitForTimeout(5000);

// Good ✅
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 5000 });
```

---

## 주요 도메인별 테스트 시나리오

### 1. 회원가입 (Auth)

**테스트 시나리오:**
- ✅ 신규 사용자 회원가입 완료
- ✅ 전화번호 인증 단계
- ✅ 기본 정보 입력 단계
- ✅ 닉네임 입력 단계
- ✅ 약관 동의 단계
- ✅ 잘못된 전화번호 형식 에러
- ✅ 잘못된 인증번호 에러

**실행:**
```bash
npx playwright test test/e2e/specs/auth/
```

### 2. 홈 화면 (Home)

**테스트 시나리오:**
- ✅ 홈 화면 로드 확인
- ✅ 하단 탭 네비게이션
- ✅ 좋아요 버튼 동작
- ✅ 패스 버튼 동작
- ✅ 프로필 카드 클릭

**실행:**
```bash
npx playwright test test/e2e/specs/home/
```

### 3. 채팅 (Chat)

**테스트 시나리오:**
- ✅ 채팅 목록 로드
- ✅ 채팅방 열기
- ✅ 메시지 전송
- ✅ 긴 메시지 전송
- ✅ 이모지 전송
- ✅ 연속 메시지 전송

**실행:**
```bash
npx playwright test test/e2e/specs/chat/
```

### 4. 커뮤니티 (Community)

**예정된 테스트 시나리오:**
- 게시글 목록 조회
- 게시글 작성
- 게시글 상세 보기
- 댓글 작성
- 좋아요/공감 기능

### 5. 모먼트 (Moment)

**예정된 테스트 시나리오:**
- 모먼트 피드 조회
- 모먼트 업로드
- 모먼트 좋아요
- 모먼트 댓글

### 6. 썸메이트 (Somemate)

**예정된 테스트 시나리오:**
- 썸메이트 목록 조회
- 썸메이트 매칭
- 썸메이트 프로필 보기

### 7. 매칭 (Match)

**예정된 테스트 시나리오:**
- 오늘의 매칭 조회
- 매칭 수락/거절
- 매칭 히스토리

### 8. 좋아요 (Like)

**예정된 테스트 시나리오:**
- 받은 좋아요 목록
- 보낸 좋아요 목록
- 상호 좋아요

### 9. 마이페이지 (Mypage)

**예정된 테스트 시나리오:**
- 프로필 조회
- 프로필 편집
- 설정 변경

### 10. 설정 (Settings)

**예정된 테스트 시나리오:**
- 알림 설정
- 계정 설정
- 개인정보 설정

---

## 새로운 테스트 작성하기

### Step 1: Page Object 작성

`test/e2e/pages/your-feature.page.ts`:
```typescript
import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class YourFeaturePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  private selectors = {
    submitButton: '[data-testid="submit-button"]',
    // ... 더 많은 셀렉터
  };

  async clickSubmit() {
    await this.page.locator(this.selectors.submitButton).click();
  }
}
```

### Step 2: 테스트 스펙 작성

`test/e2e/specs/your-feature/feature.spec.ts`:
```typescript
import { test, expect } from '@playwright/test';
import { YourFeaturePage } from '../../pages/your-feature.page';

test.describe('기능 이름', () => {
  let featurePage: YourFeaturePage;

  test.beforeEach(async ({ page }) => {
    featurePage = new YourFeaturePage(page);
    await featurePage.goto('/your-path');
  });

  test('테스트 시나리오 이름', async () => {
    // Given
    // When
    // Then
  });
});
```

### Step 3: 테스트 실행 및 디버깅

```bash
npm run test:e2e:ui
```

---

## CI/CD 통합

### GitHub Actions 예제

`.github/workflows/e2e-tests.yml`:
```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Start development server
        run: |
          npm start -- --web &
          npx wait-on http://localhost:19006

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: test/e2e/test-results/
```

---

## 트러블슈팅

### 문제: 테스트가 타임아웃됨

**해결책:**
1. 개발 서버가 실행 중인지 확인
2. `playwright.config.ts`에서 타임아웃 증가
3. 네트워크 대기 조건 확인

```typescript
await page.waitForLoadState('networkidle');
```

### 문제: 요소를 찾을 수 없음

**해결책:**
1. 셀렉터가 올바른지 확인
2. `data-testid` 속성 추가 권장
3. 요소가 표시될 때까지 대기

```typescript
await expect(element).toBeVisible({ timeout: 10000 });
```

### 문제: 테스트가 불안정함 (Flaky)

**해결책:**
1. `waitForTimeout` 대신 명시적 대기 사용
2. 네트워크 요청 완료 대기
3. 애니메이션 완료 대기

```typescript
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="element"]', { state: 'visible' });
```

### 문제: React Native Web 특유의 이슈

**해결책:**
1. 접근성 속성 활용 (`role`, `aria-label`)
2. `text=` 셀렉터 사용
3. viewport 설정 확인

---

## 모범 사례

### ✅ DO
- Page Object 패턴 사용
- 명확한 테스트 이름 작성
- fixtures로 테스트 데이터 관리
- 독립적인 테스트 작성
- 적절한 대기 사용
- data-testid 속성 사용

### ❌ DON'T
- 하드코딩된 대기 시간 (waitForTimeout)
- 테스트 간 의존성
- 너무 긴 테스트 (여러 시나리오를 하나의 테스트에)
- 불안정한 셀렉터
- 테스트 데이터 하드코딩

---

## 참고 자료

- [Playwright 공식 문서](https://playwright.dev/)
- [Page Object Model 패턴](https://playwright.dev/docs/pom)
- [React Native Web 테스트](https://necolas.github.io/react-native-web/)
- [프로젝트 CLAUDE.md](../../CLAUDE.md)

---

## 도움이 필요하신가요?

- 이슈: [GitHub Issues](https://github.com/your-repo/issues)
- 팀 채널: #engineering-qa
- 문서 기여: PR 환영합니다!

---

**마지막 업데이트:** 2025-12-04
**작성자:** Claude Code
**버전:** 1.0.0
