import { ImageResources } from "@/src/shared/libs";
import { Button, ImageResource, Text } from "@/src/shared/ui";
import FrameIcon from "@assets/icons/frame.svg";
import ImproveProfileIcon from "@assets/icons/improve-profile.svg";
import ReloadingIcon from "@assets/icons/reloading.svg";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import useRematch from "../hooks/use-rematch";
import NotFoundCard from "./not-found-card";
import { useTranslation } from "react-i18next";

export const NotFound = () => {
  const router = useRouter();
  const { onRematch } = useRematch();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <ImageResource
        style={styles.image}
        resource={ImageResources.BROKEN_SANDTIMER}
        width={246}
        height={246}
      />
      <Text textColor="black" size="20" weight={"bold"}>
        {t("features.idle-match-timer.ui.not-found.faild_title")}
      </Text>

      <View style={styles.contentContainer}>
        <NotFoundCard
          title={t("features.idle-match-timer.ui.not-found.faild_try")}
          description={t("features.idle-match-timer.ui.not-found.look_around")}
          button={
            <Button
              size="chip"
              onPress={onRematch}
              className="!px-[7px] !h-[34px] "
            >
              {t("features.idle-match-timer.ui.not-found.rematch")}
            </Button>
          }
          icon={<ReloadingIcon />}
        />
        <NotFoundCard
          iconPadding={13}
          title={t("features.idle-match-timer.ui.not-found.expand_condition")}
          description={t("features.idle-match-timer.ui.not-found.expand_ideal_type")}
          button={
            <Button
              variant={"white"}
              size="chip"
              onPress={() => router.push("/profile-edit/interest")}
              textColor="dark"
              className="!px-[12px] !h-[33px]  !border-[#D1D5DB]"
            >
              {t("features.idle-match-timer.ui.not-found.edit")}
            </Button>
          }
          icon={<FrameIcon width={24} height={24} />}
        />
        <NotFoundCard
          iconPadding={8}
          title={t("features.idle-match-timer.ui.not-found.improve_profile")}
          description={t("features.idle-match-timer.ui.not-found.update_profile")}
          button={
            <Button
              onPress={() => router.push("/profile-edit/profile")}
              variant={"white"}
              size="chip"
              textColor="dark"
              className="!px-[12px] !h-[33px]  !border-[#D1D5DB]"
            >
              {t("features.idle-match-timer.ui.not-found.edit")}
            </Button>
          }
          icon={<ImproveProfileIcon width={32} height={32} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  image: {
    marginTop: 27,
  },
  title: {
    fontSize: 20,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 24,
    color: "#000",
  },
  contentContainer: {
    marginTop: 24,
    marginBottom: 24,
    width: "100%",
    paddingHorizontal: 26,
    alignItems: "center",
    gap: 12,
  },
  button: {
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  frameIcon: {
    width: 38,
    height: 38,
  },
});
