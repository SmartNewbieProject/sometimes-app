import { Platform } from 'react-native';

type Params = Record<string, string | number>;
let AppEventsLogger: any = null;
let Settings: any = null;
let isSDKLoaded = false;

if (Platform.OS !== 'web') {
  try {
    const fbsdk = require('react-native-fbsdk-next');
    AppEventsLogger = fbsdk.AppEventsLogger;
    Settings = fbsdk.Settings;

    if (AppEventsLogger && Settings && typeof Settings.initializeSDK === 'function') {
      isSDKLoaded = true;
      console.log('✅ Facebook SDK 로드 성공');
    } else {
      console.warn('❌ Facebook SDK 객체가 올바르지 않습니다');
      AppEventsLogger = null;
      Settings = null;
    }
  } catch (error) {
    console.warn('❌ Facebook SDK 로드 실패:', error);
    AppEventsLogger = null;
    Settings = null;
  }
}

/**
 * Facebook SDK 초기화
 */
export function initializeFacebookSDK() {
  if (Platform.OS === 'web') {
    console.log('⚠️ Facebook SDK는 웹에서 지원되지 않습니다');
    return;
  }

  if (!isSDKLoaded || !Settings) {
    console.warn('❌ Facebook SDK가 로드되지 않았습니다');
    return;
  }

  try {
    if (typeof Settings.initializeSDK === 'function') {
      Settings.initializeSDK();
      console.log('✅ Facebook SDK 초기화 완료');
    } else {
      console.error('❌ Settings.initializeSDK가 함수가 아닙니다');
    }
  } catch (error) {
    console.error('❌ Facebook SDK 초기화 실패:', error);
  }
}

/**
 * Facebook SDK 연결 상태 확인
 */
export function checkFacebookConnection(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('⚠️ Facebook SDK는 웹에서 지원되지 않습니다');
    return Promise.resolve(false);
  }

  if (!isSDKLoaded || !AppEventsLogger) {
    console.warn('❌ Facebook SDK가 로드되지 않았습니다');
    return Promise.resolve(false);
  }

  try {
    if (typeof AppEventsLogger.logEvent === 'function') {
      AppEventsLogger.logEvent('connection_test', {
        timestamp: Date.now(),
        platform: 'react-native',
      });

      console.log('✅ Facebook App Events 연결 성공!');
      return Promise.resolve(true);
    } else {
      console.error('❌ AppEventsLogger.logEvent가 함수가 아닙니다');
      return Promise.resolve(false);
    }
  } catch (error) {
    console.error('❌ Facebook App Events 연결 실패:', error);
    return Promise.resolve(false);
  }
}

/**
 * Facebook SDK 사용 가능 여부 확인
 */
function isFacebookSDKAvailable(): boolean {
  if (Platform.OS === 'web') {
    console.log('⚠️ Facebook SDK는 웹에서 지원되지 않습니다');
    return false;
  }

  if (!isSDKLoaded || !AppEventsLogger || typeof AppEventsLogger.logEvent !== 'function') {
    console.warn('❌ Facebook SDK가 로드되지 않았거나 사용할 수 없습니다');
    return false;
  }

  return true;
}

/**
 * 앱 실행 이벤트
 */
export function logAppLaunch() {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logEvent('fb_mobile_activate_app');
    console.log('앱 실행 이벤트 추적됨');
  } catch (error) {
    console.error('앱 실행 이벤트 추적 실패:', error);
  }
}

/**
 * 회원가입 이벤트
 */
export function logSignUp(method = 'pass') {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.CompletedRegistration, {
      [AppEventsLogger.AppEventParams.RegistrationMethod]: method,
    });
    console.log('회원가입 이벤트 추적됨:', method);
  } catch (error) {
    console.error('회원가입 이벤트 추적 실패:', error);
  }
}

/**
 * 로그인 이벤트
 */
export function logLogin(method = 'pass') {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logEvent('fb_mobile_login', {
      method,
    });
    console.log('로그인 이벤트 추적됨:', method);
  } catch (error) {
    console.error('로그인 이벤트 추적 실패:', error);
  }
}

/**
 * 구매 이벤트 (매칭권 등)
 */
export function logPurchase(amount: number, currency = 'KRW', parameters?: Params) {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logPurchase(amount, currency, parameters);
    console.log('구매 이벤트 추적됨:', amount, currency);
  } catch (error) {
    console.error('구매 이벤트 추적 실패:', error);
  }
}

/**
 * 콘텐츠 조회 이벤트
 */
export function logViewContent(contentType: string, contentId?: string) {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.ViewedContent, {
      [AppEventsLogger.AppEventParams.ContentType]: contentType,
      [AppEventsLogger.AppEventParams.ContentID]: contentId || '',
    });
    console.log('콘텐츠 조회 이벤트 추적됨:', contentType);
  } catch (error) {
    console.error('콘텐츠 조회 이벤트 추적 실패:', error);
  }
}

/**
 * 검색 이벤트
 */
export function logSearch(searchString: string, contentType?: string) {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logEvent(AppEventsLogger.AppEvents.Searched, {
      [AppEventsLogger.AppEventParams.SearchString]: searchString,
      [AppEventsLogger.AppEventParams.ContentType]: contentType || '',
    });
    console.log('검색 이벤트 추적됨:', searchString);
  } catch (error) {
    console.error('검색 이벤트 추적 실패:', error);
  }
}

/**
 * 커스텀 이벤트
 */
export function logCustomEvent(eventName: string, parameters?: Params) {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.logEvent(eventName, parameters);
    console.log('커스텀 이벤트 추적됨:', eventName, parameters);
  } catch (error) {
    console.error('커스텀 이벤트 추적 실패:', error);
  }
}

/**
 * 사용자 속성 설정
 */
export function setUserData(userData: {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'm' | 'f';
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}) {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.setUserData(userData);
    console.log('사용자 데이터 설정됨:', userData);
  } catch (error) {
    console.error('사용자 데이터 설정 실패:', error);
  }
}

/**
 * 사용자 ID 설정
 */
export function setUserID(userID: string) {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.setUserID(userID);
    console.log('사용자 ID 설정됨:', userID);
  } catch (error) {
    console.error('사용자 ID 설정 실패:', error);
  }
}

/**
 * 이벤트 즉시 전송 (플러시)
 */
export function flushEvents() {
  if (!isFacebookSDKAvailable()) return;

  try {
    AppEventsLogger.flush();
    console.log('Facebook 이벤트 플러시 완료');
  } catch (error) {
    console.error('Facebook 이벤트 플러시 실패:', error);
  }
}

/**
 * 광고 추적 활성화/비활성화 (iOS)
 */
export function setAdvertiserTrackingEnabled(enabled: boolean) {
  if (!isFacebookSDKAvailable() || !Settings) return;

  try {
    Settings.setAdvertiserTrackingEnabled(enabled);
    console.log('광고 추적 상태 변경됨:', enabled);
  } catch (error) {
    console.error('광고 추적 상태 변경 실패:', error);
  }
}
