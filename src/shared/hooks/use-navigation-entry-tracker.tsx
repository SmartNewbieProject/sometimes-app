import { useRef, useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

/**
 * 네비게이션 진입 추적 훅
 * 사용자가 이전에 어떤 화면에 있었는지 추적하여 젬 스토어 진입 경로 분석
 */
export const useNavigationEntryTracker = () => {
  const navigation = useNavigation();
  const previousScreenRef = useRef<string>('unknown');
  const screenHistoryRef = useRef<string[]>([]);

  /**
   * 현재 화면 경로에서 스크린 이름 추출
   * @param route 라우트 객체
   * @returns 스크린 이름
   */
  const getScreenName = useCallback((route: any): string => {
    if (!route?.name) return 'unknown';

    // 라우트 이름에서 스크린 패턴에 맞게 변환
    const routeName = route.name;

    // Match 컴포넌트 라우팅 패턴
    if (routeName.includes('match')) return 'matching';
    if (routeName.includes('chat')) return 'chat';
    if (routeName.includes('profile')) return 'profile';
    if (routeName.includes('community')) return 'community';
    if (routeName.includes('moment')) return 'moment';
    if (routeName.includes('purchase') || routeName.includes('store')) return 'store';
    if (routeName.includes('auth') || routeName.includes('login')) return 'auth';
    if (routeName.includes('onboarding')) return 'onboarding';
    if (routeName.includes('settings')) return 'settings';

    // 기본값: 라우트 이름 소문자 변환
    return routeName.toLowerCase();
  }, []);

  /**
   * 이전 화면 이름 가져오기
   * @returns 이전 화면 이름
   */
  const getPreviousScreen = useCallback((): string => {
    return previousScreenRef.current;
  }, []);

  /**
   * 화면 히스토리 가져오기
   * @returns 최근 5개 화면 히스토리
   */
  const getScreenHistory = useCallback((): string[] => {
    return screenHistoryRef.current.slice(-5);
  }, []);

  /**
   * 화면 포커스 변경 시 추적
   */
  useFocusEffect(
    useCallback(() => {
      const currentRoute = navigation.getState()?.routes?.[navigation.getState()?.index];
      const currentScreen = getScreenName(currentRoute);

      if (currentScreen !== 'unknown' && currentScreen !== previousScreenRef.current) {
        // 화면 히스토리 업데이트
        screenHistoryRef.current.push(currentScreen);

        // 히스토리 길이 제한 (최근 10개)
        if (screenHistoryRef.current.length > 10) {
          screenHistoryRef.current = screenHistoryRef.current.slice(-10);
        }

        console.log('📍 Screen navigation:', {
          from: previousScreenRef.current,
          to: currentScreen,
          history: screenHistoryRef.current.slice(-3),
        });
      }

      return () => {
        // 화면이 바뀌기 전에 현재 화면을 이전 화면으로 저장
        previousScreenRef.current = currentScreen;
      };
    }, [navigation, getScreenName])
  );

  return {
    getPreviousScreen,
    getScreenHistory,
    currentScreen: previousScreenRef.current,
  };
};