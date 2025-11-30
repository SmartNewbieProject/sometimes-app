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
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View, StyleSheet } from "react-native";
import { z } from "zod";

const schema = z.object({
  instagramId: z.string().min(1, "인스타그램 ID를 입력해주세요"),
  images: z
    .array(z.string().nullable())
    .min(3, "3장의 프로필 사진이 필요합니다"),
});

type FormState = z.infer<typeof schema>;

export default function ReapplyScreen() {
  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
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
        title: "프로필 사진 필요",
        children: "3장의 프로필 사진이 필요합니다",
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
          title: "재신청 완료",
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
            : "재신청 중 오류가 발생했습니다.";
        showModal({
          title: "재신청 실패",
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
    <DefaultLayout style={styles.container}>
      <PalePurpleGradient />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View style={styles.content}>
          {/* SOMETIME 로고 */}
          <View style={styles.logoContainer}>
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 인스타그램 아이디 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text size="md" textColor="purple" weight="semibold">
                인스타그램 아이디
              </Text>
            </View>
            <Form.LabelInput
              label=""
              placeholder="인스타그램 아이디를 입력"
              control={form.control}
              name="instagramId"
              size="sm"
            />
            <View style={styles.noteContainer}>
              <Text size="sm" textColor="pale-purple" weight="light">
                사진을 업로드하고 계정을 공개로 설정하면, 매칭 확률이 높아져요.
              </Text>
              <Text size="sm" textColor="pale-purple" weight="light">
                매칭된 상대와 더 자연스러운 대화를 나눠보세요!
              </Text>
            </View>
          </View>

          {/* 프로필 사진 섹션 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text size="md" textColor="purple" weight="semibold">
                프로필 사진이 없으면 매칭이 안 돼요!
              </Text>
            </View>
            <Text
              size="sm"
              textColor="pale-purple"
              weight="light"
              style={styles.description}
            >
              매칭을 위해 3장의 프로필 사진을 모두 올려주세요.{"\n"}
              얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
            </Text>

            {/* 이미지 업로드 영역 */}
            <View style={styles.imageUploadArea}>
              <View style={styles.mainImageContainer}>
                <ImageSelector
                  size="sm"
                  actionLabel="대표"
                  value={images[0] ?? undefined}
                  onChange={(value) => {
                    uploadImage(0, value);
                  }}
                />
              </View>

              <View style={styles.subImagesContainer}>
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
      <View style={styles.bottomButton}>
        <Button
          variant="primary"
          size="md"
          onPress={onSubmit}
          disabled={!isValid || isLoading}
          width="full"
        >
          {isLoading ? "재신청 중..." : "다음으로"}
        </Button>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1,
    width: '100%'
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16
  },
  section: {
    marginBottom: 32
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  noteContainer: {
    marginTop: 8
  },
  description: {
    marginBottom: 24
  },
  imageUploadArea: {
    flex: 1,
    flexDirection: 'column',
    gap: 16
  },
  mainImageContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  subImagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16
  },
  bottomButton: {
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32
  }
});
