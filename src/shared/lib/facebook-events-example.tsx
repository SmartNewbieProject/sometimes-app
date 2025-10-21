import { View, Button, Alert, Platform } from 'react-native';
import {
  initializeFacebookSDK,
  checkFacebookConnection,
  logSignUp,
  logLogin,
  logPurchase,
  logViewContent,
  logSearch,
  setUserID,
  setUserData,
  flushEvents
} from './facebook-events';
import { useAtt } from '@/src/shared/hooks';

/**
 * Facebook App Events 테스트 컴포넌트
 */
export const FacebookEventsExample = () => {
  const { request: requestAtt, allowRequestAtt } = useAtt();
  const handleCheckATTPermission = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('⚠️ ATT 권한은 iOS에서만 필요합니다');
      return;
    }

    try {
      await requestAtt();
      Alert.alert(
        'ATT 권한 상태',
        `현재 상태: ${allowRequestAtt}\n\niOS 14.5+에서 Facebook 이벤트 추적을 위해 필요합니다.`
      );
    } catch (error) {
      Alert.alert('ATT 권한 확인 실패', String(error));
    }
  };

  const handleInitializeAndTest = async () => {
    initializeFacebookSDK();
    const isConnected = await checkFacebookConnection();
    Alert.alert(isConnected ? '✅ Facebook SDK 연결 성공!' : '❌ Facebook SDK 연결 실패!');
  };

  const handleSignUpEvent = () => {
    logSignUp('pass');
    Alert.alert('회원가입 이벤트가 Facebook에 전송되었습니다.');
  };

  const handleLoginEvent = () => {
    logLogin('pass');
    Alert.alert('로그인 이벤트가 Facebook에 전송되었습니다.');
  };

  const handlePurchaseEvent = () => {
    logPurchase(5000, 'KRW', {
      item_name: '매칭권 1개',
      item_category: 'matching_ticket',
    });
    Alert.alert('구매 이벤트가 Facebook에 전송되었습니다.');
  };

  const handleViewContentEvent = () => {
    logViewContent('profile', 'user_profile_123');
    Alert.alert('콘텐츠 조회 이벤트가 Facebook에 전송되었습니다.');
  };

  const handleSearchEvent = () => {
    logSearch('서울대학교', 'university');
    Alert.alert('검색 이벤트가 Facebook에 전송되었습니다.');
  };

  const handleSetUserData = () => {
    setUserID('user_12345');
    setUserData({
      email: 'test@example.com',
      firstName: '홍',
      lastName: '길동',
      city: '서울',
      country: 'KR',
    });
    Alert.alert('사용자 정보가 Facebook에 설정되었습니다.');
  };

  const handleFlushEvents = () => {
    flushEvents();
    Alert.alert('모든 이벤트가 Facebook에 즉시 전송되었습니다.');
  };

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Button title="🛡️ ATT 권한 확인 (iOS 14.5+)" onPress={handleCheckATTPermission} />
      <Button title="🔗 Facebook SDK 초기화 & 연결 테스트" onPress={handleInitializeAndTest} />
      <Button title="👤 회원가입 이벤트" onPress={handleSignUpEvent} />
      <Button title="🔑 로그인 이벤트" onPress={handleLoginEvent} />
      <Button title="💳 구매 이벤트 (매칭권)" onPress={handlePurchaseEvent} />
      <Button title="👀 콘텐츠 조회 이벤트" onPress={handleViewContentEvent} />
      <Button title="🔍 검색 이벤트" onPress={handleSearchEvent} />
      <Button title="📝 사용자 정보 설정" onPress={handleSetUserData} />
      <Button title="📤 이벤트 즉시 전송" onPress={handleFlushEvents} />
    </View>
  );
};

/**
 * 실제 앱에서 사용 예시:
 * 
 * 1. 앱 시작 시 초기화:
 * ```typescript
 * import { initializeFacebookSDK } from '@/src/shared/lib/facebook-events';
 *
 * // App.tsx에서
 * useEffect(() => {
 *   initializeFacebookSDK();
 * }, []);
 * ```
 *
 * 2. 회원가입 완료 시:
 * ```typescript
 * import { logSignUp } from '@/src/shared/lib/facebook-events';
 *
 * const handleSignUpComplete = () => {
 *   logSignUp('pass');
 *   // 기타 회원가입 완료 로직...
 * };
 * ```
 *
 * 3. 매칭권 구매 시:
 * ```typescript
 * import { logPurchase } from '@/src/shared/lib/facebook-events';
 *
 * const handlePurchaseComplete = (amount: number) => {
 *   logPurchase(amount, 'KRW', {
 *     item_name: '매칭권',
 *     item_category: 'matching_ticket',
 *   });
 * };
 * ```
 *
 * 4. 사용자 로그인 시:
 * ```typescript
 * import { logLogin, setUserID } from '@/src/shared/lib/facebook-events';
 *
 * const handleLoginSuccess = (userId: string) => {
 *   logLogin('pass');
 *   setUserID(userId);
 * };
 * ```
 */
