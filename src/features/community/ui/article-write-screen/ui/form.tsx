import { CommunityGuideline } from "@/src/features/community/ui";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ScrollView, Text, TextInput, View } from "react-native";

export const ArticleWriteForm = () => {
  const content = useWatch({ name: "content" });
  console.log("content", content);
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
                className="w-full p-2 mb-[10px] font-bold placeholder:text-[#d9d9d9] text-[20px] border-b border-[#E7E9EC] outline-none pb-2"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            name="content"
            rules={{ maxLength: 255 }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="내용을 입력하세요."
                multiline
                maxLength={255}
                className="w-full p-2 min-h-[232px] text-[12px] md:text-md placeholder:text-[#D9D9D9]"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <View className="flex-row items-center justify-end w-full mt-1 mb-2">
            <Text>x {content?.length ?? 0}</Text>
          </View>
        </View>
      </View>
      <View className="h-[1px] bg-[#E7E9EC] mb-4" />
      <CommunityGuideline />
    </ScrollView>
  );
};
