import { View, ScrollView } from "react-native";
import { Text, Button, PalePurpleGradient, ImageSelector } from "@/src/shared/ui";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/src/widgets";
import { reapplySignup } from "@/src/features/auth/apis";
import { useModal } from "@/src/shared/hooks/use-modal";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { Image } from 'expo-image';
import SmallTitleIcon from "@/assets/icons/small-title.svg";
import { axiosClient } from "@/src/shared/libs";
import mypageApis from "@/src/features/mypage/apis";

const schema = z.object({
  instagramId: z.string().min(1, "인스타그램 ID를 입력해주세요"),
  images: z.array(z.string().nullable()).min(3, "3장의 프로필 사진이 필요합니다"),
});

type FormState = z.infer<typeof schema>;

export default function ReapplyScreen() {
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

  const { handleSubmit, formState: { isValid } } = form;

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
          onClick: () => {}
        }
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
              router.push('/auth/approval-pending');
            }
          }
        });
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "재신청 중 오류가 발생했습니다.";
        showModal({
          title: "재신청 실패",
          children: errorMessage,
          primaryButton: {
            text: "확인",
            onClick: () => {}
          }
        });
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <View className="flex-1 flex flex-col w-full items-center">
      <PalePurpleGradient />

      <ScrollView className="flex-1 w-full" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-8">
          {/* SOMETIME 로고 */}
          <View className="items-center mb-8">
            <SmallTitleIcon width={160} height={40} />
          </View>

          {/* 인스타그램 아이디 섹션 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text size="md" textColor="purple" weight="semibold">인스타그램 아이디</Text>
            </View>
            <Form.LabelInput
              label=""
              placeholder="인스타그램 아이디를 입력"
              control={form.control}
              name="instagramId"
              size="sm"
            />
            <View className="mt-2">
              <Text size="sm" textColor="pale-purple" weight="light">
                사진을 업로드하고 계정을 공개로 설정하면, 매칭 확률이 높아져요.
              </Text>
              <Text size="sm" textColor="pale-purple" weight="light">
                매칭된 상대와 더 자연스러운 대화를 나눠보세요!
              </Text>
            </View>
          </View>

          {/* 프로필 사진 섹션 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Text size="md" textColor="purple" weight="semibold">프로필 사진이 없으면 매칭이 안 돼요!</Text>
            </View>
            <Text size="sm" textColor="pale-purple" weight="light" className="mb-6">
              매칭을 위해 3장의 프로필 사진을 모두 올려주세요.{'\n'}
              얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
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
          {isLoading ? "재신청 중..." : "다음으로"}
        </Button>
      </View>
    </View>
  );
}
