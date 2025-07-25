import { View, Button, Alert } from 'react-native';
import { checkFirebaseConnection, logFirebaseConfig, trackSignUp, trackPurchaseClick, trackPurchase, trackLogin, trackScreenView, setUserId, setUserProperty } from './firebase-analytics';

/**
 * Firebase Analytics 사용 예제 컴포넌트
 * 실제 앱에서는 이 함수들을 적절한 위치에서 호출하세요.
 */
export const AnalyticsExample = () => {
  // Firebase 연결 테스트
  const handleConnectionTest = async () => {
    logFirebaseConfig();
    const isConnected = await checkFirebaseConnection();
    Alert.alert(isConnected ? '✅ Firebase 연결 성공!' : '❌ Firebase 연결 실패!');
  };

  // 회원가입 완료 시 호출
  const handleSignUp = async () => {
    await trackSignUp('pass'); // PASS 인증으로 회원가입
    Alert.alert('회원가입 이벤트가 추적되었습니다.');
  };

  // 매칭권 결제 버튼 클릭 시 호출
  const handlePurchaseClick = async () => {
    await trackPurchaseClick(
      'matching_ticket_1',
      '매칭권 1개',
      5000
    );
    Alert.alert('매칭권 결제 클릭 이벤트가 추적되었습니다.');
  };

  // 실제 결제 완료 시 호출
  const handlePurchaseComplete = async () => {
    await trackPurchase(
      'matching_ticket_1',
      '매칭권 1개',
      5000,
      `txn_${Date.now()}`
    );
    Alert.alert('구매 완료 이벤트가 추적되었습니다.');
  };

  // 로그인 완료 시 호출
  const handleLogin = async () => {
    await trackLogin('pass'); // PASS 인증으로 로그인
    Alert.alert('로그인 이벤트가 추적되었습니다.');
  };

  // 화면 진입 시 호출 (useEffect 등에서)
  const handleScreenView = async () => {
    await trackScreenView('홈화면', 'HomeScreen');
    Alert.alert('화면 조회 이벤트가 추적되었습니다.');
  };

  // 사용자 정보 설정 (로그인 후)
  const handleSetUserInfo = async () => {
    await setUserId('user_12345');
    await setUserProperty('university', '서울대학교');
    await setUserProperty('age_group', '20-25');
    Alert.alert('사용자 정보가 설정되었습니다.');
  };

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Button title="🔗 Firebase 연결 테스트" onPress={handleConnectionTest} />
      <Button title="회원가입 이벤트 추적" onPress={handleSignUp} />
      <Button title="매칭권 결제 클릭 추적" onPress={handlePurchaseClick} />
      <Button title="구매 완료 추적" onPress={handlePurchaseComplete} />
      <Button title="로그인 이벤트 추적" onPress={handleLogin} />
      <Button title="화면 조회 추적" onPress={handleScreenView} />
      <Button title="사용자 정보 설정" onPress={handleSetUserInfo} />
    </View>
  );
};

/**
 * 실제 사용 예시:
 * 
 * 1. 회원가입 완료 시:
 * ```typescript
 * import { Analytics } from '@/shared/lib/analytics';
 * 
 * const handleSignUpComplete = async () => {
 *   await Analytics.trackSignUp('pass');
 *   // 기타 회원가입 완료 로직...
 * };
 * ```
 * 
 * 2. 매칭권 구매 버튼 클릭 시:
 * ```typescript
 * const handlePurchaseButtonClick = async () => {
 *   await Analytics.trackPurchaseClick('matching_ticket_1', '매칭권 1개', 5000);
 *   // 결제 페이지로 이동...
 * };
 * ```
 * 
 * 3. 화면 진입 시 (React Navigation 사용):
 * ```typescript
 * import { useFocusEffect } from '@react-navigation/native';
 * 
 * useFocusEffect(
 *   useCallback(() => {
 *     Analytics.trackScreenView('홈화면', 'HomeScreen');
 *   }, [])
 * );
 * ```
 * 
 * 4. 로그인 완료 시:
 * ```typescript
 * const handleLoginSuccess = async (userId: string) => {
 *   await Analytics.trackLogin('pass');
 *   await Analytics.setUserId(userId);
 *   // 기타 로그인 완료 로직...
 * };
 * ```
 */
