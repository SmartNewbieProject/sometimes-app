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
  Keyboard,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategory } from "@/src/features/community/hooks";
import { useAuth } from "@/src/features/auth";
import { useQuery } from "@tanstack/react-query";
import { getMySimpleDetails } from "@/src/features/auth/apis";
import { useModal } from "@/src/shared/hooks/use-modal";

type MySimpleDetails = {
  /** @deprecated 하위 호환성을 위해 유지 */
  role?: string;
  roles: string[];
  id: string;
  profileId: string;
  name: string;
};

const isNoticeCategory = (code?: string) => !!code && code === "notice";
const isPopularCategory = (code?: string) => !!code && code === "hot";
const isAllowedCategory = (code?: string, isAdmin?: boolean) =>
  !!code && !isPopularCategory(code) && !(isNoticeCategory(code) && !isAdmin);


export const ArticleWriteForm = ({
  mode = "create" as "create" | "update",
}) => {
  const { control, setValue } = useFormContext();
  const { showModal, hideModal } = useModal();

  const { t } = useTranslation();
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
  const isAdmin = me?.roles?.includes("admin") || me?.role === "admin";

  const selectedCategory: string | undefined = useWatch({
    control,
    name: "type",
  });

  const allowedCategories = useMemo(
    () => categories.filter((c) => isAllowedCategory(c.code, isAdmin)),
    [categories, isAdmin]
  );

  useEffect(() => {
    if (mode !== "create") return;
    if (!selectedCategory || !isAllowedCategory(selectedCategory, isAdmin)) {
      const fallback = allowedCategories[0]?.code;
      if (fallback) {
        setValue("type", fallback as any, { shouldDirty: true });
        changeCategory(fallback);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedCategories, isAdmin, mode]);

  const displayName = useMemo(() => {
    const found = categories.find((c) => c.code === selectedCategory);
    return found?.displayName ?? "카테고리";
  }, [categories, selectedCategory]);

  const pickCategory = (code: string) => {
    if (mode !== "create") return;
    if (!isAllowedCategory(code, isAdmin)) return;
    setValue("type", code as any, { shouldDirty: true, shouldValidate: true });
    changeCategory(code);
  };

  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);

  const openCategoryModal = () => {
    if (mode !== "create") return;
    Keyboard.dismiss();
    showModal({
      title: "카테고리 선택",
      children: (
        <Pressable
          onPress={hideModal}
          style={{ width: "100%" }}
          android_disableSound
          accessibilityRole="button"
          accessibilityLabel="모달 닫기 영역"
        >
          <Pressable onPress={() => {}} style={{ paddingVertical: 8 }}>
            {allowedCategories.length > 0 ? (
              allowedCategories.map((c) => {
                const selected = c.code === selectedCategory;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => {
                      pickCategory(c.code);
                      hideModal?.();
                    }}
                    className="mb-2"
                    accessibilityRole="button"
                    accessibilityLabel={`${c.displayName} 카테고리 선택`}
                  >
                    <View
                      className="px-3 py-4 rounded-lg"
                      style={{
                        backgroundColor: selected ? "#F3F0FF" : "#F7F8FA",
                        borderWidth: selected ? 1 : 0,
                        borderColor: selected ? "#6D28D9" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: selected ? "700" : "500",
                          color: selected ? "#6D28D9" : "#111827",
                          fontSize: 15,
                          textAlign: "center",
                        }}
                      >
                        {c.displayName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="px-4 py-12 rounded-lg bg-surface-background">
                <Text className="text-gray-500 text-center">
                  선택 가능한 카테고리가 없습니다.
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      ),
    });
  };

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

  return (
    <ScrollView
      className="flex-1"
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      scrollEnabled={outerScrollEnabled}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator
    >
      <View className="h-[1px] bg-surface-background" />

      <View className="px-[16px] pt-[26px]">
        <View className="flex-row items-center gap-3 mb-[10px]">
          {allowedCategories.length > 0 && (
            <TouchableOpacity
              onPress={mode === "create" ? openCategoryModal : undefined}
              className="px-3 py-2 rounded-md bg-surface-background items-center justify-center"
              // update일 때 약간 투명하게
              style={{ opacity: mode === "create" ? 1 : 0.6 }}
              disabled={mode !== "create"}
            >
              <Text className="text-brand-primary font-bold text-sm">
                {displayName} ▼
              </Text>
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder={t("features.community.ui.article_write_screen.form.title_placeholder")}
                  className="w-full p-2 font-bold placeholder:text-text-inverse text-[18px] border-b border-border-default pb-2"
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
                placeholder={t("features.community.ui.article_write_screen.form.content_placeholder")}
                multiline
                scrollEnabled
                textAlignVertical="top"
                maxLength={2000}
                className="w-full p-2 text-[14px] md:text-md placeholder:text-text-inverse"
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
              {t("features.community.ui.article_write_screen.form.add_image_button")} ({images.length}/5)
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
                        <Text className="text-text-inverse text-xs font-bold">×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View className="h-[1px] bg-surface-background mb-4" />
      <CommunityGuideline />
    </ScrollView>
  );
};
