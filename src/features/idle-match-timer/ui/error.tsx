import { Text } from "@shared/ui";
import { Image } from "expo-image";
import { StyleSheet, View, Text as RNText } from "react-native";
import { useTranslation } from "react-i18next";
import colors from "@/src/shared/constants/colors";

export const Error = () => {
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
});
