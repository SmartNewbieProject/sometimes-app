import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';

export const Lottie = () => {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@assets/lottie.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 100,
    height: 100,
  },
});