import { TouchableOpacity, View } from "react-native";
import { Text } from "@/src/shared/ui";
import { useAuth } from "../../auth";
import PurpleRightArrow from '@assets/icons/purple-arrow.svg';
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export const CommunityAnnouncement = () => {
  const { profileDetails } = useAuth();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="flex flex-row items-center justify-between"
      onPress={() => router.navigate('/community')}
    >
      <View className="my-[25px]">
        <Text textColor="black" className="font-bold text-[18px]" weight="medium">
          {t("features.home.ui.community_announcement.greeting", {name:profileDetails?.name|| t("features.home.ui.community_announcement.default_user")})}
        </Text>
        <Text textColor="black" className="font-bold text-[18px]" weight="medium">
          {t("features.home.ui.community_announcement.success_story_prompt")}
        </Text>
      </View>
      <View className="mt-4">
        <PurpleRightArrow />
      </View>
    </TouchableOpacity>
  );
}