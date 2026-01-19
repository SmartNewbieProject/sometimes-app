import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import { DefaultLayout } from "@/src/features/layout/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import colors from "@/src/shared/constants/colors";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { BackHandler, ScrollView, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApprovalPendingScreen() {
  const { t } = useTranslation();
  const { logoutOnly } = useAuth();
  const { my } = useAuth();
  const { data: statusData } = useUserStatus(my.phoneNumber);
  const handleGoToLogin = async () => {
    await logoutOnly();
    router.push("/auth/login");
  };
  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/auth/login");
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, []);

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.contentWrapper}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <View style={styles.outerCircle} />
            <View style={styles.middleCircle} />
            <View style={styles.innerCircle} />
            <Image
              source={
                statusData?.profileImage ??
                require("@/assets/images/signup-pending.webp")
              }
              style={styles.profileImage}
              contentFit="contain"
            />
          </View>

          {/* 제목 */}
          <View style={styles.titleContainer}>
            <Text
              size="lg"
              textColor="black"
              weight="semibold"
              style={styles.centerText}
            >{t("apps.auth.approval-pending.title")}
            </Text>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              style={styles.subtitleText}
            >
              {t("apps.auth.approval-pending.waiting_approval")}
            </Text>
          </View>

          {/* 설명 */}
          <View style={styles.descContainer}>
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              style={styles.centerText}
            >{t("apps.auth.approval-pending.notify_push")}
            </Text>
          </View>

          {/* 승인 대기 카드 */}
          <View style={styles.cardWrapper}>
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.iconCircle}>
                  <Text size="12" textColor="white" weight="bold">
                    ⏱
                  </Text>
                </View>
                <View style={styles.flex1}>
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    style={styles.cardTitle}
                  >{t("apps.auth.approval-pending.card_title")}
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">{t("apps.auth.approval-pending.card_desc")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomContainer}>
        <Button
          variant="primary"
          size="md"
          onPress={handleGoToLogin}
          styles={styles.button}
        >{t("apps.auth.approval-pending.button")}
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    marginBottom: 32,
  },
  imageContainer: {
    marginBottom: 32,
    position: "relative",
    width: 284,
    height: 284,
  },
  outerCircle: {
    backgroundColor: colors.primaryPurple,
    borderRadius: 142,
    width: 284,
    height: 284,
    position: "absolute",
    top: 0,
    left: 0,
  },
  middleCircle: {
    backgroundColor: colors.primaryPurple,
    borderRadius: 127,
    width: 254,
    height: 254,
    position: "absolute",
    top: 15,
    left: 15,
  },
  innerCircle: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 121,
    width: 242,
    height: 242,
    position: "absolute",
    top: 21,
    left: 21,
  },
  profileImage: {
    width: 242,
    height: 242,
    position: "absolute",
    top: 21,
    left: 21,
    borderRadius: 121,
  },
  titleContainer: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
  },
  centerText: {
    textAlign: "center",
  },
  subtitleText: {
    textAlign: "center",
    marginTop: 4,
  },
  descContainer: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
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
    backgroundColor: "#A855F7",
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
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
  },
});
