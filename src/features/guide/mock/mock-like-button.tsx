import { ImageResources, cn } from "@/src/shared/libs";
import { semanticColors } from '../../../shared/constants/colors';
import { Button, ImageResource , Text } from "@/src/shared/ui";
import { Text as RNText, StyleSheet, View } from "react-native";
import type { MatchDetails } from "../../idle-match-timer/types";

import { useFeatureCost } from "@features/payment/hooks";
import { useModal } from "@hooks/use-modal";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth";


type MockLikeButtonProps = {
  className?: string;
};

export const MockLikeButton = ({ className = "" }: MockLikeButtonProps) => {
  const { profileDetails } = useAuth();
  const { showModal, hideModal } = useModal();
  const { featureCosts } = useFeatureCost();
  const { t } = useTranslation();

  const handleClick = () => {
    showModal({
      showLogo: true,
      showParticle: true,
      customTitle: (
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            style={styles.particle1}
            source={require("@assets/images/particle1.png")}
          />
          <Image
            style={styles.particle2}
            source={require("@assets/images/particle2.png")}
          />
          <Image
            style={styles.particle3}
            source={require("@assets/images/particle3.png")}
          />
          <Text textColor="black" weight="bold" size="20">
            {t("features.guide.mock.mock_like_button.modal_title")}
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[5px]">
          <Text className="text-text-disabled text-[12px]">
            {t("features.guide.mock.mock_like_button.modal_text_1")}
          </Text>
          <Text className="text-text-disabled text-[12px]">
            {t("features.guide.mock.mock_like_button.modal_text_2")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("features.guide.mock.mock_like_button.primary_button"),
        onClick: () => {},
      },
    });
  };

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
            {t("features.guide.mock.mock_like_button.partner_modal_title_1")}
          </Text>
          <Text textColor="black" weight="bold" size="20">
            {profileDetails?.gender === "MALE"
              ? t("features.guide.mock.mock_like_button.partner_modal_title_2_male", {
                  count: featureCosts?.LIKE_MESSAGE,
                })
              : t(
                  "features.guide.mock.mock_like_button.partner_modal_title_2_female"
                )}
          </Text>
        </View>
      ),
      children: (
        <View className="flex flex-col w-full items-center mt-[5px]">
          <Text className="text-text-disabled text-[12px]">
            {t("features.guide.mock.mock_like_button.partner_modal_text_1")}
          </Text>
          <Text className="text-text-disabled text-[12px]">
            {t("features.guide.mock.mock_like_button.partner_modal_text_2")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("features.guide.mock.mock_like_button.partner_primary_button"),
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        onClick: handleClick,
      },
      secondaryButton: {
        text: t("features.guide.mock.mock_interaction_navigation.secondary_button"),
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
        <RNText className="text-md text-text-inverse whitespace-nowrap">
          {t("features.guide.mock.mock_like_button.main_button")}
        </RNText>
      </View>
    </Button>
  );
};

const styles = StyleSheet.create({
  subText: {
    fontSize: 15,
    fontFamily: "thin",
    fontWeight: 300,
    lineHeight: 18,
    marginLeft: -5,
    marginRight: 6,
    color: semanticColors.brand.accent,
  },
  particle1: {
    position: "absolute",
    left: -6,
    bottom: -36,
    width: 66,
    height: 34,
  },
  particle2: {
    position: "absolute",
    left: 10,
    top: -48,
    width: 52,
    height: 49,
  },
  particle3: {
    position: "absolute",
    right: -20,
    top: -40,
    width: 105,
    height: 80,
  },
});

export default MockLikeButton;