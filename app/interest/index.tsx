import { useAuth } from "@/src/features/auth";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import Layout from "@/src/features/layout";
import { useModal } from "@/src/shared/hooks/use-modal";
import { PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import SmallTitle from "@assets/icons/small-title.svg";
import { router } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from 'react-i18next';


export default function InterestIntroScreen() {
  const { showModal } = useModal();
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const insets = useSafeAreaInsets();
  const showPreviousModal = () =>
    showModal({
      customTitle: (
        <Text
          textColor="purple"
          weight="semibold"
          style={{ paddingBottom: 8, fontSize: 18 }}
        >
          {t("apps.interest.index.next_time")}
        </Text>
      ),
      children: (
        <View>
          <Text size="md" textColor="black" weight="light">
            {t("apps.interest.index.children_1")}
          </Text>
          <Text size="md" textColor="black" weight="light">
            {t("apps.interest.index.children_2",{name:profileDetails?.name})}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("apps.interest.index.button_submit"),
        onClick: () => router.push("/interest/age"),
      },
      secondaryButton: {
        text: t("apps.interest.index.button_nexttime"),
        onClick: () => router.navigate("/"),
      },
    });

  const onNext = () => {
    mixpanelAdapter.track("Interest_Intro", { env: process.env.EXPO_PUBLIC_TRACKING_MODE });
    router.push("/interest/age");
  };

  return (
    <Layout.Default>
      <View style={styles.contentContainer}>
        <PalePurpleGradient />
        <View style={[styles.titleLogoWrapper, { paddingTop: insets.top }]}>
          <IconWrapper width={128} style={styles.titleLogoIcon}>
            <SmallTitle />
          </IconWrapper>
        </View>
        <View style={styles.textWrapper}>
          <View
            style={{
              width: 280,
              height: 280,
              borderRadius: 280,
              overflow: "hidden",
              marginBottom: 50,
              backgroundColor: semanticColors.brand.primary,
              position: "relative",
            }}
          >
            <Image
              source={require("@assets/images/info-miho.webp")}
              style={{ width: 255, height: 259, top: 20, position: "absolute" }}
            />
          </View>
          <View>
            <View style={styles.titleWrapper}>
              <Text size="lg" textColor="black" weight="semibold">
                {t("apps.interest.index.title_1")}
              </Text>
              <Text size="lg" textColor="black" weight="semibold">
                {t("apps.interest.index.title_2")}
              </Text>
            </View>

            <View style={styles.descriptionWrapper}>
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.interest.index.title_3")}
              </Text>
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.interest.index.title_4")}
              </Text>
            </View>
          </View>
        </View>

        <Layout.TwoButtons
          onClickNext={onNext}
          disabledNext={false}
          onClickPrevious={showPreviousModal}
          content={{
            prev: t("apps.interest.index.button_prev"),
            next: t("apps.interest.index.button_next"),
          }}
        />
      </View>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleLogoWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  titleLogoIcon: {
    paddingBottom: 52.85,
    paddingTop: 21,
  },
  titleWrapper: {
    marginTop: 20,
  },
  textWrapper: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  descriptionWrapper: {
    marginTop: 40,
  },
});
