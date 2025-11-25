import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '../../src/shared/constants/colors';
import { useInterestForm } from "@/src/features/interest/hooks";
import Layout from "@/src/features/layout";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { track } from "@amplitude/analytics-react-native";
import { useAuth } from "@features/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function InterestDoneScreen() {
  const { profileDetails } = useAuth();
  const queryClient = useQueryClient();
  const { updateForm, clear, tattoo, ...form } = useInterestForm();
  const insets = useSafeAreaInsets();
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["check-preference-fill"],
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
                이상형 정보를 확인했어요
              </Text>
              <Text size="lg" textColor="black" weight="semibold">
                이제 이상형을 찾아드릴게요
              </Text>
            </View>

            <View style={styles.descriptionWrapper}>
              <Text size="sm" textColor="pale-purple" weight="light">
                썸타임이 {profileDetails?.name}님의 이상형을 찾아드릴게요
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            width="full"
            flex="flex-1"
            variant="primary"
            onPress={() => {
              track("Interest_Done", {
                env: process.env.EXPO_PUBLIC_TRACKING_MODE,
              });
              clear();
              router.push("/home");
            }}
            styles={styles.button}
          >
            이상형 찾으러 가기 →
          </Button>
        </View>
      </View>
    </Layout.Default>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
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
    paddingHorizontal: 31,
    gap: 14,
    ...Platform.select({
      web: {
        marginBottom: 14,
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
