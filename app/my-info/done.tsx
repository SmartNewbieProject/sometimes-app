import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import { useInterestForm } from "@/src/features/interest/hooks";
import Layout from "@/src/features/layout";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { mixpanelAdapter } from "@/src/shared/libs/mixpanel";
import { useAuth } from "@features/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyInfoDoneScreen() {
  const { t } = useTranslation();
  const { profileDetails } = useAuth();
  const queryClient = useQueryClient();
  const { updateForm, clear, tattoo, ...form } = useInterestForm();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["preference-self"],
    });
  }, [queryClient]);

  return (
    <Layout.Default>
      <View style={[styles.contentContainer]}>
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
              source={require("@assets/images/info-miho.png")}
              style={{ width: 255, height: 259, top: 20, position: "absolute" }}
            />
          </View>
          <View>
            <View style={styles.titleWrapper}>
              <Text size="lg" textColor="black" weight="semibold">
                {t("apps.my-info.done.title_1")}
              </Text>
              <Text size="lg" textColor="black" weight="semibold">
                {t("apps.my-info.done.title_2")}
              </Text>
            </View>
            <View style={styles.descriptionWrapper}>
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.my-info.done.desc", { name: profileDetails?.name })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="md"
            width="full"
            onPress={() => {
              mixpanelAdapter.track("Profile_Done", {
                env: process.env.EXPO_PUBLIC_TRACKING_MODE,
              });
              clear();
              router.push("/home");
            }}
            styles={styles.button}
          >
            {t("apps.my-info.done.button")}
          </Button>
        </View>
      </View>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
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
    marginTop: 16,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 32,
    ...Platform.select({
      web: {
        marginBottom: 14, // md:mb-[72px] 은 무시
      },
      ios: {
        marginBottom: 58,
      },
      android: {
        marginBottom: 58,
      },
    }),
    flexDirection: "row",
  },
  button: {
    width: "100%",

    justifyContent: "center",
  },
});
