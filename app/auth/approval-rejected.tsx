import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { DefaultLayout } from "@/src/features/layout/ui";
import { semanticColors } from "@/src/shared/constants/colors";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ApprovalRejectedScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const rejectionReason =
    (params.rejectionReason as string) || "승인이 거절되었습니다.";
  const phoneNumber = params.phoneNumber as string;

  const handleReapply = () => {
    router.push({
      pathname: "/auth/reapply",
      params: { phoneNumber, rejectionReason },
    });
  };

  const handleContactSupport = () => {
    import("react-native").then(({ Linking }) => {
      Linking.openURL(
        "https://www.instagram.com/sometime.in.univ?igsh=MTdxMWJjYmFrdGc3Ng=="
      );
    });
  };

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { paddingTop: insets.top }]}
      >
        <View style={styles.content}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>
          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <View style={styles.imageBackground} />
            <Image
              source={require("@assets/images/limit-signup.png")}
              style={styles.mainImage}
            />
          </View>

          {/* 제목 */}
          <View style={styles.titleContainer}>
            <Text
              size="lg"
              textColor="black"
              weight="normal"
              style={styles.titleText}
            >
              승인이 거절되었어요
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
              아래 사유를 확인하고 정보를 수정한 후{"\n"}
              다시 신청해주세요
            </Text>
          </View>

          {/* 거절 사유 카드 */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text size="12" textColor="white" weight="bold">
                    !
                  </Text>
                </View>
                <View style={styles.cardContent}>
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    style={styles.cardTitle}
                  >
                    거절 사유
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
            정보를 수정하신 후 언제든지 다시 신청하실 수 있어요
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼들 */}
      <View style={styles.buttonContainer}>
        <Button
          variant="primary"
          size="md"
          onPress={handleReapply}
          style={styles.button}
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
              다시 입력하기
            </Text>
          </View>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onPress={handleContactSupport}
          style={styles.secondaryButton}
        >
          <View style={styles.buttonContent}>
            <Text size="md" textColor="gray" weight="medium" style={styles.buttonIcon}>
              🎧
            </Text>
            <Text size="md" textColor="gray" weight="medium">
              고객센터 문의
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
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  logoContainer: {
    marginTop: 10,
    marginBottom: 28,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  imageBackground: {
    width: 165,
    height: 165,
    borderRadius: 81,
    top: -8,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    position: 'absolute',
  },
  mainImage: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  titleContainer: {
    width: '100%',
    marginBottom: 16,
  },
  titleText: {
    textAlign: 'left',
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: 32,
  },
  descriptionText: {
    textAlign: 'left',
    lineHeight: 24,
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
    backgroundColor: '#ef4444',
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
  guideText: {
    textAlign: 'center',
    marginTop: 32,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: semanticColors.surface.background,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
