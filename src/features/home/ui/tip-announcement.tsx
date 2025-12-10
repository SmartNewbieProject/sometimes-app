import { View } from "react-native";
import { Text } from "@/src/shared/ui";
import { useTranslation } from "react-i18next";

export const TipAnnouncement = () => {
  const { t } = useTranslation();
  return (
    <View className="my-[25px]">
      <Text textColor="black" className="font-bold text-[18px]" weight="medium">
        {t("features.home.ui.tip_announcement.title")}
      </Text>
      <View
        className="flex flex-col gap-y-2 w-full bg-moreLightPurple p-2.5 rounded-xl mt-2"
      >
        <Text size="sm" weight="light" textColor="black">
          {t("features.home.ui.tip_announcement.tip")}
        </Text>
      </View>
    </View>
  );
};