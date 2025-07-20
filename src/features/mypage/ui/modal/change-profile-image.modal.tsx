import { useAuth } from "@/src/features/auth/hooks/use-auth";
import apis from "@/src/features/mypage/apis";
import { platform } from "@/src/shared/libs/platform";

import Layout from "@/src/features/layout";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useStorage } from "@/src/shared/hooks/use-storage";
import { cn } from "@/src/shared/libs";
import {
  Button,
  ImageSelector,
  PalePurpleGradient,
  Text,
} from "@/src/shared/ui";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChangeProfileImageModalProps {
  onCloseModal: () => void;
}

export const ChangeProfileImageModal = ({
  onCloseModal,
}: ChangeProfileImageModalProps) => {
  const { hideModal, showErrorModal } = useModal();
  const insets = useSafeAreaInsets();
  const { profileDetails } = useAuth();
  const queryClient = useQueryClient();

  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profileDetails?.profileImages) {
      const sortedPorifleImages = profileDetails?.profileImages.sort((a, b) => {
        if (a.isMain && !b.isMain) return -1;
        if (!a.isMain && b.isMain) return 1;
        return 0;
      });
      setImages(sortedPorifleImages.map((item) => item.url));
    }
  }, [profileDetails]);

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addNewImage = async (newImage: string[]) => {
    await apis.uploadProfileImages(newImage);
  };

  const cleanupRemainingImages = async (
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    oldImages: any[]
  ) => {
    for (let i = 0; i < oldImages.length; i++) {
      await apis.deleteProfileImage(oldImages[i].id).catch(() => {});
    }
  };

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const getErrorMessage = (error: any) => {
    console.log("error", error);
    return (
      error?.response?.data?.message ||
      error?.message ||
      error?.error ||
      "알 수 없는 오류가 발생했습니다."
    );
  };

  const handleSubmit = async () => {
    if (!profileDetails) {
      showErrorModal("프로필 정보를 불러올 수 없습니다.", "error");
      return;
    }

    const validImages = images.filter((img) => img !== null) as string[];
    if (validImages.length !== 3) {
      showErrorModal("프로필 이미지 3장을 모두 등록해주세요.", "announcement");
      return;
    }

    try {
      setIsSubmitting(true);
      const oldImages = [...(profileDetails.profileImages || [])];
      console.log("validFilter", validImages);

      await cleanupRemainingImages(oldImages);

      await addNewImage(validImages);

      await queryClient.invalidateQueries({ queryKey: ["my-profile-details"] });
      hideModal();
      showErrorModal(
        "프로필 이미지가 성공적으로 변경되었습니다.",
        "announcement"
      );
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } catch (error: any) {
      showErrorModal(
        `프로필 이미지 변경 중 오류가 발생했습니다: ${getErrorMessage(error)}`,
        "error"
      );
    } finally {
      setIsSubmitting(false);
      onCloseModal();
    }
  };

  console.log("images", images);

  if (!profileDetails) {
    return (
      <View className="items-center justify-center p-4">
        <ActivityIndicator size="large" color="#6A3EA1" />
        <Text className="mt-2 text-center" textColor="black">
          프로필 정보를 불러오는 중...
        </Text>
      </View>
    );
  }

  return (
    <View
      className={cn(
        "flex-1 font-extralight",
        Platform.OS === "web" && "max-w-[468px] w-full self-center"
      )}
    >
      <View style={{ position: "relative", flex: 1, marginTop: insets.top }}>
        <PalePurpleGradient />
        <View style={[styles.container]}>
          <View style={styles.titleContainer}>
            <Image
              source={require("@assets/images/profile-image.png")}
              style={{ width: 102, height: 102 }}
            />
            <Text
              weight="semibold"
              size="20"
              textColor="black"
              className="mt-2"
            >
              프로필 사진이 없으면 매칭이 안 돼요!
            </Text>
            <Text weight="semibold" size="20" textColor="black">
              지금 바로 추가해 주세요
            </Text>
          </View>

          <View style={styles.descriptioncontianer}>
            <Text weight="medium" size="sm" textColor="pale-purple">
              매칭을 위해 1장의 프로필 사진을 필수로 올려주세요
            </Text>
            <Text weight="medium" size="sm" textColor="pale-purple">
              얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
            </Text>
          </View>

          <View className="flex-1 flex flex-col gap-y-4">
            <View className="flex w-full justify-center items-center">
              {images[0] ? (
                <ImageSelector
                  size="sm"
                  actionLabel="대표"
                  value={images[0]}
                  onChange={(value) => {
                    handleImageChange(0, value);
                  }}
                />
              ) : (
                <ImageSelector
                  size="sm"
                  actionLabel="대표"
                  value={undefined}
                  onChange={(value) => {
                    handleImageChange(0, value);
                  }}
                />
              )}
            </View>

            <View className="flex flex-row justify-center gap-x-4">
              {images[1] ? (
                <ImageSelector
                  size="sm"
                  value={images[1]}
                  onChange={(value) => {
                    handleImageChange(1, value);
                  }}
                />
              ) : (
                <ImageSelector
                  size="sm"
                  value={undefined}
                  onChange={(value) => {
                    handleImageChange(1, value);
                  }}
                />
              )}
              {images[2] ? (
                <ImageSelector
                  size="sm"
                  value={images[2]}
                  onChange={(value) => {
                    handleImageChange(2, value);
                  }}
                />
              ) : (
                <ImageSelector
                  size="sm"
                  value={undefined}
                  onChange={(value) => {
                    handleImageChange(2, value);
                  }}
                />
              )}
            </View>
          </View>
        </View>
        <Layout.TwoButtons
          disabledNext={isSubmitting}
          content={{
            next: isSubmitting ? "저장 중.." : "저장하기",
          }}
          onClickNext={handleSubmit}
          onClickPrevious={onCloseModal}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 28,
  },
  descriptioncontianer: {
    paddingTop: 16,
    paddingBottom: 64,
    paddingHorizontal: 28,
  },
});

export default ChangeProfileImageModal;
