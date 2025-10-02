import { ImageResources, cn } from "@/src/shared/libs";
import { Button, ImageResource } from "@/src/shared/ui";
import { Text } from "@shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth";
import useLike from "../hooks/use-like";

type LikeButtonProps = {
  connectionId: string;
  className?: string;
};

export const LikeButton = ({
  connectionId,
  className = "",
}: LikeButtonProps) => {
  const { profileDetails } = useAuth();
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { onLike } = useLike();
  const { t } = useTranslation();
  const showPartnerLikeAnnouncement = () => {
    showModal({
      showLogo: true,
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text textColor="black" weight="bold" size="20">
            {t("features.like.ui.like_button.modal.title_line1")}
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {profileDetails?.gender === "MALE"
              ? t("features.like.ui.like_button.modal.title_line2_male", {
                  cost: featureCosts?.LIKE_MESSAGE,
                })
              : t("features.like.ui.like_button.modal.title_line2_default")}
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[5px]">
          <Text className="text-[#AEAEAE] text-[12px]">
            {t("features.like.ui.like_button.modal.body_line1")}
          </Text>
          <Text className="text-[#AEAEAE] text-[12px]">
            {t("features.like.ui.like_button.modal.body_line2")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("features.like.ui.like_button.modal.primary_button"),
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        onClick: () => onLike(connectionId!),
      },
      secondaryButton: {
        text: t("globals.no"),
        onClick: hideModal,
      },
    });
  };

  return (
    <Button
      onPress={showPartnerLikeAnnouncement}
      variant="primary"
      className={cn("flex-1 items-center", className)}
      prefix={
        profileDetails?.gender === "MALE" ? (
          <ImageResource resource={ImageResources.GEM} width={23} height={23} />
        ) : (
          <></>
        )
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {profileDetails?.gender === "MALE" ? (
          <RNText style={styles.subText}>x{featureCosts?.LIKE_MESSAGE}</RNText>
        ) : (
          <></>
        )}
        <RNText className="text-md text-white whitespace-nowrap">
          {t("features.like.ui.like_button.button_label")}
        </RNText>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: 15,
    fontFamily: "Pretendard-Thin",
    fontWeight: 300,
    lineHeight: 18,
    marginLeft: -5,
    marginRight: 6,
    color: "#BEACFF",
  },
});