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