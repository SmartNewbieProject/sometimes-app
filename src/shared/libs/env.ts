/**
 * 환경 변수 헬퍼
 *
 * CRITICAL: Standalone 빌드는 Constants.expoConfig.extra만 사용 가능
 * process.env는 Expo Go에서만 작동함!
 */

console.log('🔧 [env.ts] START - Initializing environment variables...');

// Constants 로드
let Constants: any = null;
let extra: any = {};

try {
  Constants = require('expo-constants');

  // Handle both default export and direct export
  if (Constants.default) {
    Constants = Constants.default;
  }

  if (Constants?.expoConfig?.extra) {
    extra = Constants.expoConfig.extra;
    console.log('[env.ts] ✅ Loaded from Constants.expoConfig.extra');
    console.log('[env.ts] Available keys:', Object.keys(extra));
  } else {
    console.error('[env.ts] ❌ Constants.expoConfig.extra is undefined!');
    console.error('[env.ts] Constants:', Constants);
  }
} catch (error) {
  console.error('[env.ts] ❌ Failed to require expo-constants:', error);
}

// 환경 변수 값이 유효한지 검사 (${...} 패턴은 치환 실패를 의미)
const isValidEnvValue = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value) return false;
  if (value.includes('${') || value.includes('EXPO_PUBLIC_')) return false;
  return true;
};

// camelCase를 SCREAMING_SNAKE_CASE로 변환 (apiUrl -> API_URL)
const toEnvKey = (camelCase: string): string => {
  return camelCase.replace(/([A-Z])/g, '_$1').toUpperCase();
};

// 안전한 환경 변수 getter (Constants 우선, fallback 제공)
const getEnv = (extraKey: string, fallback: string = ''): string => {
  // 1. Constants.expoConfig.extra에서 먼저 시도
  const extraValue = extra?.[extraKey];
  if (isValidEnvValue(extraValue)) {
    return extraValue;
  }

  // 환경 변수 치환 실패 감지
  if (typeof extraValue === 'string' && extraValue.includes('${')) {
    console.error(`[env.ts] ❌ ENV substitution failed for ${extraKey}: "${extraValue}"`);
  }

  // 2. 웹 환경 또는 개발 환경에서 process.env 직접 사용
  if (typeof process !== 'undefined' && process.env) {
    const envKey = `EXPO_PUBLIC_${toEnvKey(extraKey)}`;
    const envValue = process.env[envKey];
    if (envValue) {
      console.log(`[env.ts] ✅ Using process.env.${envKey}`);
      return String(envValue);
    }
  }

  // 3. Fallback 사용
  if (fallback) {
    console.warn(`[env.ts] ⚠️ Using fallback for ${extraKey}: ${fallback}`);
  } else {
    console.error(`[env.ts] ❌ Missing value for ${extraKey}!`);
  }

  return fallback;
};

export const env = {
  // API 설정 (fallback 제공 - 최악의 경우 기본값 사용)
  API_URL: getEnv('apiUrl', 'https://api.some-in-univ.com/api'),
  SERVER_URL: getEnv('serverUrl', 'https://api.some-in-univ.com'),

  // 결제 설정
  CHANNEL_KEY: getEnv('channelKey', 'channel-key-8c65725c-a260-4f6c-bcfe-d2aad4378d25'),
  MERCHANT_ID: getEnv('merchantId', 'IMP2000065'),
  STORE_ID: getEnv('storeId', 'store-c9a240eb-bb47-4cc3-8cac-9433a2aa02e9'),
  IMP: getEnv('imp', 'imp21653002'),
  PG_PROVIDER: getEnv('pgProvider', 'welcome'),
  PASS_CHANNEL_KEY: getEnv('passChannelKey', 'channel-key-0552c128-ad81-4990-9795-5b2c573995da'),

  // 소셜 로그인
  KAKAO_LOGIN_API_KEY: getEnv('kakaoLoginApiKey', '228e892bfc0e42e824d592d92f52e72e'),
  KAKAO_REDIRECT_URI: getEnv('kakaoRedirectUri', 'https://some-in-univ.com/auth/login/redirect'),

  // 기타
  LINK: getEnv('link', 'https://some-in-univ.com'),
  MIXPANEL_TOKEN: getEnv('mixpanelToken', '3f1b97d815027821e7e1e93c73bad5a4'),
  SLACK_LOGGER: getEnv('slackLogger', ''),
  TRACKING_MODE: getEnv('trackingMode', 'production'),
} as const;

// 최종 검증
console.log('=================================');
console.log('[Environment] Final Config:');
console.log('  API_URL:', env.API_URL);
console.log('  SERVER_URL:', env.SERVER_URL);
console.log('  MERCHANT_ID:', env.MERCHANT_ID);
console.log('  CHANNEL_KEY:', env.CHANNEL_KEY.substring(0, 20) + '...');
console.log('=================================');

// 크래시 방지: API_URL이 없으면 경고만 (throw하면 앱이 시작도 안 됨)
if (!env.API_URL || env.API_URL === '') {
  console.error('[env.ts] ❌ CRITICAL: API_URL is not set!');
  console.error('[env.ts] This will cause API calls to fail.');
  console.error('[env.ts] Check app.config.ts and rebuild.');
}

// SERVER_URL 유효성 검사 (채팅 소켓 연결용)
if (!env.SERVER_URL || !env.SERVER_URL.startsWith('https://')) {
  console.error('[env.ts] ❌ CRITICAL: SERVER_URL is invalid!');
  console.error('[env.ts]   value:', env.SERVER_URL);
  console.error('[env.ts]   expected: https://api.some-in-univ.com');
  console.error('[env.ts]   → chat socket connection will fail on native');
} else {
  console.log('[env.ts] ✅ SERVER_URL OK:', env.SERVER_URL);
}
