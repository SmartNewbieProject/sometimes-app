import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
import colors from '@/src/shared/constants/colors';
import { DefaultLayout } from "@/src/features/layout/ui";
import { Button, PalePurpleGradient, Text } from "@/src/shared/ui";
import { IconWrapper } from "@/src/shared/ui/icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useConfirmProfileImageReview } from "../../hooks/use-confirm-profile-image-review";
import { useTranslation } from "react-i18next";

export default function ProfileImgEditDoneScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const { mutateAsync, isPending } = useConfirmProfileImageReview();

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, [loading]);

  const onNext = async () => {
    try {
      await mutateAsync();
      router.push("/home");
    } catch (e) {}
  };

  return (
    <DefaultLayout style={approveStyles.container}>
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        style={approveStyles.iconWrapper}
      >
        <SmallTitle />
      </IconWrapper>

      <View style={approveStyles.contentContainer}>
        <View style={{ position: "relative" }}>
          <View style={approveStyles.circleBg} />
          <Image
            source={require("@assets/images/signup-done.webp")}
            style={{ width: 298, height: 296, marginTop: 50 }}
          />
        </View>

        <View style={approveStyles.textContainer}>
          <View style={approveStyles.titleContainer}>
            <Text size="lg" textColor="black" weight="semibold">
              {t('features.mypage.profile_status.approve.congratulations')}
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              {t('features.mypage.profile_status.approve.photo_change_complete')}
            </Text>
          </View>

          <View style={approveStyles.descContainer}>
            <Text size="sm" textColor="pale-purple" weight="light">
              {t('features.mypage.profile_status.approve.photo_change_complete')}
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              {t('features.mypage.profile_status.approve.meet_your_type')}
            </Text>
          </View>
        </View>
      </View>

      <View style={approveStyles.buttonContainer}>
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          styles={approveStyles.button}
        >
          {loading ? (
            <>
              <Text textColor={"white"}>
                {t('features.mypage.profile_status.approve.please_wait')}
              </Text>
              <ActivityIndicator
                size="small"
                color="#0000ff"
                style={approveStyles.activityIndicator}
              />
            </>
          ) : (
            <Text textColor={"white"}>
              {t('features.mypage.profile_status.approve.go_find_type')}
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}

const approveStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  iconWrapper: {
    paddingVertical: 48,
  },
  contentContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  circleBg: {
    width: 274,
    height: 274,
    borderRadius: 274,
    top: 12,
    left: 0,
    backgroundColor: semanticColors.brand.primary,
    position: "absolute",
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
  },
  titleContainer: {
    marginTop: 42,
  },
  descContainer: {
    marginTop: 8,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  button: {
    width: "100%",
    alignItems: "center",
  },
  activityIndicator: {
    marginLeft: 24,
  },
});
