import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { BackHandler, ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileImgEditWaitingScreen() {
  const { my } = useAuth();
  const { data: statusData } = useUserStatus(my.phoneNumber);
  const handleGoToLogin = async () => {
    router.push("/home");
  };
  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/home");
      return true;
    };

    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <View style={[styles.blurBackground, styles.blurLarge]} />
            <View style={[styles.blurBackground, styles.blurSmall]} />
            <View style={styles.imageCircle} />
            <Image
              source={
                statusData?.profileImage ??
                require("@/assets/images/signup-pending.png")
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
            >
              새 프로필 사진 승인 대기 중!
            </Text>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              style={[styles.centerText, styles.titleSpacing]}
            >
              관리자가 검토 중입니다.
            </Text>
          </View>

          {/* 설명 */}
          <View style={styles.descriptionContainer}>
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              style={styles.centerText}
            >
              승인 여부는 푸시로 알려드릴게요
            </Text>
          </View>

          {/* 승인 대기 카드 */}
          <View style={styles.cardContainer}>
            <View style={styles.statusCard}>
              <View style={styles.cardRow}>
                <View style={styles.iconContainer}>
                  <Text size="12" textColor="white" weight="bold">
                    ⏱
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    style={styles.statusTitle}
                  >
                    승인 대기
                  </Text>
                  <Text size="sm" textColor="gray" weight="light">
                    관리자 승인까지 2~12시간 소요됩니다
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
          style={styles.homeButton}
        >
          썸타임 홈으로 돌아가기 →
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
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
  blurBackground: {
    backgroundColor: "rgb(147 51 234)",
    borderRadius: 9999,
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  blurLarge: {
    width: 284,
    height: 284,
    blurRadius: 2,
  },
  blurSmall: {
    width: 254,
    height: 254,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -127 }, { translateY: -127 }],
  },
  imageCircle: {
    backgroundColor: "rgb(249 250 251)",
    borderRadius: 9999,
    width: 242,
    height: 242,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -121 }, { translateY: -121 }],
  },
  profileImage: {
    width: 242,
    height: 242,
    position: "absolute",
    top: 21,
    left: 21,
    borderRadius: 9999,
  },
  titleContainer: {
    width: "100%",
    marginBottom: 16,
    alignItems: "center",
  },
  centerText: {
    textAlign: "center",
  },
  titleSpacing: {
    marginTop: 4,
  },
  descriptionContainer: {
    width: "100%",
    marginBottom: 32,
    alignItems: "center",
  },
  cardContainer: {
    width: "100%",
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: "rgb(250 245 255)",
    borderWidth: 1,
    borderColor: "rgb(233 213 255)",
    borderRadius: 12,
    padding: 16,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    backgroundColor: "rgb(168 85 247)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  statusTitle: {
    marginBottom: 4,
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  homeButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
  },
});
