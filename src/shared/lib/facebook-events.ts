import { AppEventsLogger, Settings } from 'react-native-fbsdk-next';

type Params = Record<string, string | number>;

/**
 * Facebook SDK 초기화
 */
export function initializeFacebookSDK() {
  try {
    Settings.initializeSDK();
    console.log('✅ Facebook SDK 초기화 완료');
  } catch (error) {
    console.error('❌ Facebook SDK 초기화 실패:', error);
  }
}

/**
 * Facebook SDK 연결 상태 확인
 */
export function checkFacebookConnection(): Promise<boolean> {
  try {
    // 테스트 이벤트 전송
    AppEventsLogger.logEvent('connection_test', {
      timestamp: Date.now(),
      platform: 'react-native',
    });
    
    console.log('✅ Facebook App Events 연결 성공!');
    return Promise.resolve(true);
  } catch (error) {
    console.error('❌ Facebook App Events 연결 실패:', error);
    return Promise.resolve(false);
  }
}

/**
 * 앱 실행 이벤트
 */
export function logAppLaunch() {
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
  try {
    Settings.setAdvertiserTrackingEnabled(enabled);
    console.log('광고 추적 상태 변경됨:', enabled);
  } catch (error) {
    console.error('광고 추적 상태 변경 실패:', error);
  }
}
