import analytics from '@react-native-firebase/analytics';
import firebase from '@react-native-firebase/app';

/**
 * Firebase 연결 상태 확인
 */
export async function checkFirebaseConnection(): Promise<boolean> {
  try {
    const app = firebase.app();
    console.log('Firebase 앱 초기화됨:', app.name);
    
    const instanceId = await analytics().getAppInstanceId();
    console.log('Analytics 인스턴스 ID:', instanceId);
    
    await analytics().logEvent('connection_test', {
      timestamp: Date.now(),
      platform: 'react-native',
    });
    
    console.log('✅ Firebase Analytics 연결 성공!');
    return true;
  } catch (error) {
    console.error('❌ Firebase Analytics 연결 실패:', error);
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
    console.log('========================');
  } catch (error) {
    console.error('Firebase 설정 정보 확인 실패:', error);
  }
}

/**
 * 사용자 회원가입 이벤트 추적
 */
export async function trackSignUp(method = 'email') {
  try {
    await analytics().logSignUp({
      method,
    });
    console.log('회원가입 이벤트 추적됨:', method);
  } catch (error) {
    console.error('회원가입 이벤트 추적 실패:', error);
  }
}

/**
 * 매칭권 결제창 클릭 이벤트 추적
 */
export async function trackPurchaseClick(itemId: string, itemName: string, price: number) {
  try {
    await analytics().logEvent('purchase_click', {
      item_id: itemId,
      item_name: itemName,
      price: price,
      currency: 'KRW',
    });
    console.log('매칭권 결제창 클릭 이벤트 추적됨:', itemName);
  } catch (error) {
    console.error('매칭권 결제창 클릭 이벤트 추적 실패:', error);
  }
}

/**
 * 실제 구매 완료 이벤트 추적
 */
export async function trackPurchase(itemId: string, itemName: string, price: number, transactionId: string) {
  try {
    await analytics().logPurchase({
      currency: 'KRW',
      value: price,
      items: [
        {
          item_id: itemId,
          item_name: itemName,
          price: price,
          quantity: 1,
        },
      ],
      transaction_id: transactionId,
    });
    console.log('구매 완료 이벤트 추적됨:', itemName);
  } catch (error) {
    console.error('구매 완료 이벤트 추적 실패:', error);
  }
}

/**
 * 로그인 이벤트 추적
 */
export async function trackLogin(method = 'email') {
  try {
    await analytics().logLogin({
      method,
    });
    console.log('로그인 이벤트 추적됨:', method);
  } catch (error) {
    console.error('로그인 이벤트 추적 실패:', error);
  }
}

/**
 * 화면 조회 이벤트 추적
 */
export async function trackScreenView(screenName: string, screenClass?: string) {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log('화면 조회 이벤트 추적됨:', screenName);
  } catch (error) {
    console.error('화면 조회 이벤트 추적 실패:', error);
  }
}

/**
 * 커스텀 이벤트 추적
 */
export async function trackCustomEvent(eventName: string, parameters?: Record<string, unknown>) {
  try {
    await analytics().logEvent(eventName, parameters);
    console.log('커스텀 이벤트 추적됨:', eventName, parameters);
  } catch (error) {
    console.error('커스텀 이벤트 추적 실패:', error);
  }
}

/**
 * 사용자 속성 설정
 */
export async function setUserProperty(name: string, value: string) {
  try {
    await analytics().setUserProperty(name, value);
    console.log('사용자 속성 설정됨:', name, value);
  } catch (error) {
    console.error('사용자 속성 설정 실패:', error);
  }
}

/**
 * 사용자 ID 설정
 */
export async function setUserId(userId: string) {
  try {
    await analytics().setUserId(userId);
    console.log('사용자 ID 설정됨:', userId);
  } catch (error) {
    console.error('사용자 ID 설정 실패:', error);
  }
}

/**
 * Analytics 수집 활성화/비활성화
 */
export async function setAnalyticsCollectionEnabled(enabled: boolean) {
  try {
    await analytics().setAnalyticsCollectionEnabled(enabled);
    console.log('Analytics 수집 상태 변경됨:', enabled);
  } catch (error) {
    console.error('Analytics 수집 상태 변경 실패:', error);
  }
}
