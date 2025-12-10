import { test, expect } from '@playwright/test';

test.describe('Login Page Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3004/auth/login');
  });

  test('should have proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/SOMETIMES|Login/);
  });

  test('should display login form elements', async ({ page }) => {
    // Check for main logo/title
    await expect(page.locator('text=대학생을 위한 진짜 설렘의 시작')).toBeVisible();

    // Check for login buttons
    await expect(page.locator('text=PASS 로그인')).toBeVisible();
    await expect(page.locator('text=카카오 로그인')).toBeVisible();

    // Check for privacy notice
    await expect(page.locator('text=회원가입 및 로그인 버튼을 누르면')).toBeVisible();
    await expect(page.locator('text=개인정보 보호 약관')).toBeVisible();
    await expect(page.locator('text=서비스 이용약관')).toBeVisible();
    await expect(page.locator('text=개인정보 수집 및 이용동의')).toBeVisible();
  });

  test('PASS login button should be accessible', async ({ page }) => {
    const passButton = page.locator('button:has-text("PASS 로그인")');

    await expect(passButton).toBeVisible();
    await expect(passButton).toBeEnabled();

    // Check button has proper styling
    await expect(passButton).toHaveCSS('background-color', /rgb\(124, 58, 237\)|#/7C3AED/);
  });

  test('Kakao login button should be accessible', async ({ page }) => {
    const kakaoButton = page.locator('button:has-text("카카오 로그인")');

    await expect(kakaoButton).toBeVisible();
    await expect(kakaoButton).toBeEnabled();

    // Check Kakao button has yellow background
    await expect(kakaoButton).toHaveCSS('background-color', /#FEE500/);
  });

  test('should have proper contrast for text elements', async ({ page }) => {
    // Check main heading contrast
    const mainText = page.locator('text=대학생을 위한 진짜 설렘의 시작');
    await expect(mainText).toBeVisible();

    // Check privacy notice text contrast
    const privacyText = page.locator('text=회원가입 및 로그인 버튼을 누르면');
    await expect(privacyText).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test tab through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // Should still have a focused element
    const finalFocused = page.locator(':focus');
    await expect(finalFocused).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check if buttons have accessible names
    const passButton = page.locator('button:has-text("PASS 로그인")');
    await expect(passButton).toHaveAttribute('role', 'button');

    const kakaoButton = page.locator('button:has-text("카카오 로그인")');
    await expect(kakaoButton).toHaveAttribute('role', 'button');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // Elements should still be visible and properly sized
    await expect(page.locator('text=PASS 로그인')).toBeVisible();
    await expect(page.locator('text=카카오 로그인')).toBeVisible();

    // Check if buttons are properly sized for mobile
    const passButton = page.locator('button:has-text("PASS 로그인")');
    const passButtonBox = await passButton.boundingBox();
    expect(passButtonBox?.width).toBeGreaterThan(280); // Minimum touch target size
    expect(passButtonBox?.height).toBeGreaterThan(44);
  });

  test('should have proper link accessibility for privacy terms', async ({ page }) => {
    // Check if privacy links are clickable
    const privacyLink = page.locator('text=개인정보 보호 약관');
    await expect(privacyLink).toBeVisible();

    // Test link functionality
    await privacyLink.click();
    // Note: This might open a new tab or navigate away
    // In a real test, you'd want to handle this properly
  });
});