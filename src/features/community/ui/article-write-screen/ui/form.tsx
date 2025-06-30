import { View, TextInput, ScrollView } from "react-native";
import { CommunityGuideline } from "@/src/features/community/ui";
import { Controller } from "react-hook-form";

export const ArticleWriteForm = () => {
  return (
    <ScrollView className="flex-1 ">
      <View className="h-[1px] bg-[#E7E9EC]" />
      <View className="px-[16px] pt-[26px]">
        <View className="items-center justify-center">
          <Controller
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="제목을 입력하세요."
                className="w-full p-2 mb-[10px] font-bold placeholder:text-[#D9D9D9] text-[20px] border-b border-[#E7E9EC] outline-none pb-2"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            name="content"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="내용을 입력하세요."
                multiline
                className="w-full p-2 min-h-[232px] text-[12px] md:text-md placeholder:text-[#D9D9D9]"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </View>
      <CommunityGuideline />
    </ScrollView>
  );
};
