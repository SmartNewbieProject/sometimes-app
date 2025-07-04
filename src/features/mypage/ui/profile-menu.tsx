import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageResources } from "@/src/shared/libs";
import { AnnounceCard, Button, Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { View } from "react-native";
import { ChangeMbtiModal } from "./modal/change-mbti.modal";
import { ChangeProfileImageModal } from "./modal/change-profile-image.modal";

const ProfileMenu = () => {
  const { showModal } = useModal();

  const openChangeMbtiModal = () => {
    showModal({
      children: <ChangeMbtiModal />,
    });
  };

  const openChangeProfileImageModal = () => {
    showModal({
      children: <ChangeProfileImageModal />,
    });
  };

  return (
    <View className="w-full">
      <Text className="text-[18px] text-black font-weight-500">
        프로필 관리
      </Text>
      <View
        style={{ borderBottomWidth: 1, borderBottomColor: "#E0E0E0" }}
        className="mt-[5px] mb-[10px]"
      />
      <View className="flex flex-col items-center gap-y-2">
        <AnnounceCard
          emoji={ImageResources.DETAILS}
          emojiSize={{ width: 31, height: 28 }}
          text="프로필 이미지를 변경하고 싶어요!"
          onPress={openChangeProfileImageModal}
        />
        <AnnounceCard
          emoji={ImageResources.DETAILS}
          emojiSize={{ width: 31, height: 28 }}
          text="MBTI를 변경하고싶어요!"
          onPress={openChangeMbtiModal}
        />
        <AnnounceCard
          emoji={ImageResources.DETAILS}
          emojiSize={{ width: 31, height: 28 }}
          text="이상형 정보를 다시 등록할래요"
          onPress={() => router.navigate("/interest")}
        />
        <AnnounceCard
          emoji={ImageResources.DETAILS}
          emojiSize={{ width: 31, height: 28 }}
          text="내 정보를 다시 등록할래요"
          onPress={() => router.navigate("/my-info")}
        />
      </View>
    </View>
  );
};

export default ProfileMenu;
