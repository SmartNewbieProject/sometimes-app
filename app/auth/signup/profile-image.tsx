import { DefaultLayout } from "@/src/features/layout/ui";
import Loading from "@/src/features/loading";
import Signup from "@/src/features/signup";
import type { SignupForm } from "@/src/features/signup/hooks";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import { Button, ImageSelector } from "@/src/shared/ui";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";
import { Text } from "@/src/shared/ui/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { z } from "zod";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  apis,
  useSignupAnalytics,
} = Signup;

type FormState = {
  images: (string | null)[];
};

const schema = z.object({
  images: z
    .array(z.string().nullable())
    .min(3, { message: "1장의 사진을 올려주세요" })
    .refine((images) => images.every((img) => img !== null), {
      message: "1장의 사진을 올려주세요",
    }),
});

export default function ProfilePage() {
  const { updateForm, form: userForm } = useSignupProgress();
  const [images, setImages] = useState<(string | null)[]>(
    userForm.profileImages ?? [null, null, null]
  );
  const { showErrorModal } = useModal();
  const [signupLoading, setSignupLoading] = useState(false);
  const { trackSignupEvent } = useSignupAnalytics("profile_image");

  const form = useForm<FormState>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      images: userForm.profileImages ?? [null, null, null],
    },
  });

  const onNext = async () => {
    const signupForm = {
      ...userForm,
      profileImages: images.filter(Boolean) as string[],
    };

    updateForm(signupForm);
    setSignupLoading(true);

    await tryCatch(
      async () => {
        if (!signupForm.phone) {
          showErrorModal("휴대폰 번호가 없습니다", "announcement");
          trackSignupEvent("signup_error", "missing_phone");
          router.push("/auth/login");
          return;
        }

        const { exists } = await apis.checkPhoneNumberExists(signupForm.phone);

        if (exists) {
          showErrorModal("이미 가입된 사용자입니다", "announcement");
          trackSignupEvent("signup_error", "phone_already_exists");
          router.push("/auth/login");
          return;
        }

        await apis.signup(signupForm as SignupForm);
        trackSignupEvent("signup_complete");
        router.push("/auth/signup/done");
      },
      (error) => {
        console.error("Signup error:", error);
        trackSignupEvent("signup_error", error.error);
        showErrorModal(error.error, "announcement");
      }
    );

    setSignupLoading(false);
  };

  const nextable = images.every((image) => image !== null);
  const nextButtonMessage = nextable ? "다음으로" : "조금만 더 알려주세요";

  const uploadImage = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  useChangePhase(SignupSteps.PROFILE_IMAGE);

  useEffect(() => {
    form.setValue("images", images);
  }, [images, form]);

  if (signupLoading) {
    return <Loading.Page />;
  }

  return (
    <DefaultLayout>
      <View className="px-5">
        <Image
          source={require("@assets/images/profile-image.png")}
          style={{ width: 81, height: 81 }}
        />
        <Text weight="semibold" size="20" textColor="black" className="mt-2">
          프로필 사진이 없으면 매칭이 안 돼요!
        </Text>
        <Text weight="semibold" size="20" textColor="black">
          지금 바로 추가해 주세요
        </Text>
      </View>

      <View className="flex flex-col py-4 px-5">
        <Text weight="medium" size="sm" textColor="pale-purple">
          매칭을 위해 1장의 프로필 사진을 필수로 올려주세요
        </Text>
        <Text weight="medium" size="sm" textColor="pale-purple">
          얼굴이 잘 보이는 사진을 업로드해주세요. (최대 20MB)
        </Text>
      </View>

      <View className="flex-1 flex flex-col gap-y-4">
        <View className="flex w-full justify-center items-center">
          <ImageSelector
            size="sm"
            value={images[0] ?? undefined}
            onChange={(value) => {
              trackSignupEvent("image_upload", "image_1");
              uploadImage(0, value);
              form.trigger("images");
            }}
          />
        </View>

        <View className="flex flex-row justify-center gap-x-4">
          <ImageSelector
            size="sm"
            value={images[1] ?? undefined}
            onChange={(value) => {
              trackSignupEvent("image_upload", "image_2");
              uploadImage(1, value);
              form.trigger("images");
            }}
          />
          <ImageSelector
            size="sm"
            value={images[2] ?? undefined}
            onChange={(value) => {
              trackSignupEvent("image_upload", "image_3");
              uploadImage(2, value);
              form.trigger("images");
            }}
          />
        </View>
      </View>

      <View
        className={cn(
          platform({
            web: () => "px-5 mb-[14px] w-full flex flex-row gap-x-[15px]",
            android: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
            ios: () => "px-5 mb-[58px] w-full flex flex-row gap-x-[15px]",
            default: () => "",
          })
        )}
      >
        <Button
          variant="secondary"
          onPress={() => {
            trackSignupEvent("back_button_click", "to_university_details");
            router.push("/auth/signup/university-details");
          }}
          className="flex-[0.3]"
        >
          뒤로
        </Button>
        <Button onPress={onNext} className="flex-[0.7]" disabled={!nextable}>
          {nextButtonMessage}
        </Button>
      </View>
    </DefaultLayout>
  );
}
