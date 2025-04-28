import { Keyboard, Platform } from 'react-native';
import { useEffect, useState } from 'react';

export const useKeyboarding = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [initialHeight, setInitialHeight] = useState(0);

  // 일반적인 키보드 이벤트 리스너
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // 웹 환경에서 추가적인 감지 로직 (인스타그램 내부 브라우저 등을 위한 보완책)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // 초기 화면 높이 저장
      setInitialHeight(window.innerHeight);

      const handleResize = () => {
        // 화면 높이가 크게 줄어들면 키보드가 표시된 것으로 간주
        const heightDifference = initialHeight - window.innerHeight;
        if (heightDifference > 150) {
          setKeyboardVisible(true);
        } else {
          setKeyboardVisible(false);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [initialHeight]);

  return { isKeyboardVisible };
};
