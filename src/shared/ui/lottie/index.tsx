import LottieView from 'lottie-react-native';
import { StyleSheet, View, ViewStyle } from 'react-native';

export interface LottieProps {
  classNames?: string;
  size?: number;
  style?: ViewStyle;
}

export const Lottie = ({ 
  classNames,
  size = 80,
  style
}: LottieProps) => {
  const styles = StyleSheet.create({
    lottie: {
      width: size,
      height: size,
    },
  });
    // 브라우저에서 사용할 때 렌더링 오류 방지, 나중에 수정 필요
    if (typeof HTMLElement !== 'undefined') {
      const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
      HTMLElement.prototype.getBoundingClientRect = function() {
        const rect = originalGetBoundingClientRect.call(this);
        return {
          ...rect,
          width: size,
          height: size,
        };
      };
    }

  return (
    <View style={style} className={classNames}>
      <LottieView
        source={require('@assets/lottie.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};