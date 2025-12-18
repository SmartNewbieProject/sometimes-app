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
import { ScrollView, View, StyleSheet } from "react-native";
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
        await mypageApis.uploadProfileImage(newImages[i], i);
      }
    }
  };

  const onSubmit = () => {
    if (!nextable) {
      showModal({
        title: t("apps.auth.reapply.modal_need_images_title"),
        children: t("apps.auth.reapply.modal_need_images_desc"),
        primaryButton: {
          text: t("apps.auth.reapply.button_confirm"),
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
            text: t("apps.auth.reapply.button_confirm"),
            onClick: () => {
              router.replace("/auth/login");
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
            text: t("apps.auth.reapply.button_confirm"),
            onClick: () => {},
          },
        });
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.contentWrapper}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 인스타그램 아이디 섹션 */}
          <View style={styles.sectionContainer}>
            <View style={styles.labelRow}>
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
            <View style={styles.infoTextContainer}>
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.auth.reapply.instagram_info_1")}
              </Text>
              <Text size="sm" textColor="pale-purple" weight="light">
                {t("apps.auth.reapply.instagram_info_2")}
              </Text>
            </View>
          </View>

          {/* 프로필 사진 섹션 */}
          <View style={styles.sectionContainer}>
            <View style={styles.labelRow}>
              <Text size="md" textColor="purple" weight="semibold">
                {t("apps.auth.reapply.profile_image_label")}
              </Text>
            </View>
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              style={styles.profileImageInfo}
            >
              {t("apps.auth.reapply.profile_image_info")}
            </Text>

            {/* 이미지 업로드 영역 */}
            <View style={styles.imageUploadContainer}>
              <View style={styles.mainImageWrapper}>
                <ImageSelector
                  size="sm"
                  actionLabel="대표"
                  value={images[0] ?? undefined}
                  onChange={(value) => {
                    uploadImage(0, value);
                  }}
                />
              </View>

              <View style={styles.subImagesRow}>
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
      <View style={styles.bottomContainer}>
        <Button
          variant="primary"
          size="md"
          onPress={onSubmit}
          disabled={!isValid || isLoading}
          styles={styles.submitButton}
        >
          {isLoading ? t("apps.auth.reapply.button_reapply_loading") : t("apps.auth.reapply.button_next")}
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoTextContainer: {
    marginTop: 8,
  },
  profileImageInfo: {
    marginBottom: 24,
  },
  imageUploadContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
  },
  mainImageWrapper: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  subImagesRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  bottomContainer: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  submitButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
  },
});
