import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import { semanticColors } from '../../../src/shared/constants/colors';
import Signup from "@/src/features/signup";
import { SignupSteps } from "@/src/features/signup/hooks";
import useUniversityDetails from "@/src/features/signup/hooks/use-university-details";
import AcademicInfoSelector from "@/src/features/signup/ui/university-details/academic-info-selector";
import DepartmentSearch from "@/src/features/signup/ui/university-details/department-search";
import { withSignupValidation } from "@/src/features/signup/ui/withSignupValidation";

import { tryCatch } from "@/src/shared/libs";
import { Text } from "@/src/shared/ui/text";
import { Form } from "@/src/widgets";
import { track } from "@amplitude/analytics-react-native";
import Loading from "@features/loading";
import { Image } from "expo-image";
import { router, useGlobalSearchParams, useRouter } from "expo-router";
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

function UniversityDetailsPage() {
  const { onBackPress, onNext, signupLoading, nextable } =
    useUniversityDetails();
  const router = useRouter();
  const { t } = useTranslation();
  useEffect(() => {
    // 이벤트 리스너 등록
    const subscription = BackHandler.addEventListener("hardwareBackPress", () =>
      onBackPress(() => {
        router.navigate("/auth/signup/university");
      })
    );

    // 컴포넌트 언마운트 시 리스너 제거
    return () => subscription.remove();
  }, []);

  const handleBackPress = () => {
    onBackPress(() => {
      router.navigate("/auth/signup/university");
    });
  };

  const handleNext = () => {
    onNext(() => {
      router.push("/auth/signup/instagram");
    });
  };

  if (signupLoading) {
    return <Loading.Page title={t("apps.auth.sign_up.university_detail.next_button_wait")} />;
  }

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
          onClickNext={handleNext}
          onClickPrevious={handleBackPress}
        />
      </View>
    </DefaultLayout>
  );
}

export default withSignupValidation(
  UniversityDetailsPage,
  SignupSteps.UNIVERSITY_DETAIL
);

const styles = StyleSheet.create({
  title: {
    fontWeight: 600,
    fontFamily: "semibold",
    fontSize: 18,
    lineHeight: 22,
    color: semanticColors.brand.primary,
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
    backgroundColor: semanticColors.surface.background,
  },
  tipConatainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 16,
  },
});
