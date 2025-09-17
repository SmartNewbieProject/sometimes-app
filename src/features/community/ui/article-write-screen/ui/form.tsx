import { CommunityGuideline } from "@/src/features/community/ui";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ScrollView, Text, TextInput, View, TouchableOpacity, Image, Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const ArticleWriteForm = () => {
  const { setValue } = useFormContext();
  const { t } = useTranslation();
  const content = useWatch({ name: "content" });
  const images = useWatch({ name: "images" }) || [];
  const originalImages = useWatch({ name: "originalImages" }) || [];
  const deleteImageIds = useWatch({ name: "deleteImageIds" }) || [];

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert(t("features.community.ui.article_write_screen.form.alert_title"), t("features.community.ui.article_write_screen.form.alert_image_limit"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.slice(0, 5 - images.length);
      const imageUris = newImages.map(asset => asset.uri);
      setValue("images", [...images, ...imageUris]);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    
    // 기존 이미지인지 확인 (originalImages에서 찾기)
    const originalImage = originalImages.find((orig: { id: string; imageUrl: string; displayOrder: number }) => orig.imageUrl === imageToRemove);
    
    if (originalImage) {
      // 기존 이미지라면 deleteImageIds에 추가
      const updatedDeleteIds = [...deleteImageIds, originalImage.id];
      setValue("deleteImageIds", updatedDeleteIds);
    }
    
    // images 배열에서 제거
    const updatedImages = images.filter((_: string, i: number) => i !== index);
    setValue("images", updatedImages);
  };

  return (
    <ScrollView className="flex-1 ">
      <View className="h-[1px] bg-[#E7E9EC]" />
      <View className="px-[16px] pt-[26px]">
        <View className="items-center justify-center">
          <Controller
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder={t("features.community.ui.article_write_screen.form.title_placeholder")}
                className="w-full p-2 mb-[10px] font-bold placeholder:text-[#d9d9d9] text-[20px] border-b border-[#E7E9EC] outline-none pb-2"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Controller
            name="content"
            rules={{ maxLength: 2000 }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder={t("features.community.ui.article_write_screen.form.content_placeholder")}
                multiline
                textAlignVertical="top"
                maxLength={2000}
                className="w-full p-2 min-h-[232px] text-[14px] md:text-md placeholder:text-[#D9D9D9]"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <View className="flex-row items-center justify-between w-full mt-1 mb-2">
            <TouchableOpacity
              onPress={pickImage}
              className="flex-row items-center px-3 py-2 bg-gray-100 rounded-lg"
            >
              <Image
                source={require("@assets/images/camera.png")}
                style={{ width: 30, height: 30, marginRight: 8 }}
                resizeMode="contain"
              />
              <Text className="text-gray-600 text-sm">{t("features.community.ui.article_write_screen.form.add_image_button")} ({images.length}/5)</Text>
            </TouchableOpacity>
            <Text className="text-gray-500">x {content?.length ?? 0}/2000</Text>
          </View>

          {images.length > 0 && (
            <View className="w-full mt-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {images.map((uri: string, index: number) => (
                    <View key={`image-${uri}-${index}`} className="relative">
                      <Image
                        source={{ uri }}
                        className="w-20 h-20 rounded-lg"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                      >
                        <Text className="text-white text-xs font-bold">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>
      <View className="h-[1px] bg-[#E7E9EC] mb-4" />
      <CommunityGuideline />
    </ScrollView>
  );
};
