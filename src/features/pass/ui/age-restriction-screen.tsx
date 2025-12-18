import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
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
import i18n from '@/src/shared/libs/i18n';
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
    title: i18n.t('features.pass.ageRestriction.title'),
    subtitle: i18n.t('features.pass.ageRestriction.subtitle'),
    bottomText: i18n.t('features.pass.ageRestriction.bottomText'),
  };

  return (
    <DefaultLayout style={styles.layout}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 로고 */}
        <View style={styles.logoContainer}>
          <SmallTitleIcon width={160} height={40} />
        </View>

        <View style={styles.mainContent}>
          {/* 상단 이미지 */}
          <View style={styles.imageSection}>
            <View style={styles.circleContainer}>
              <View style={styles.outerCircle} />
              <View style={styles.innerCircle} />
              <View style={styles.diagonalLine} />
            </View>

            <Image
              source={require("@assets/images/limit-age.png")}
              style={styles.mainImage}
            />
          </View>

          {/* 메인 텍스트 */}
          <View style={styles.textSection}>
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
                {i18n.t('features.pass.ageRestriction.usageConditions.title')}
              </Text>
            </View>

            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Text size="sm" textColor="pale-purple" style={styles.bullet}>
                  •
                </Text>
                <Text size="sm" textColor="black" style={styles.infoText}>
                  {i18n.t('features.pass.ageRestriction.usageConditions.ageRange')}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text size="sm" textColor="pale-purple" style={styles.bullet}>
                  •
                </Text>
                <Text size="sm" textColor="black" style={styles.infoText}>
                  {i18n.t('features.pass.ageRestriction.usageConditions.education')}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text size="sm" textColor="pale-purple" style={styles.bullet}>
                  •
                </Text>
                <Text size="sm" textColor="black" style={styles.infoText}>
                  {i18n.t('features.pass.ageRestriction.usageConditions.verification')}
                </Text>
              </View>
            </View>
          </View>

          {/* 하단 텍스트 */}
          <View style={styles.bottomTextSection}>
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
              {i18n.t('features.pass.ageRestriction.birthDateCheck')}
            </Text>
          </View>

          {/* 버튼 */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              size="md"
              onPress={handleGoBack}
              width="full"
            >
              {i18n.t('features.pass.ageRestriction.findIdealTypeButton')}
            </Button>
          </View>
        </View>
      </ScrollView>
    </DefaultLayout>
  );
};

const styles = StyleSheet.create({
  layout: {
    flex: 1,
    backgroundColor: semanticColors.surface.background,
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    minHeight: "100%",
    width: "100%",
    alignItems: "center",
  },
  imageSection: {
    alignItems: "center",
    position: "relative",
  },
  circleContainer: {
    position: "absolute",
    top: -30,
    left: 0,
  },
  outerCircle: {
    width: 253,
    height: 253,
    borderRadius: 253,
    top: 0,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    position: "absolute",
  },
  innerCircle: {
    width: 193,
    height: 193,
    borderRadius: 223,
    backgroundColor: semanticColors.surface.background,
    top: 30,
    left: 30,
    position: "absolute",
  },
  diagonalLine: {
    width: 30,
    height: 196,
    top: 30,
    left: 111.5,
    transform: [{ rotate: "-45deg" }],
    backgroundColor: semanticColors.brand.primary,
    position: "absolute",
  },
  mainImage: {
    width: 259,
    height: 259,
    marginBottom: 24,
  },
  textSection: {
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
    backgroundColor: semanticColors.surface.background,
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: "100%",
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
    backgroundColor: "#E8E0F7",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
  },
  bottomTextSection: {
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
});
