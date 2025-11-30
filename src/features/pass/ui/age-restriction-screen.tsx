import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/colors';
import { Button } from "@/src/shared/ui/button";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Text } from "@/src/shared/ui/text";
import { Image } from "expo-image";
import { router } from "expo-router";
import type React from "react";
import { SafeAreaView, ScrollView, View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DefaultLayout } from "../../layout/ui";

interface AgeRestrictionScreenProps {
  onGoBack?: () => void;
}

/**
 * 가입 불가능한 연령 사용자에게 표시되는 나이 제한 안내 화면 (만 18세 미만 또는 28세 이상)
 */
export const AgeRestrictionScreen: React.FC<AgeRestrictionScreenProps> = ({
  onGoBack,
}) => {
  const insets = useSafeAreaInsets();
  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      router.replace("/auth/login");
    }
  };

  const ageMessage = {
    title: "가입 가능 연령이 아니에요",
    subtitle:
      "안전하고 건전한 만남을 위해 만 18세 이상 27세 이하만 가입 가능해요.",
    bottomText: "가입 가능 연령이 되면 다시 찾아주세요!",
  };

  return (
    <DefaultLayout style={[styles.container, { backgroundColor: semanticColors.surface.background }]}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 로고 */}
        <View style={styles.logoContainer}>
          <SmallTitleIcon width={160} height={40} />
        </View>

        <View style={styles.content}>
          {/* 상단 이미지 */}
          <View style={styles.imageContainer}>
            <View style={[styles.absoluteContainer, { top: -30, left: 0 }]}>
              <View style={[styles.largeCircle, { backgroundColor: semanticColors.brand.primary }]} />
              <View style={[styles.mediumCircle, { backgroundColor: semanticColors.surface.background }]} />
              <View style={[styles.dashLine, { backgroundColor: semanticColors.brand.primary }]} />
            </View>

            <Image
              source={require("@assets/images/limit-age.png")}
              style={styles.mainImage}
            />
          </View>

          {/* 메인 텍스트 */}
          <View style={styles.mainTextContainer}>
            <Text
              weight="semibold"
              size="20"
              textColor="black"
              style={styles.titleText}
            >
              {ageMessage.title}
            </Text>
            <Text
              size="md"
              textColor="pale-purple"
              style={styles.subtitleText}
            >
              {ageMessage.subtitle}
            </Text>
          </View>

          {/* 안내 정보 */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.infoIcon}>
                <Text size="sm" textColor="purple" weight="semibold">
                  ℹ
                </Text>
              </View>
              <Text weight="semibold" size="md" textColor="black">
                확인된 이용 조건
              </Text>
            </View>

            <View style={styles.conditionList}>
              <View style={styles.conditionItem}>
                <Text size="sm" textColor="pale-purple" style={styles.bullet}>
                  •
                </Text>
                <Text size="sm" textColor="black" style={styles.conditionText}>
                  만 18세 이상 27세 이하
                </Text>
              </View>
              <View style={styles.conditionItem}>
                <Text size="sm" textColor="pale-purple" style={styles.bullet}>
                  •
                </Text>
                <Text size="sm" textColor="black" style={styles.conditionText}>
                  대학교 재학 중 또는 졸업
                </Text>
              </View>
              <View style={styles.conditionItem}>
                <Text size="sm" textColor="pale-purple" style={styles.bullet}>
                  •
                </Text>
                <Text size="sm" textColor="black" style={styles.conditionText}>
                  대학 이메일 인증 필수
                </Text>
              </View>
            </View>
          </View>

          {/* 하단 텍스트 */}
          <View style={styles.bottomTextContainer}>
            <Text
              weight="semibold"
              size="18"
              textColor="black"
              style={styles.bottomTitle}
            >
              {ageMessage.bottomText}
            </Text>
            <Text
              size="sm"
              textColor="pale-purple"
              style={styles.bottomSubtitle}
            >
              생년월일 기준으로 가입 가능 여부를 확인해요
            </Text>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="md"
              onPress={handleGoBack}
              style={styles.fullWidthButton}
            >
              이상형 찾으러 가기 →
            </Button>
          </View>
        </View>
      </ScrollView>
    </DefaultLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    width: "100%",
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 38,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: "100%",
    width: "100%",
    alignItems: "center",
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  absoluteContainer: {
    position: "absolute",
  },
  largeCircle: {
    width: 253,
    height: 253,
    borderRadius: 253,
    top: 0,
    left: 0,
    position: "absolute",
  },
  mediumCircle: {
    width: 193,
    height: 193,
    borderRadius: 223,
    top: 30,
    left: 30,
    position: "absolute",
  },
  dashLine: {
    width: 30,
    height: 196,
    top: 30,
    left: 111.5,
    transform: [
      {
        rotate: "-45deg",
      },
    ],
    position: "absolute",
  },
  mainImage: {
    width: 259,
    height: 259,
    marginBottom: 24,
  },
  mainTextContainer: {
    marginBottom: 32,
  },
  titleText: {
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleText: {
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: "rgb(249 250 251)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginHorizontal: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    width: 24,
    height: 24,
    backgroundColor: "rgb(243 232 255)",
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  conditionList: {
    gap: 12,
  },
  conditionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    marginRight: 8,
    marginTop: 2,
  },
  conditionText: {
    flex: 1,
  },
  bottomTextContainer: {
    marginBottom: 32,
  },
  bottomTitle: {
    textAlign: "center",
    marginBottom: 8,
  },
  bottomSubtitle: {
    textAlign: "center",
    paddingHorizontal: 16,
  },
  buttonContainer: {
    marginTop: "auto",
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  fullWidthButton: {
    width: "100%",
  },
});
