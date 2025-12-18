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
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCategory } from "@/src/features/community/hooks";
import { useAuth } from "@/src/features/auth";
import { useQuery } from "@tanstack/react-query";
import { getMySimpleDetails } from "@/src/features/auth/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import colors from "@/src/shared/constants/colors";

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
                    style={formStyles.categoryItem}
                    accessibilityRole="button"
                    accessibilityLabel={`${c.displayName} 카테고리 선택`}
                  >
                    <View
                      style={[
                        formStyles.categoryItemInner,
                        {
                          backgroundColor: selected ? "#F3F0FF" : "#F7F8FA",
                          borderWidth: selected ? 1 : 0,
                          borderColor: selected ? "#6D28D9" : "transparent",
                        },
                      ]}
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
              <View style={formStyles.noCategoriesContainer}>
                <Text style={formStyles.noCategoriesText}>
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
      style={formStyles.scrollView}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      scrollEnabled={outerScrollEnabled}
      contentContainerStyle={formStyles.scrollContent}
      showsVerticalScrollIndicator
    >
      <View style={formStyles.separatorBg} />

      <View style={formStyles.formContainer}>
        <View style={formStyles.headerRow}>
          {allowedCategories.length > 0 && (
            <TouchableOpacity
              onPress={mode === "create" ? openCategoryModal : undefined}
              style={[
                formStyles.categoryButton,
                { opacity: mode === "create" ? 1 : 0.6 },
              ]}
              disabled={mode !== "create"}
            >
              <Text style={formStyles.categoryButtonText}>
                {displayName} ▼
              </Text>
            </TouchableOpacity>
          )}

          <View style={formStyles.flex1}>
            <Controller
              control={control}
              name="title"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder={t("features.community.ui.article_write_screen.form.title_placeholder")}
                  style={formStyles.titleInput}
                  placeholderTextColor={semanticColors.text.disabled}
                  onChangeText={onChange}
                  value={value}
                  blurOnSubmit={false}
                />
              )}
            />
          </View>
        </View>

        <View style={formStyles.contentContainer}>
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
                style={formStyles.contentInput}
                placeholderTextColor={semanticColors.text.disabled}
                onChangeText={onChange}
                value={value}
                underlineColorAndroid="transparent"
                blurOnSubmit={false}
                onFocus={() => setOuterScrollEnabled(false)}
                onBlur={() => setOuterScrollEnabled(true)}
                onTouchStart={() => setOuterScrollEnabled(false)}
                onTouchEnd={() => setOuterScrollEnabled(true)}
              />
            )}
          />

          <View style={formStyles.imagePickerRow}>
            <TouchableOpacity
              onPress={pickImage}
              style={formStyles.imagePickerButton}
            >
              <Image
                source={require("@assets/images/camera.png")}
                style={formStyles.cameraIcon}
                resizeMode="contain"
              />
              <Text style={formStyles.imagePickerText}>
              {t("features.community.ui.article_write_screen.form.add_image_button")} ({images.length}/5)
              </Text>
            </TouchableOpacity>
            <Text style={formStyles.charCount}>x {content?.length ?? 0}/2000</Text>
          </View>

          {images.length > 0 && (
            <View style={formStyles.imagesContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={formStyles.imagesRow}>
                  {images.map((uri: string, index: number) => (
                    <View key={`image-${uri}-${index}`} style={formStyles.imageWrapper}>
                      <Image
                        source={{ uri }}
                        style={formStyles.previewImage}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        style={formStyles.removeImageButton}
                      >
                        <Text style={formStyles.removeImageText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View style={formStyles.bottomSeparator} />
      <CommunityGuideline />
    </ScrollView>
  );
};

const formStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  separatorBg: {
    height: 1,
    backgroundColor: semanticColors.surface.background,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 26,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: semanticColors.surface.background,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryButtonText: {
    color: colors.primaryPurple,
    fontWeight: "700",
    fontSize: 14,
  },
  flex1: {
    flex: 1,
  },
  titleInput: {
    width: "100%",
    padding: 8,
    fontWeight: "700",
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.default,
    paddingBottom: 8,
  },
  contentContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  contentInput: {
    width: "100%",
    padding: 8,
    fontSize: 14,
    minHeight: 232,
    maxHeight: 400,
  },
  imagePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
    marginBottom: 8,
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray100,
    borderRadius: 8,
  },
  cameraIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  imagePickerText: {
    color: colors.gray600,
    fontSize: 14,
  },
  charCount: {
    color: colors.gray500,
  },
  imagesContainer: {
    width: "100%",
    marginTop: 8,
  },
  imagesRow: {
    flexDirection: "row",
    gap: 8,
  },
  imageWrapper: {
    position: "relative",
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    backgroundColor: colors.red500,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeImageText: {
    color: semanticColors.text.inverse,
    fontSize: 12,
    fontWeight: "700",
  },
  bottomSeparator: {
    height: 1,
    backgroundColor: semanticColors.surface.background,
    marginBottom: 16,
  },
  categoryItem: {
    marginBottom: 8,
  },
  categoryItemInner: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
  },
  noCategoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 48,
    borderRadius: 8,
    backgroundColor: semanticColors.surface.background,
  },
  noCategoriesText: {
    color: colors.gray500,
    textAlign: "center",
  },
});
