import { View , Platform, ScrollView, StyleSheet } from "react-native";

import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children: React.ReactNode;
};
export const ContentLayout = ({ children }: Props) => {
  return (
    <View style={styles.shadowWrapper}>
      <ScrollView style={[styles.container]}>
        <LinearGradient
          colors={[
            "rgba(186,156,238,0.40)",
            "rgba(186,156,238,0.2)",
            "rgba(186,156,238,0)",
          ]}
          style={styles.topShadow}
          pointerEvents="none"
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowWrapper: {
    width: "100%",
    backgroundColor: semanticColors.surface.secondary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    top: -32,

    paddingBottom: 28,
    position: "relative",
    flex: 1,
  },
  container: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flex: 1,
    backgroundColor: semanticColors.surface.secondary,
    flexDirection: "column",
    display: "flex",
  },
  topShadow: {
    height: 32,
  },
});
