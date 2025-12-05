import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages';

test.describe('홈 화면', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    // TODO: 로그인 상태로 만들기 (auth fixture 사용)
    await homePage.gotoHome();
  });

  test('홈 화면 로드 확인', async () => {
    // When: 홈 화면 접근
    await homePage.expectHomeLoaded();

    // Then: 오늘의 매칭 카드 표시
    await homePage.expectTodayMatchCard();
  });

  test('하단 탭 네비게이션', async () => {
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

  test('좋아요 버튼 동작', async () => {
    // Given: 오늘의 매칭 카드가 있음
    await homePage.expectTodayMatchCard();

    // When: 좋아요 버튼 클릭
    await homePage.clickLike();

    // Then: 다음 카드로 이동 또는 매칭 완료 메시지
    // (실제 동작에 따라 검증 로직 추가)
  });

  test('패스 버튼 동작', async () => {
    // Given: 오늘의 매칭 카드가 있음
    await homePage.expectTodayMatchCard();

    // When: 패스 버튼 클릭
    await homePage.clickPass();

    // Then: 다음 카드로 이동
    // (실제 동작에 따라 검증 로직 추가)
  });

  test('프로필 카드 클릭', async () => {
    // Given: 프로필 카드가 표시됨
    await homePage.expectTodayMatchCard();

    // When: 프로필 카드 클릭
    await homePage.clickProfileCard();

    // Then: 프로필 상세 페이지로 이동
    await expect(homePage['page']).toHaveURL(/\/profile/);
  });
});
