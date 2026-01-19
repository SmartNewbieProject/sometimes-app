import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Dimensions, Image, StyleSheet, View } from "react-native";

export const Banner = () => {
  const width = Dimensions.get("window").width;
  const height = (() => {
    if (width > 400) {
      return 300;
    }
    return 280;
  })();

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.backgroundGradient} />
      <Image
        source={require("@/assets/images/gem-store-fox-main.webp")}
        style={styles.foxImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#D9C6F5",
  },
  foxImage: {
    width: 440,
    height: 360,
  },
});
