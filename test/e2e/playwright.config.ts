import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E 테스트 설정
 * React Native Web 애플리케이션 테스트용
 */
export default defineConfig({
  testDir: './specs',

  // 테스트 실행 설정
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 리포터 설정
  reporter: [
    ['html', { outputFolder: './test-results/html' }],
    ['json', { outputFile: './test-results/results.json' }],
    ['list']
  ],

  // 타임아웃 설정
  timeout: 60 * 1000, // 60초
  expect: {
    timeout: 10 * 1000 // 10초
  },

  use: {
    // 기본 URL (로컬 개발 서버)
    baseURL: 'http://localhost:3000',

    // 스크린샷 및 비디오 설정
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',

    // 브라우저 컨텍스트 옵션
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro 사이즈
    actionTimeout: 10 * 1000,
  },

  // 테스트 프로젝트 (브라우저별)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 }
      },
    },

    // 모바일 뷰포트 테스트
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5']
      },
    },

    // iPhone 테스트
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 14 Pro']
      },
    },
  ],

  // 로컬 개발 서버 자동 시작 (선택사항)
  // webServer: {
  //   command: 'npm start -- --web',
  //   url: 'http://localhost:19006',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});
