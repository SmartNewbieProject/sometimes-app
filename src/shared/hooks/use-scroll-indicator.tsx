import { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

export const useScrollIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(true);
  const scrollViewRef = useRef<any>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    
    // 스크롤이 시작되면 인디케이터 숨김
    if (scrollY > 50) {
      setShowIndicator(false);
    } else {
      setShowIndicator(true);
    }
  };

  return {
    showIndicator,
    handleScroll,
    scrollViewRef,
  };
};