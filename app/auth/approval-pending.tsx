import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import useUserStatus from "@/src/features/auth/queries/use-user-status";
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, View, StyleSheet, BackHandler } from "react-native";
import { semanticColors } from "@/src/shared/constants/colors";

export default function ApprovalPendingScreen() {
  const { my, logoutOnly } = useAuth();
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
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.content}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <View style={[styles.blurBackground, styles.largeBlur]} />
            <View style={[styles.blurBackground, styles.mediumBlur]} />
            <View style={styles.circleBackground} />
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
              style={styles.titleText}
            >
              회원가입 완료!
            </Text>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              style={styles.subtitleText}
            >
              관리자{" "}
              <Text size="lg" textColor="purple" weight="semibold">
                승인
              </Text>
              을 기다리고 있어요
            </Text>
          </View>

          {/* 설명 */}
          <View style={styles.descriptionContainer}>
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              style={styles.descriptionText}
            >
              승인되면 푸시로 알려드릴게요
            </Text>
          </View>

          {/* 승인 대기 카드 */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
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
                    style={styles.cardTitle}
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
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="md"
          onPress={handleGoToLogin}
          style={styles.button}
        >
          로그인 화면으로 돌아가기
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  logoContainer: {
    marginBottom: 32,
  },
  imageContainer: {
    marginBottom: 32,
    position: 'relative',
    width: 284,
    height: 284,
  },
  blurBackground: {
    backgroundColor: semanticColors.brand.primary,
    borderRadius: 9999,
    position: 'absolute',
  },
  largeBlur: {
    width: 284,
    height: 284,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  mediumBlur: {
    width: 254,
    height: 254,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -127 }, { translateY: -127 }],
    opacity: 0.3,
  },
  circleBackground: {
    backgroundColor: semanticColors.surface.background,
    borderRadius: 9999,
    width: 242,
    height: 242,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -121 }, { translateY: -121 }],
  },
  profileImage: {
    width: 242,
    height: 242,
    position: 'absolute',
    top: 21,
    left: 21,
    borderRadius: 121,
  },
  titleContainer: {
    width: '100%',
    marginBottom: 16,
    alignItems: 'center',
  },
  titleText: {
    textAlign: 'center',
  },
  subtitleText: {
    textAlign: 'center',
    marginTop: 4,
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: 32,
    alignItems: 'center',
  },
  descriptionText: {
    textAlign: 'center',
  },
  cardContainer: {
    width: '100%',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a855f7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
  },
});
