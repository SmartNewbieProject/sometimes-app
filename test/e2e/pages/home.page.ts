import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { findByText, findByTestId } from '../helpers/test-helpers';

/**
 * 홈 화면 Page Object
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private selectors = {
    todayMatchCard: '[data-testid="today-match-card"]',
    likeButton: '[data-testid="like-button"]',
    passButton: '[data-testid="pass-button"]',
    profileCard: '[data-testid="profile-card"]',
    bottomTab: {
      home: '[data-testid="tab-home"]',
      moment: '[data-testid="tab-moment"]',
      community: '[data-testid="tab-community"]',
      chat: '[data-testid="tab-chat"]',
      mypage: '[data-testid="tab-mypage"]',
    },
  };

  /**
   * 홈 화면으로 이동
   */
  async gotoHome() {
    await this.goto('/home');
  }

  /**
   * 하단 탭 클릭
   */
  async clickBottomTab(tab: 'home' | 'moment' | 'community' | 'chat' | 'mypage') {
    const tabSelector = this.selectors.bottomTab[tab];
    await this.page.locator(tabSelector).click();
    await this.waitForNavigation();
  }

  /**
   * 오늘의 매칭 카드 확인
   */
  async expectTodayMatchCard() {
    const card = this.page.locator(this.selectors.todayMatchCard);
    await expect(card).toBeVisible({ timeout: 5000 });
  }

  /**
   * 좋아요 버튼 클릭
   */
  async clickLike() {
    await this.page.locator(this.selectors.likeButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 패스 버튼 클릭
   */
  async clickPass() {
    await this.page.locator(this.selectors.passButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 프로필 카드 클릭
   */
  async clickProfileCard() {
    await this.page.locator(this.selectors.profileCard).first().click();
    await this.waitForNavigation();
  }

  /**
   * 홈 화면 로드 확인
   */
  async expectHomeLoaded() {
    await expect(this.page).toHaveURL(/\/home/, { timeout: 5000 });
    await this.expectTodayMatchCard();
  }
}
