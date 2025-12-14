import SmallTitle from "@/assets/icons/small-title.svg";
import { semanticColors } from '@/src/shared/constants/semantic-colors';
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
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />
      <IconWrapper
        width={128}
        className="text-primaryPurple md:pb-[58px] py-12"
      >
        <SmallTitle />
      </IconWrapper>

      <View className="flex flex-col flex-1">
        <View style={{ position: "relative" }}>
          <View
            style={{
              width: 274,
              height: 274,
              borderRadius: 274,
              top: 12,
              left: 0,

              backgroundColor: semanticColors.brand.primary,
              position: "absolute",
            }}
          />
          <Image
            source={require("@assets/images/signup-done.png")}
            style={{ width: 298, height: 296, marginTop: 50 }}
          />
        </View>

        <View className="flex flex-col">
          <View className="mt-[42px]">
            <Text size="lg" textColor="black" weight="semibold">
              {t('features.mypage.profile_status.approve.congratulations')}
            </Text>
            <Text size="lg" textColor="black" weight="semibold">
              {t('features.mypage.profile_status.approve.photo_change_complete')}
            </Text>
          </View>

          <View className="mt-2">
            <Text size="sm" textColor="pale-purple" weight="light">
              {t('features.mypage.profile_status.approve.photo_change_complete')}
            </Text>
            <Text size="sm" textColor="pale-purple" weight="light">
              {t('features.mypage.profile_status.approve.meet_your_type')}
            </Text>
          </View>
        </View>
      </View>

      <View className="w-full px-5 mb-[24px] md:mb-[58px]">
        <Button
          disabled={loading}
          variant="primary"
          size="md"
          onPress={onNext}
          className="w-full items-center "
        >
          {loading ? (
            <>
              <Text textColor={"white"} className="text-md white">
                {t('features.mypage.profile_status.approve.please_wait')}
              </Text>
              <ActivityIndicator
                size="small"
                color="#0000ff"
                className="ml-6"
              />
            </>
          ) : (
            <Text textColor={"white"} className="text-md white">
              {t('features.mypage.profile_status.approve.go_find_type')}
            </Text>
          )}
        </Button>
      </View>
    </DefaultLayout>
  );
}
