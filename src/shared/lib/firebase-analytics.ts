// TODO: Firebase Analytics is temporarily disabled for SDK 54 / New Architecture compatibility
// Reinstall @react-native-firebase/analytics when the package supports New Architecture (TurboModules)
// Tracking issue: https://github.com/invertase/react-native-firebase/discussions/6200

import firebase from '@react-native-firebase/app';

const ANALYTICS_DISABLED_WARNING = '[Firebase Analytics] Temporarily disabled for New Architecture compatibility';

/**
 * Firebase 연결 상태 확인
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const app = firebase.app();
    console.log('Firebase 앱 초기화됨:', app.name);
    console.log(ANALYTICS_DISABLED_WARNING);
    return true;
  } catch (error) {
    console.error('❌ Firebase 연결 실패:', error);
    return false;
  }
}

/**
 * Firebase 설정 정보 출력
 */
export function logFirebaseConfig() {
  try {
    const app = firebase.app();
    console.log('=== Firebase 설정 정보 ===');
    console.log('앱 이름:', app.name);
    console.log('프로젝트 ID:', app.options.projectId);
    console.log('앱 ID:', app.options.appId);
    console.log('API 키:', app.options.apiKey ? '설정됨' : '설정되지 않음');
    console.log('Analytics:', 'temporarily disabled');
    console.log('========================');
  } catch (error) {
    console.error('Firebase 설정 정보 확인 실패:', error);
  }
}

/**
 * 사용자 회원가입 이벤트 추적 (no-op)
 */
export async function trackSignUp(_method = 'email') {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 매칭권 결제창 클릭 이벤트 추적 (no-op)
 */
export async function trackPurchaseClick(_itemId: string, _itemName: string, _price: number) {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 실제 구매 완료 이벤트 추적 (no-op)
 */
export async function trackPurchase(_itemId: string, _itemName: string, _price: number, _transactionId: string) {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 로그인 이벤트 추적 (no-op)
 */
export async function trackLogin(_method = 'email') {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 화면 조회 이벤트 추적 (no-op)
 */
export async function trackScreenView(_screenName: string, _screenClass?: string) {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 커스텀 이벤트 추적 (no-op)
 */
export async function trackCustomEvent(_eventName: string, _parameters?: Record<string, unknown>) {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 사용자 속성 설정 (no-op)
 */
export async function setUserProperty(_name: string, _value: string) {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * 사용자 ID 설정 (no-op)
 */
export async function setUserId(_userId: string) {
  console.log(ANALYTICS_DISABLED_WARNING);
}

/**
 * Analytics 수집 활성화/비활성화 (no-op)
 */
export async function setAnalyticsCollectionEnabled(_enabled: boolean) {
  console.log(ANALYTICS_DISABLED_WARNING);
}
