import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { reapplySignup } from "@/src/features/auth/apis";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { DefaultLayout } from "@/src/features/layout/ui";
import mypageApis from "@/src/features/mypage/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { axiosClient } from "@/src/shared/libs";
import {
  Button,
  ImageSelector,
  PalePurpleGradient,
  Text,
} from "@/src/shared/ui";
import { Form } from "@/src/widgets";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import i18n from "@/src/shared/libs/i18n";

const schema = z.object({
    instagramId: z.string().min(1, i18n.t("apps.auth.reapply.validation.instagram_id_required")),
  images: z
    .array(z.string().nullable())
    .min(3, i18n.t("apps.auth.reapply.validation.images_min")),
});

type FormState = z.infer<typeof schema>;

export default function ReapplyScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const rejectionReason = params.rejectionReason as string;
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<(string | null)[]>([null, null, null]);
  const { showModal } = useModal();
  const { clearApprovalStatus, profileDetails } = useAuth();

  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      instagramId: "",
      images: [null, null, null],
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  const uploadImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
    form.setValue("images", newImages);
    form.trigger("images");
  };

  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  const nextable = images.every((image) => image !== null);

  const updateInstagramId = async (instagramId: string) => {
    return axiosClient.patch("/profile/instagram", { instagramId });
  };

  const updateProfileImagesQueue = async (newImages: string[]) => {
    const existingImages = profileDetails?.profileImages || [];
    for (let i = 0; i < 3; i++) {
      if (existingImages[i]?.id) {
        try {
          await mypageApis.deleteProfileImage(existingImages[i].id);
        } catch (error) {
          console.log(`기존 이미지 ${i} 삭제 실패:`, error);
        }
      }
      if (newImages[i]) {
        const isMain = i === 0 ? 1 : 0;
        await mypageApis.uploadProfileImage(newImages[i], isMain);
      }
    }
  };

  const onSubmit = () => {
    if (!nextable) {
      showModal({
        title: t("apps.auth.reapply.modal_need_images_title"),
        children: t("apps.auth.reapply.modal_need_images_desc"),
        primaryButton: {
          text: "확인",
          onClick: () => {},
        },
      });
      return;
    }

    handleSubmit(async (data) => {
      setIsLoading(true);
      try {
        await updateInstagramId(data.instagramId);
        const validImages = images.filter(Boolean) as string[];
        await updateProfileImagesQueue(validImages);
        const response = await reapplySignup({
          phoneNumber,
        });

        await clearApprovalStatus();

        showModal({
          title: t("apps.auth.reapply.modal_reapply_success_title"),
          children: response.message,
          primaryButton: {
            text: "확인",
            onClick: () => {
              router.push("/auth/approval-pending");
            },
          },
        });
      } catch (error: unknown) {
        const errorMessage =
                    error instanceof Error
            ? error.message
            : t("apps.auth.reapply.modal_reapply_fail_desc");
        showModal({
          title: t("apps.auth.reapply.modal_reapply_fail_title"),
          children: errorMessage,
          primaryButton: {
            text: "확인",
            onClick: () => {},
          },
        });
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <DefaultLayout className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />

      <ScrollView
        className="flex-1 w-full"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 py-8">
          {/* SOMETIME 로고 */}
          <View className="items-center mb-8 mt-4">
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 인스타그램 아이디 섹션 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text size="md" textColor="purple" weight="semibold">
                {t("apps.auth.reapply.instagram_id_label")}
              </Text>
            </View>
            <Form.LabelInput
              label=""
              placeholder={t("apps.auth.reapply.instagram_id_placeholder")}
              control={form.control}
              name="instagramId"
              size="sm"
            />
            <View className="mt-2">
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.auth.reapply.instagram_info_1")}
              </Text>
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.auth.reapply.instagram_info_2")}
              </Text>
            </View>
          </View>

          {/* 프로필 사진 섹션 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text size="md" textColor="purple" weight="semibold">
                {t("apps.auth.reapply.profile_image_label")}
              </Text>
            </View>
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              className="mb-6"
            >
              {t("apps.auth.reapply.profile_image_info")}
            </Text>

            {/* 이미지 업로드 영역 */}
            <View className="flex-1 flex flex-col gap-y-4">
              <View className="flex w-full justify-center items-center">
                <ImageSelector
                  size="sm"
                  actionLabel="대표"
                  value={images[0] ?? undefined}
                  onChange={(value) => {
                    uploadImage(0, value);
                  }}
                />
              </View>

              <View className="flex flex-row justify-center gap-x-4">
                <ImageSelector
                  size="sm"
                  value={images[1] ?? undefined}
                  onChange={(value) => {
                    uploadImage(1, value);
                  }}
                />
                <ImageSelector
                  size="sm"
                  value={images[2] ?? undefined}
                  onChange={(value) => {
                    uploadImage(2, value);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View className="w-full px-6 pb-8">
        <Button
          variant="primary"
          size="md"
          onPress={onSubmit}
          disabled={!isValid || isLoading}
          className="w-full py-4 rounded-2xl"
        >
          {isLoading ? t("apps.auth.reapply.button_reapply_loading") : t("apps.auth.reapply.button_next")}
        </Button>
      </View>
    </DefaultLayout>
  );
}
