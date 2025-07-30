import { TwoButtons } from "@/src/features/layout/ui";
import { filterUniversities } from "@/src/features/signup/lib";
import useUniversities from "@/src/features/signup/queries/use-universities";
import SearchUniversity from "@/src/features/signup/ui/university/search-university";
import UniversityCard from "@/src/features/signup/ui/university/university-card";

import HelpIcon from "@assets/icons/help.svg";
import Loading from "@features/loading";
import Signup from "@features/signup";

import { FlashList } from "@shopify/flash-list";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Text as RNText,
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
  useSignupAnalytics,
} = Signup;
const { useUnivQuery } = queries;

export default function UniversityPage() {
  const [searchText, setSearchText] = useState("");
  const { updateForm, form: userForm } = useSignupProgress();
  const { isLoading, data: univs } = useUniversities();
  const [selectedUniv, setSelectedUniv] = useState<string | undefined>(
    userForm.universityName
  );
  const [filteredUniv, setFilteredUniv] = useState(univs);
  const insets = useSafeAreaInsets();
  useChangePhase(SignupSteps.UNIVERSITY);

  // 애널리틱스 추적 설정
  const { trackSignupEvent } = useSignupAnalytics("university");

  const onNext = () => {
    if (!selectedUniv) {
      return;
    }
    trackSignupEvent("next_button_click", "to_university_details");
    updateForm({
      ...userForm,
      universityName: selectedUniv,
    });
    router.push(
      `/auth/signup/university-details?universityName=${selectedUniv}`
    );
  };

  const handleClickUniv = (univ: string) => () => {
    setSelectedUniv((prev) => (prev === univ ? undefined : univ));
  };

  useEffect(() => {
    if (!univs) return;

    const filtered = filterUniversities(univs, searchText);
    const selected = univs.find((u) => u.name === selectedUniv);
    const merged =
      selected && !filtered.some((u) => u.name === selected.name)
        ? [selected, ...filtered]
        : filtered;
    setFilteredUniv(merged);
  }, [searchText, JSON.stringify(univs), selectedUniv]);
  console.log("filtered", filteredUniv);
  return (
    <KeyboardAvoidingView className="flex-1">
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
      <View
        style={[styles.bottomContainer, { paddingBottom: 34 + insets.bottom }]}
        className="w-[calc(100%)]"
      >
        <View style={styles.tipConatainer}>
          <HelpIcon width={20} height={20} />
          <RNText style={styles.tip}>
            학교 인증을 통해 안전하게 이용할 수 있습니다.
          </RNText>
        </View>
        <TwoButtons
          disabledNext={!selectedUniv}
          onClickNext={onNext}
          onClickPrevious={() => {
            router.navigate("/auth/signup/area");
          }}
        />
      </View>
    </KeyboardAvoidingView>
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
