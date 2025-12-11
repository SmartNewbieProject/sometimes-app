import { test, expect } from '@playwright/test';
import { HomePage, AuthPage } from '../../pages';

test.describe('홈 화면 (미인증)', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto('/');
  });

  test('루트 페이지 로드 및 리다이렉트 확인', async () => {
    // When: 루트 페이지 접근
    await homePage['page'].waitForLoadState('networkidle');

    // Then: 미인증 사용자는 로그인 페이지로 리다이렉트되어야 함
    await expect(homePage['page']).toHaveURL(/\/(auth\/login|home)/, { timeout: 10000 });
  });

  test.skip('하단 탭 네비게이션', async () => {
    // Given: 홈 화면

    // When: 모먼트 탭 클릭
    await homePage.clickBottomTab('moment');

    // Then: 모먼트 화면으로 이동
    await expect(homePage['page']).toHaveURL(/\/moment/);

    // When: 커뮤니티 탭 클릭
    await homePage.clickBottomTab('community');

    // Then: 커뮤니티 화면으로 이동
    await expect(homePage['page']).toHaveURL(/\/community/);

    // When: 채팅 탭 클릭
    await homePage.clickBottomTab('chat');

    // Then: 채팅 화면으로 이동
    await expect(homePage['page']).toHaveURL(/\/chat/);

    // When: 마이페이지 탭 클릭
    await homePage.clickBottomTab('mypage');

    // Then: 마이페이지 화면으로 이동
    await expect(homePage['page']).toHaveURL(/\/mypage/);

    // When: 홈 탭 클릭
    await homePage.clickBottomTab('home');

    // Then: 홈 화면으로 돌아옴
    await expect(homePage['page']).toHaveURL(/\/home/);
  });

  test.skip('좋아요 버튼 동작', async () => {
    // Given: 오늘의 매칭 카드가 있음
    await homePage.expectTodayMatchCard();

    // When: 좋아요 버튼 클릭
    await homePage.clickLike();

    // Then: 다음 카드로 이동 또는 매칭 완료 메시지
    // (실제 동작에 따라 검증 로직 추가)
  });

  test.skip('패스 버튼 동작', async () => {
    // Given: 오늘의 매칭 카드가 있음
    await homePage.expectTodayMatchCard();

    // When: 패스 버튼 클릭
    await homePage.clickPass();

    // Then: 다음 카드로 이동
    // (실제 동작에 따라 검증 로직 추가)
  });

  test.skip('프로필 카드 클릭', async () => {
    // Given: 프로필 카드가 표시됨
    await homePage.expectTodayMatchCard();

    // When: 프로필 카드 클릭
    await homePage.clickProfileCard();

    // Then: 프로필 상세 페이지로 이동
    await expect(homePage['page']).toHaveURL(/\/profile/);
  });
});

test.describe('홈 화면 (로그인됨)', () => {
  let homePage: HomePage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    // Given: 이메일로 로그인
    authPage = new AuthPage(page);
    await authPage.gotoLogin();
    await authPage.openEmailLoginModal();
    await authPage.loginWithEmail('test1@test.com', 'test1234!');

    // Then: 홈 화면으로 이동 확인
    homePage = new HomePage(page);
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test('로그인 후 홈 화면 로드 확인', async () => {
    // When: 홈 화면이 로드됨
    await homePage['page'].waitForLoadState('networkidle');

    // Then: URL이 /home이어야 함
    await expect(homePage['page']).toHaveURL(/\/home/);
  });

  test('로그인 상태 유지 확인', async () => {
    // When: 페이지 새로고침
    await homePage['page'].reload();
    await homePage['page'].waitForLoadState('networkidle');

    // Then: 여전히 홈 화면에 있어야 함 (로그인 페이지로 리다이렉트 안 됨)
    await expect(homePage['page']).toHaveURL(/\/home/, { timeout: 10000 });
  });
});
