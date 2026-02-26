import { Text } from "@shared/ui";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View, Text as RNText } from "react-native";
import { useTranslation } from "react-i18next";
import colors from "@/src/shared/constants/colors";

type ErrorProps = {
  onRetry?: () => void;
};

export const Error = ({ onRetry }: ErrorProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/sad-miho.webp")}
        style={styles.image}
        contentFit="contain"
      />
      <RNText style={styles.text}>
        <RNText style={styles.highlight}>
          {t("features.idle-match-timer.ui.error.highlight")}
        </RNText>
        {t("features.idle-match-timer.ui.error.message")}
      </RNText>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RNText style={styles.retryText}>
            {t("features.idle-match-timer.ui.error.retry", { defaultValue: "다시 시도" })}
          </RNText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  image: {
    width: 144,
    height: 144,
    marginBottom: 24,
  },
  text: {
    textAlign: "center",
    lineHeight: 28,
    fontSize: 18,
    fontFamily: "Pretendard-Bold",
    fontWeight: "700",
    color: colors.black,
  },
  highlight: {
    color: colors.primaryPurple,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: colors.primaryPurple,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Pretendard-Bold",
    fontWeight: "700",
  },
});
