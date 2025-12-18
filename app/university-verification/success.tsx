import ChevronLeftIcon from "@/assets/icons/chevron-left.svg";
import { useTranslation } from "react-i18next";
import { Header, PalePurpleGradient, Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { Image, Pressable, TouchableOpacity, View, ScrollView, StyleSheet } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";

export default function UniversityVerificationSuccess() {
  const { t } = useTranslation();
  const handleGoToProfile = () => {
    router.push("/home");
  };

  return (
    <View style={styles.container}>
      <PalePurpleGradient />
      <Header.Container>
        <Header.LeftContent>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeftIcon width={24} height={24} />
          </Pressable>
        </Header.LeftContent>
        <Header.CenterContent>
          <Text size="lg" weight="normal" textColor="black">
            {t("apps.university-verification.header_title")}
          </Text>
        </Header.CenterContent>
        <Header.RightContent />
      </Header.Container>

      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView}>
          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/verification-done.png")}
              style={{ width: 320, height: 320 }}
              resizeMode="contain"
            />
          </View>

          {/* 메인 텍스트 */}
          <View style={styles.textContainer}>
            <Text size="lg" weight="normal" textColor="black" style={styles.textMarginBottom1}>
              {t("apps.university-verification.success.congratulations")}
            </Text>
            <Text size="lg" weight="normal" textColor="black" style={styles.textMarginBottom2}>
              {t("apps.university-verification.success.verification_complete")}
            </Text>

            <Text size="sm" weight="normal" style={[styles.disabledText, styles.textMarginBottom1]}>
              구슬 9개를 받았어요!
            </Text>
            <Text size="sm" weight="normal" style={[styles.disabledText, styles.textMarginBottom1]}>
              이제 안심하고 시작해볼까요?
            </Text>
            <Text size="sm" weight="normal" style={styles.disabledText}>
              내가 있는 지역에서 이상형을 안전하게 만나보세요!
            </Text>
          </View>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            onPress={handleGoToProfile}
            style={styles.primaryButton}
          >
            <Text size="md" weight="semibold" textColor="white">
              {t("apps.university-verification.success.go_to_find_ideal_type")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  contentContainer: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageContainer: {
    marginBottom: 32,
    marginTop: 32,
    alignItems: "center",
    marginLeft: 24,
  },
  textContainer: {
    marginBottom: 128,
    width: "80%",
    alignItems: "flex-start",
  },
  textMarginBottom1: {
    marginBottom: 4,
  },
  textMarginBottom2: {
    marginBottom: 8,
  },
  disabledText: {
    color: semanticColors.text.disabled,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 32,
    left: 20,
    right: 20,
  },
  primaryButton: {
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
});
