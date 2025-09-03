import { TwoButtons } from "@/src/features/layout/ui";
import { DefaultLayout } from "@/src/features/layout/ui";
import { useSignupProgress } from "@/src/features/signup/hooks";
import useUniversityHook from "@/src/features/signup/hooks/use-university-hook";
import UniversityLogos from "@/src/features/signup/ui/university-logos";
import UniversityCard from "@/src/features/signup/ui/university/university-card";
import { PalePurpleGradient } from "@/src/shared/ui";
import { track } from "@amplitude/analytics-react-native";
import HelpIcon from "@assets/icons/help.svg";
import SearchIcon from "@assets/icons/search.svg";
import Loading from "@features/loading";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Text as RNText,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  withDelay,
} from "react-native-reanimated";

export default function UniversityDone() {
  const router = useRouter();
  const {
    searchText,
    setSearchText,
    filteredUniv,
    handleClickUniv,
    onNext,
    selectedUniv,
    isLoading,
  } = useUniversityHook();
  const { updateShowHeader, showHeader } = useSignupProgress();
  const [isFocused, setIsFocused] = useState(false);
  const animationProgress = useSharedValue(0);
  const animationTitle = useSharedValue(1);

  const handleNext = () => {
    onNext(() => {
      router.push(
        `/auth/signup/university-details?universityName=${selectedUniv}`
      );
    });
  };

  const onBackPress = () => {
    if (isFocused) {
      setIsFocused(false);
      setSearchText("");
      animationProgress.value = withTiming(0, { duration: 0 });
      animationTitle.value = withDelay(350, withTiming(1, { duration: 0 }));
      Keyboard.dismiss();

      updateShowHeader(false);
    }
    router.navigate("/auth/login");
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, []);

  return (
    <DefaultLayout className="flex-1 ">
      <PalePurpleGradient />
      <View style={[styles.container]}>
        <Animated.View style={[styles.listAndBottomContainer]}>
          <Loading.Lottie
            title="대학 목록을 로딩중입니다.."
            loading={isLoading}
          >
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
              contentContainerStyle={{ paddingBottom: 160 }}
            />
          </Loading.Lottie>

          <View style={styles.bottomContainer}>
            <View style={styles.tipContainer}>
              <HelpIcon width={20} height={20} />
              <RNText style={styles.tip}>
                학교 인증을 통해 안전하게 이용할 수 있습니다
              </RNText>
            </View>
            <TwoButtons
              disabledNext={!selectedUniv}
              onClickNext={handleNext}
              onClickPrevious={() => {
                onBackPress();
              }}
            />
          </View>
        </Animated.View>
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,

    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    position: "absolute",
    alignItems: "center",
    zIndex: 1,
    transform: [{ translateY: 75 }],
  },
  logoContainer: {
    top: -60,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Pretendard-Bold",
  },
  searchWrapper: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "#F7F5FC",
    paddingHorizontal: 16,
    width: "100%",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    fontFamily: "Pretendard-Regular",
  },
  listAndBottomContainer: {
    flex: 1,
    width: "100%",
    marginTop: 24,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    backgroundColor: "#fff",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginBottom: 16,
  },
  tip: {
    color: "#9B94AB",
    fontWeight: "300",
    fontFamily: "Pretendard-Thin",
    fontSize: 13,
    lineHeight: 20,
  },
  welcome: {
    fontSize: 18,
    color: "#6C5CE7",
    fontFamily: "Pretendard-Medium",
    marginBottom: 8,
    textAlign: "center",
  },
});
