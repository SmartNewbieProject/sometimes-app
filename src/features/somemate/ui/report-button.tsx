import { Image } from "expo-image";
import { semanticColors } from '../../../shared/constants/colors';
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export const ReportButton = () => {
  return (
    <Pressable
      style={styles.reportButton}
      onPress={() => router.push("/chat/somemate-report")}
    >
      <Image
        source={require("@assets/images/details.png")}
        style={styles.reportIcon}
        contentFit="contain"
      />
      <Text style={styles.reportButtonText}>리포트 보러가기</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    width: "100%",
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: semanticColors.brand.primary,
    backgroundColor: semanticColors.surface.background,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  reportIcon: {
    width: 30,
    height: 30,
  },
  reportButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: semanticColors.brand.primary,
    fontFamily: "Pretendard-SemiBold",
  },
});

