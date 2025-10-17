import { PalePurpleGradient } from "@/src/shared/ui";
import React from "react";
import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import VectorIcon from "@/assets/icons/Vector.svg";
import NotiPreView from "@/src/features/community/ui/home/notice";

export default function CommuHome() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <View className="px-4 pt-3">
        <TouchableOpacity className="flex-row items-center" onPress={() => {}}>
          <Image
            source={require("@/assets/images/fireIcon.png")}
            style={{ width: 26, height: 26 }}
          />
          <Text className="text-[24px] font-semibold mt-2">공지사항</Text>
          <View className="ml-auto">
            <IconWrapper>
              <VectorIcon className="h-[24px] w-[9px]" color="black" />
            </IconWrapper>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() =>
          Linking.openURL(
            "https://ruby-composer-6d2.notion.site/FAQ-1ff1bbec5ba1803bab5cfbe635bba220?source=copy_link"
          )
        }
        className="bg-[#F3EDFF] rounded-[5px] mx-[16px] px-4 py-2 my-[10px] gap-x-2 flex-row items-center"
        activeOpacity={0.8}
      >
        <Image
          source={require("@/assets/images/fireIcon.png")}
          style={{ width: 16, height: 16 }}
        />
        <Text className="text-[14px]">[FAQ] 자주묻는 질문</Text>

        <View className="ml-auto">
          <IconWrapper>
            <VectorIcon className="h-[12px] w-[9px]" color="black" />
          </IconWrapper>
        </View>
      </TouchableOpacity>

      <View className="mx-[16px] mb-[16px]">
        <NotiPreView pageSize={5} />
      </View>

      <View className="px-4 py-3">
        <TouchableOpacity className="flex-row items-center" onPress={() => {}}>
          <Image
            source={require("@/assets/images/fireIcon.png")}
            style={{ width: 26, height: 26 }}
          />
          <Text className="text-[24px] font-semibold mt-2">인기</Text>
          <View className="ml-auto">
            <IconWrapper>
              <VectorIcon className="h-[24px] w-[9px]" color="black" />
            </IconWrapper>
          </View>
        </TouchableOpacity>
      </View>

      <View className="mx-[16px] mb-[16px]">
        <View className="bg-[#F6F3F6] rounded-xl p-12">
          <Text className="text-[#474747]">
            오늘의 인기 콘텐츠를 준비 중입니다.
          </Text>
        </View>
      </View>
    </View>
  );
}
