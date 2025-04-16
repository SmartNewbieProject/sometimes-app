import { View } from "react-native";
import { Text } from "@/src/shared/ui";

export const TipAnnouncement = () => {
  return (
    <View className="my-[25px]">
      <Text textColor="black" className="font-bold text-[18px]" weight="medium">
        오늘의 소개팅 꿀팁을 알려드릴게요
      </Text>
      <View
        className="flex flex-col gap-y-2 w-full bg-moreLightPurple p-2.5 rounded-xl mt-2"
      >
        <Text size="sm" weight="light" textColor="black">
          상대방을 존중하는 태도를 보여주세요.
        </Text>
      </View>
    </View>
  );
};
