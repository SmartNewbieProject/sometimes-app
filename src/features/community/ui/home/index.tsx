import { PalePurpleGradient } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from "react-native";
import { IconWrapper } from "@/src/shared/ui/icons";
import VectorIcon from "@/assets/icons/Vector.svg";
import NotiPreView from "@/src/features/community/ui/home/notice";
import HotPreView from "@/src/features/community/ui/home/hot";
import { useCategory } from "@/src/features/community/hooks";
import {
  NOTICE_CODE,
  HOT_CODE,
} from "@/src/features/community/queries/use-home";

export default function CommuHome() {
  const { changeCategory } = useCategory();

  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-4 pt-3">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => changeCategory(NOTICE_CODE)}
            accessibilityRole="button"
          >
            <Image
              source={require("@/assets/images/loudspeaker.png")}
              style={{ width: 26, height: 26 }}
            />
            <Text
              className="text-[24px] font-semibold mt-2 mx-2"
              style={{ color: semanticColors.text.primary }}
            >
              공지사항
            </Text>
            <View className="ml-auto">
              <IconWrapper>
                <VectorIcon className="h-[24px] w-[9px] mx-2" color="black" />
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
          className="bg-surface-background rounded-[5px] mx-[16px] px-4 py-2 my-[10px] gap-x-2 flex-row items-center"
          activeOpacity={0.8}
        >
          <Image
            source={require("@/assets/images/loudspeaker.png")}
            style={{ width: 16, height: 16 }}
          />
          <Text
            className="text-[14px]"
            style={{ color: semanticColors.text.primary }}
          >
            [FAQ] 자주묻는 질문
          </Text>

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
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => changeCategory(HOT_CODE)}
            accessibilityRole="button"
          >
            <Image
              source={require("@/assets/images/fireIcon.png")}
              style={{ width: 26, height: 26 }}
            />
            <Text
              className="text-[24px] font-semibold mt-2 mx-2"
              style={{ color: semanticColors.text.primary }}
            >
              인기
            </Text>
            <View className="ml-auto">
              <IconWrapper>
                <VectorIcon className="h-[24px] w-[9px] mx-2" color="black" />
              </IconWrapper>
            </View>
          </TouchableOpacity>
        </View>

        <View className="mx-[2px] mb-[2px]">
          <HotPreView pageSize={5} />
        </View>
      </ScrollView>
    </View>
  );
}
