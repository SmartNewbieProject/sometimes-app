import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from "@/src/shared/constants/colors";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View, Linking, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApprovalRejectedScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const rejectionReason =
    (params.rejectionReason as string) || t("apps.auth.approval-rejected.card_reason_default");
  const phoneNumber = params.phoneNumber as string;
  const { logoutOnly } = useAuth();

  const handleReapply = () => {
    router.push({
      pathname: "/auth/reapply",
      params: { phoneNumber, rejectionReason },
    });
  };

  const handleContactSupport = () => {
    Linking.openURL(
      "https://www.instagram.com/sometime.in.univ?igsh=MTdxMWJjYmFrdGc3Ng=="
    );
  };

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top }}
      >
        <View style={styles.contentWrapper}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>
          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <View style={styles.imageBackground} />
            <Image
              source={require("@assets/images/limit-signup.webp")}
              style={styles.mainImage}
            />
          </View>

          {/* 제목 */}
          <View style={styles.titleContainer}>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              style={styles.textLeft}
            >
              {t("apps.auth.approval-rejected.title")}
            </Text>
          </View>

          {/* 설명 */}
          <View style={styles.descriptionContainer}>
            <Text
              size="md"
              textColor="gray"
              weight="light"
              style={styles.descriptionText}
            >
              {t("apps.auth.approval-rejected.desc")}
            </Text>
          </View>

          {/* 거절 사유 카드 */}
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconCircle}>
                  <Text size="12" textColor="white" weight="bold">
                    !
                  </Text>
                </View>
                <View style={styles.flex1}>
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    style={styles.cardTitle}
                  >
                    {t("apps.auth.approval-rejected.card_title")}
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    {rejectionReason}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 안내 텍스트 */}
          <Text
            size="sm"
            textColor="gray"
            weight="light"
            style={styles.guideText}
          >
            {t("apps.auth.approval-rejected.guide")}
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.bottomContainer}>
        <Button
          variant="primary"
          size="md"
          onPress={handleReapply}
          styles={styles.primaryButton}
        >
          <View style={styles.buttonContent}>
            <Text
              size="md"
              textColor="white"
              weight="semibold"
              style={styles.buttonIcon}
            >
              ↻
            </Text>
            <Text size="md" textColor="white" weight="semibold">
              {t("apps.auth.approval-rejected.button_reapply")}
            </Text>
          </View>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onPress={handleContactSupport}
          styles={styles.secondaryButton}
        >
          <View style={styles.buttonContent}>
            <Text size="md" textColor="gray" weight="medium" style={styles.buttonIcon}>
              🎧
            </Text>
            <Text size="md" textColor="gray" weight="medium">
              {t("apps.auth.approval-rejected.button_support")}
            </Text>
          </View>
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  logoContainer: {
    marginTop: 10,
    marginBottom: 28,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  imageBackground: {
    width: 165,
    height: 165,
    borderRadius: 81,
    top: -8,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    position: "absolute",
  },
  mainImage: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  titleContainer: {
    width: "100%",
    marginBottom: 16,
  },
  textLeft: {
    textAlign: "left",
  },
  descriptionContainer: {
    width: "100%",
    marginBottom: 32,
  },
  descriptionText: {
    textAlign: "left",
    lineHeight: 24,
  },
  cardWrapper: {
    width: "100%",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#FAF5FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    borderRadius: 12,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  flex1: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 4,
  },
  guideText: {
    textAlign: "center",
    marginTop: 32,
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
  },
  secondaryButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
});
