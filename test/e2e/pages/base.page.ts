import { Page } from '@playwright/test';
import { waitForAppLoad, waitForLoadingComplete } from '../helpers/test-helpers';

/**
 * 모든 Page Object의 베이스 클래스
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string = '/') {
    await this.page.goto(path);
    await waitForAppLoad(this.page);
    await waitForLoadingComplete(this.page);
  }

  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
    await waitForLoadingComplete(this.page);
  }

  async screenshot(name: string) {
    await this.page.screenshot({
      path: `test/e2e/test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true
    });
  }
}
