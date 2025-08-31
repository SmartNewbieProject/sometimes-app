import { TwoButtons } from "@/src/features/layout/ui";
import { DefaultLayout } from "@/src/features/layout/ui";
import useUniversityHook from "@/src/features/signup/hooks/use-university-hook";
import { filterUniversities } from "@/src/features/signup/lib";
import useUniversities from "@/src/features/signup/queries/use-universities";
import SearchUniversity from "@/src/features/signup/ui/university/search-university";
import UniversityCard from "@/src/features/signup/ui/university/university-card";
import { track } from "@amplitude/analytics-react-native";

import HelpIcon from "@assets/icons/help.svg";
import Loading from "@features/loading";

import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  KeyboardAvoidingView,
  Text as RNText,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

export default function UniversityPage() {
  const router = useRouter();
  const {
    searchText,
    setSearchText,
    filteredUniv,
    handleClickUniv,
    onNext,
    selectedUniv,
    isLoading,
    regions,
  } = useUniversityHook();

  const handleNext = () => {
    onNext(() => {
      track("Signup_university", {
        test: true,
        university: selectedUniv,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
      router.push(
        `/auth/signup/university-details?universityName=${selectedUniv}`
      );
    });
  };
  useEffect(() => {
    const onBackPress = () => {
      router.navigate("/auth/signup/area");
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
  console.log("test", filteredUniv);
  return (
    <DefaultLayout className="flex-1">
      <View style={styles.container}>
        <SearchUniversity
          searchText={searchText}
          setSearchText={setSearchText}
        />
        <Loading.Lottie title="대학 목록을 로딩중입니다.." loading={isLoading}>
          <FlashList
            extraData={selectedUniv}
            data={filteredUniv}
            renderItem={({ item }) => (
              <UniversityCard
                onClick={handleClickUniv(item.name)}
                isSelected={item.name === selectedUniv}
                item={item}
              />
            )}
            estimatedItemSize={90}
            ListFooterComponentStyle={{ paddingBottom: 160 }}
          />
        </Loading.Lottie>
      </View>
      <View style={[styles.bottomContainer]} className="w-[calc(100%)]">
        <View style={styles.tipConatainer}>
          <HelpIcon width={20} height={20} />
          <RNText style={styles.tip}>
            학교 인증을 통해 안전하게 이용할 수 있습니다
          </RNText>
        </View>
        <TwoButtons
          disabledNext={!selectedUniv}
          onClickNext={handleNext}
          onClickPrevious={() => {
            router.navigate("/auth/signup/area");
          }}
        />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  chipContainer: {
    marginTop: 4,
    width: "100%",
    maxHeight: 400,
  },
  chipScrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
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
  tip: {
    color: "#9B94AB",
    fontWeight: 300,
    fontFamily: "Pretendard-Thin",
    fontSize: 13,

    lineHeight: 20,
  },
});
