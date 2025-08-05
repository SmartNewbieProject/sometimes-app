import { checkExistsInstagram } from "@/src/features/auth";
import { DefaultLayout } from "@/src/features/layout/ui";
import Signup from "@/src/features/signup";
import type { SignupForm } from "@/src/features/signup/hooks";
import { useKeyboarding } from "@/src/shared/hooks";
import { useModal } from "@/src/shared/hooks/use-modal";
import { tryCatch } from "@/src/shared/libs";
import { cn } from "@/src/shared/libs/cn";
import { platform } from "@/src/shared/libs/platform";
import { Button, Label, Show } from "@/src/shared/ui";
import { PalePurpleGradient } from "@/src/shared/ui/gradient";
import { Text } from "@/src/shared/ui/text";
import { Form } from "@/src/widgets";
import { track } from "@amplitude/analytics-react-native";
import Loading from "@features/loading";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  queries,
  apis,
  useSignupAnalytics,
} = Signup;
const { useDepartmentQuery } = queries;

type FormProps = {
  departmentName: string;
  grade: string;
  studentNumber: string;
  instagramId: string;
};

const gradeOptions = Array.from({ length: 5 }, (_, i) => ({
  label: `${i + 1}학년`,
  value: `${i + 1}학년`,
}));

const studentNumberOptions = [
  "25학번",
  "24학번",
  "23학번",
  "22학번",
  "21학번",
  "20학번",
  "19학번",
  "18학번",
  "17학번",
];

const schema = z.object({
  departmentName: z.string().min(1),
  grade: z.string().min(1),
  studentNumber: z.string().min(1),
  // instagramId: z.string({ required_error: '인스타그램 아이디를 입력해주세요.' })
  // .regex(/^[a-zA-Z0-9._]{5,30}$/, {
  // message: '올바른 인스타그램 아이디를 입력해주세요.',
  // }),
  instagramId: z.string(),
});

export default function UniversityDetailsPage() {
  const { updateForm, form: userForm } = useSignupProgress();
  const { universityName } = useGlobalSearchParams<{
    universityName: string;
  }>();
  const insets = useSafeAreaInsets();
  const { data: departments = [], isLoading } =
    useDepartmentQuery(universityName);
  const [signupLoading, setSignupLoading] = useState(false);
  const [instaLoading, setInstaLoading] = useState(false);
  const { isKeyboardVisible } = useKeyboarding();

  const { showErrorModal } = useModal();
  useChangePhase(SignupSteps.UNIVERSITY_DETAIL);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("university_details");
  const form = useForm<FormProps>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      departmentName: userForm.departmentName,
      grade: userForm.grade,
      studentNumber: userForm.studentNumber,
      instagramId: userForm.instagramId,
    },
  });

  const {
    handleSubmit,
    formState: { isValid },
  } = form;

  // TODO: 서버 API 완성시 연동 필요
  const validateInstagramId = async (value: string) => {
    try {
      setInstaLoading(true);
      const { exists } = await checkExistsInstagram(value);
      if (!exists) {
        form.setError("instagramId", {
          type: "manual",
          message: "존재하지 않는 인스타그램 아이디입니다.",
        });
        return;
      }
      form.clearErrors("instagramId");
    } catch (error) {
      console.error("Instagram validation error:", error);
      form.setError("instagramId", {
        type: "manual",
        message: "인스타그램 아이디 확인 중 오류가 발생했습니다.",
      });
    } finally {
      setInstaLoading(false);
    }
  };

  const onNext = handleSubmit(async (data) => {
    trackSignupEvent("next_button_click", "to_done");
    track("Singup_university_details", {
      instagramId: data.instagramId,
      grade: data.grade,
      department: data.departmentName,
      studentNumber: data.studentNumber,
    });
    setSignupLoading(true);
    await tryCatch(
      async () => {
        const signupForm = { ...userForm, ...data };
        updateForm(signupForm);
        setSignupLoading(false);
        trackSignupEvent("next_button_click", "to_profile_image");
        router.push("/auth/signup/profile-image");
      },
      (error) => {
        track("Singup_university_details_error", {
          error: "에러 발생",
        });
        setSignupLoading(false);
        console.log(error);
        trackSignupEvent("signup_error", error.error);
        showErrorModal(error.error, "announcement");
      }
    );
  });

  const nextable = isValid;

  const nextButtonMessage = (() => {
    if (!nextable) {
      return "조금만 더 알려주세요";
    }
    return "다음으로";
  })();

  if (signupLoading) {
    return <Loading.Page title="잠시만 기다려주세요.." />;
  }

  if (isLoading) {
    return <Loading.Page title="학과를 검색중이에요" />;
  }

  return (
    <DefaultLayout style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
      >
        <View className="px-5">
          <Image
            source={require("@assets/images/details.png")}
            style={{ width: 81, height: 81 }}
            className="mb-4"
          />
          <Text weight="semibold" size="20" textColor="black">
            이제 몇 가지만
          </Text>
          <Text weight="semibold" size="20" textColor="black">
            더 입력해 주시면 끝이에요!
          </Text>
        </View>

        <View className="px-5 flex flex-col gap-y-[14px] mt-[20px]">
          <View className="w-full">
            <Label label="학과" size="sm" />
            <Form.Select
              size="sm"
              name="departmentName"
              control={form.control}
              options={departments.map((department) => ({
                label: department,
                value: department,
              }))}
              placeholder="학과를 선택하세요."
            />
          </View>

          <View className="w-full flex flex-row gap-x-[14px]">
            <View className="flex-1 flex flex-row gap-x-[4px]">
              <Form.Select
                name="studentNumber"
                control={form.control}
                options={studentNumberOptions.map((option) => ({
                  label: option,
                  value: option,
                }))}
                placeholder="학번 선택"
                size="sm"
                className="flex-1"
              />
              <Label label="학번" size="sm" />
            </View>

            <View className="flex-1 flex flex-row gap-x-[4px]">
              <Form.Select
                name="grade"
                control={form.control}
                options={gradeOptions}
                placeholder="학년 선택"
                size="sm"
                className="flex-1"
              />
              <Label label="학년" size="sm" />
            </View>
          </View>

          <View className="w-full flex flex-col">
            <Form.LabelInput
              name="instagramId"
              size="sm"
              control={form.control}
              label="인스타그램 아이디"
              placeholder="인스타그램 아이디를 입력"
            />
            <View className="w-full flex flex-col gap-y-0">
              <Text size="sm" textColor="pale-purple">
                사진을 업로드하고 계정을 공개로 설정하면, 매칭 확률이 높아져요.
              </Text>
              <Text size="sm" textColor="pale-purple">
                매칭된 상대와 더 자연스러운 대화를 나눠보세요!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          paddingBottom:
            Platform.OS === "web" ? 18 + insets.bottom : 6 + insets.bottom,
          left: 20,
          backgroundColor: "#fff",
          right: 20,
          flexDirection: "row",
          gap: 15,
        }}
      >
        <Button
          variant="secondary"
          onPress={() => router.navigate("/auth/signup/university")}
          styles={{ flex: 0.3 }}
        >
          뒤로
        </Button>
        <Button
          onPress={onNext}
          styles={{ flex: 0.7 }}
          disabled={!nextable || instaLoading}
        >
          {nextButtonMessage}
        </Button>
      </View>
    </DefaultLayout>
  );
}
