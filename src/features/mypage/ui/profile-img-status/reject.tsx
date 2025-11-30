import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View , Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useConfirmProfileImageReview } from "@/src/features/mypage/hooks/use-confirm-profile-image-review";

export default function ProfileImgEditRejectScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const rejectionReason =
    (params.rejectionReason as string) || "승인이 거절되었습니다.";

  const { mutateAsync, isPending } = useConfirmProfileImageReview();

  const handleReapply = async () => {
    try {
      await mutateAsync();
      router.push({ pathname: "/profile-edit/profile" });
    } catch (e) {}
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
        <View style={styles.contentContainer}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>
          {/* 메인 이미지 */}
          <View style={styles.imageContainer}>
            <View style={{ position: "absolute", left: 0 }}>
              <View
                style={{
                  width: 253,
                  height: 253,
                  borderRadius: 253,
                  top: 0,
                  left: 0,

                  backgroundColor: semanticColors.brand.primary,
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: 193,
                  height: 193,
                  borderRadius: 223,

                  backgroundColor: semanticColors.surface.background,
                  top: 30,
                  left: 30,
                  position: "absolute",
                }}
              />
              <View
                style={{
                  width: 30,
                  height: 196,
                  top: 30,
                  left: 111.5,
                  transform: [
                    {
                      rotate: "-45deg",
                    },
                  ],
                  backgroundColor: semanticColors.brand.primary,
                  position: "absolute",
                }}
              />
            </View>

            <Image
              source={require("@assets/images/limit-age.png")}
              style={[styles.mainImage, { width: 259, height: 259, top: 30, left: 30 }]}
            />
          </View>

          {/* 제목 */}
          <View style={styles.titleContainer}>
            <Text
              size="lg"
              textColor="black"
              weight="semibold"
              style={styles.title}
            >
              승인이 거절되었어요
            </Text>
          </View>

          {/* 설명 */}
          <View style={styles.descriptionContainer}>
            <Text
              size="md"
              textColor="pale-purple"
              weight="light"
              style={styles.description}
            >
              아래 사유를 확인하고 정보를 수정한 후{"\n"}
              다시 신청해주세요
            </Text>
          </View>

          {/* 거절 사유 카드 */}
          <View style={styles.rejectionCardContainer}>
            <View style={styles.rejectionCard}>
              <View style={styles.rejectionHeader}>
                <View style={styles.rejectionIcon}>
                  <Text size="12" textColor="white" weight="bold">
                    !
                  </Text>
                </View>
                <View style={styles.rejectionContent}>
                  <Text
                    size="md"
                    textColor="dark"
                    weight="semibold"
                    style={styles.rejectionTitle}
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
            style={styles.noticeText}
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
          style={styles.primaryButton}
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
  contentContainer: {
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
    position: 'relative',
  },
  mainImage: {
    marginBottom: 24,
  },
  titleContainer: {
    width: '100%',
    marginBottom: 16,
  },
  title: {
    textAlign: 'left',
  },
  descriptionContainer: {
    width: '100%',
    marginBottom: 32,
  },
  description: {
    textAlign: 'left',
    lineHeight: 24,
  },
  rejectionCardContainer: {
    width: '100%',
    marginBottom: 32,
  },
  rejectionCard: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    borderRadius: 12,
    padding: 16,
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rejectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rejectionContent: {
    flex: 1,
  },
  rejectionTitle: {
    marginBottom: 4,
  },
  noticeText: {
    textAlign: 'center',
    marginTop: 32,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  primaryButton: {
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
    borderColor: '#D1D5DB',
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
