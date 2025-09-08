import { CommunityGuideline } from "@/src/features/community/ui";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";

import { useCategory } from "@/src/features/community/hooks";
import { useAuth } from "@/src/features/auth";
import { useQuery } from "@tanstack/react-query";
import { getMySimpleDetails } from "@/src/features/auth/apis";

type MySimpleDetails = {
  role: string;
  id: string;
  profileId: string;
  name: string;
};

const isNoticeCategory = (code?: string) => {
  if (!code) return false;
  return code === "notice";
};
const isPopularCategory = (code?: string) => {
  if (!code) return false;
  return code === "hot";
};

const isAllowedCategory = (code?: string, isAdmin?: boolean) => {
  if (!code) return false;
  if (isPopularCategory(code)) return false;
  if (isNoticeCategory(code) && !isAdmin) return false;
  return true;
};

export const ArticleWriteForm = () => {
  const { control, setValue } = useFormContext();

  const content = useWatch({ control, name: "content" });
  const images = useWatch({ control, name: "images" }) || [];
  const originalImages = useWatch({ control, name: "originalImages" }) || [];
  const deleteImageIds = useWatch({ control, name: "deleteImageIds" }) || [];

  const { categories, changeCategory } = useCategory();
  const { profileDetails } = useAuth();
  const { data: me } = useQuery<MySimpleDetails>({
    queryKey: ["my-simple-details"],
    queryFn: async () => (await getMySimpleDetails()).data,
    enabled: !!profileDetails,
    staleTime: 5 * 60 * 1000,
  });
  const isAdmin = me?.role === "admin";

  const selectedCategory: string | undefined = useWatch({
    control,
    name: "type",
  });

  const allowedCategories = useMemo(
    () => categories.filter((c) => isAllowedCategory(c.code, isAdmin)),
    [categories, isAdmin]
  );

  useEffect(() => {
    if (!selectedCategory || !isAllowedCategory(selectedCategory, isAdmin)) {
      const fallback = allowedCategories[0]?.code;
      if (fallback) {
        setValue("type", fallback as any, { shouldDirty: true });
        changeCategory(fallback);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedCategories, isAdmin]);

  const displayName = useMemo(() => {
    const found = categories.find((c) => c.code === selectedCategory);
    return found?.displayName ?? "카테고리";
  }, [categories, selectedCategory]);

  const pickCategory = (code: string) => {
    if (!isAllowedCategory(code, isAdmin)) return;
    setValue("type", code as any, { shouldDirty: true, shouldValidate: true });
    changeCategory(code);
  };

  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("알림", "이미지는 최대 5개까지 선택할 수 있습니다.");
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
      const imageUris = newImages.map((asset) => asset.uri);
      setValue("images", [...images, ...imageUris]);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const originalImage = originalImages.find(
      (orig: { id: string; imageUrl: string; displayOrder: number }) =>
        orig.imageUrl === imageToRemove
    );
    if (originalImage) {
      const updatedDeleteIds = [...deleteImageIds, originalImage.id];
      setValue("deleteImageIds", updatedDeleteIds);
    }
    const updatedImages = images.filter((_: string, i: number) => i !== index);
    setValue("images", updatedImages);
  };

  const [openDropdown, setOpenDropdown] = useState(false);

  return (
    <ScrollView
      className="flex-1"
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      scrollEnabled={outerScrollEnabled}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator
    >
      <View className="h-[1px] bg-[#E7E9EC]" />

      <View className="px-[16px] pt-[26px]">
        <View className="flex-row items-center gap-3 mb-[10px]">
          {allowedCategories.length > 0 && (
            <View>
              <TouchableOpacity
                onPress={() => setOpenDropdown((p) => !p)}
                className="px-3 py-2 rounded-md bg-[#F3F0FF] items-center justify-center"
              >
                <Text className="text-[#6D28D9] font-bold text-sm">
                  {displayName} ▼
                </Text>
              </TouchableOpacity>

              {openDropdown && (
                <View className="absolute top-[44px] left-0 z-10 bg-white rounded-md shadow-md border border-[#E7E9EC] w-[160px]">
                  {allowedCategories.map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      className="px-3 py-2"
                      onPress={() => {
                        pickCategory(c.code);
                        setOpenDropdown(false);
                      }}
                    >
                      <Text
                        className={
                          c.code === selectedCategory
                            ? "text-[#6D28D9] font-bold"
                            : "text-black"
                        }
                      >
                        {c.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="제목을 입력하세요."
                  className="w-full p-2 font-bold placeholder:text-[#d9d9d9] text-[18px] border-b border-[#E7E9EC] pb-2"
                  onChangeText={onChange}
                  value={value}
                  blurOnSubmit={false}
                />
              )}
            />
          </View>
        </View>

        <View className="items-center justify-center">
          <Controller
            control={control}
            name="content"
            rules={{ maxLength: 2000 }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="내용을 입력하세요."
                multiline
                scrollEnabled
                textAlignVertical="top"
                maxLength={2000}
                className="w-full p-2 text-[14px] md:text-md placeholder:text-[#D9D9D9]"
                onChangeText={onChange}
                value={value}
                style={{ minHeight: 232, maxHeight: 400 }}
                underlineColorAndroid="transparent"
                blurOnSubmit={false}
                onFocus={() => setOuterScrollEnabled(false)}
                onBlur={() => setOuterScrollEnabled(true)}
                onTouchStart={() => setOuterScrollEnabled(false)}
                onTouchEnd={() => setOuterScrollEnabled(true)}
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
              <Text className="text-gray-600 text-sm">
                이미지 추가 ({images.length}/5)
              </Text>
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
