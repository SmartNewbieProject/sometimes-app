import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import Signup from "@/src/features/signup";
import AcademicInfoSelector from "@/src/features/signup/ui/university-details/academic-info-selector";
import DepartmentSearch from "@/src/features/signup/ui/university-details/department-search";

import { tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui/text";
import { Form } from "@/src/widgets";
import { track } from "@amplitude/analytics-react-native";
import Loading from "@features/loading";
import { Image } from "expo-image";
import { router, useGlobalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const {
  SignupSteps,
  useChangePhase,
  useSignupProgress,
  queries,
  apis,
  useSignupAnalytics,
} = Signup;
const { useDepartmentQuery } = queries;

export default function UniversityDetailsPage() {
  const { updateForm, form } = useSignupProgress();
  const { universityName } = useGlobalSearchParams<{
    universityName: string;
  }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [signupLoading, setSignupLoading] = useState(false);

  const { data: departments = [], isLoading } = useDepartmentQuery(
    universityName ?? form.universityName
  );

  useChangePhase(SignupSteps.UNIVERSITY_DETAIL);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("university_details");

  const onNext = async () => {
    const rawNumber = form.studentNumber ?? "";

    if (/^([0][1-9]|1[0-9]|2[0-5])$/.test(rawNumber)) {
      updateForm({ studentNumber: `${rawNumber}학번` });
    }

    trackSignupEvent("next_button_click", "to_done");
    track("Singup_university_details", {
      grade: form.grade,
      department: form.departmentName,
      studentNumber: `${form.studentNumber}`,
      env: process.env.EXPO_PUBLIC_TRACKING_MODE,
    });

    setSignupLoading(true);
    await tryCatch(async () => {
      setSignupLoading(false);
      trackSignupEvent("next_button_click", "to_instagram_id");
      router.push("/auth/signup/instagram");
    });
  };

  const validateUniversityForm = (): boolean => {
    const isValidGrade = !!form.grade;
    const isValidDepartment = departments.includes(
      form?.departmentName ?? "없음"
    );
    const studentNumber = form.studentNumber ?? "";

    const isValidStudentNumber =
      /^([0][1-9]|1[0-9]|2[0-5])학번$/.test(studentNumber) ||
      /^([0][1-9]|1[0-9]|2[0-5])$/.test(studentNumber);

    return isValidGrade && isValidDepartment && isValidStudentNumber;
  };
  const nextable = validateUniversityForm();

  const nextButtonMessage = (() => {
    if (!validateUniversityForm()) {
      return t("apps.auth.sign_up.university_detail.next_button_incomplete");
    }
    return t("apps.auth.reapply.button_next");
  })();

  if (signupLoading) {
    return <Loading.Page title={t("apps.auth.sign_up.university_detail.next_button_wait")} />;
  }

  useEffect(() => {
    const onBackPress = () => {
      updateForm({
        departmentName: undefined,
        grade: undefined,
        studentNumber: undefined,
      });
      router.navigate("/auth/signup/university");
      return true;
    };

    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  return (
    <DefaultLayout>
      <ScrollView
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 140,
        }}
      >
        <Pressable
          onPress={(e) => {
            console.log("click");
            if (Platform.OS !== "web") {
              Keyboard.dismiss();
            }
          }}
        >
          <View className="px-[5px]">
            <Image
              source={require("@assets/images/details.png")}
              style={{ width: 81, height: 81 }}
              className="mb-4"
            />
          </View>

          <View style={[styles.contentWrapper, { zIndex: 10 }]}>
            <Text style={styles.title}>{t("apps.auth.sign_up.university_detail.title_department")}</Text>
            <DepartmentSearch />
          </View>

          <View
            style={[
              styles.contentWrapper,
              { marginTop: 40, paddingBottom: 214 },
            ]}
          >
            <Text style={styles.title}>{t("apps.auth.sign_up.university_detail.title_academic")}</Text>
            <AcademicInfoSelector />
          </View>
        </Pressable>
      </ScrollView>
      <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
        <TwoButtons
          disabledNext={!nextable}
          onClickNext={onNext}
          onClickPrevious={() => {
            router.navigate("/auth/signup/university");
            updateForm({
              departmentName: undefined,
              grade: undefined,
              studentNumber: undefined,
            });
          }}
        />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
    fontSize: 18,
    lineHeight: 22,
    color: "#7A4AE2",
  },
  contentWrapper: {
    gap: 15,
    marginTop: 34,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: "#fff",
  },
  tipConatainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 16,
  },
});
