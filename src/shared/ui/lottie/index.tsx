import { StyleSheet, View, type ViewStyle, ActivityIndicator } from "react-native";
import { Text } from "../text";

export interface LottieProps {
  size?: number;
  style?: ViewStyle;
}

export const Lottie = ({ size = 80, style }: LottieProps) => {
  const styles = StyleSheet.create({
    lottie: {
      width: size,
      height: size,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  const containerStyle = [styles.lottie, style];

  return (
    <View style={containerStyle}>
      <ActivityIndicator size="large" color="#8C6AE3" />
    </View>
  );
};
