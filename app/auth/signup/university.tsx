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
  } = useUniversityHook();
  const { updateShowHeader, showHeader, updateRegions, updateUnivTitle } =
    useSignupProgress();
  const [isFocused, setIsFocused] = useState(false);
  const animationProgress = useSharedValue(0);
  const animationTitle = useSharedValue(1);
  const selectedUnivObj = filteredUniv?.find(
    (item) => item.id === selectedUniv
  );
  const handleFocus = () => {
    if (!isFocused) {
      setIsFocused(true);
      updateShowHeader(true);
      animationProgress.value = withTiming(1, { duration: 350 });
      animationTitle.value = withTiming(0, { duration: 0 });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleNext = () => {
    onNext(() => {
      track("Signup_university", {
        university: selectedUniv,
        env: process.env.EXPO_PUBLIC_TRACKING_MODE,
      });
      if (selectedUnivObj) {
        updateRegions(selectedUnivObj.region);
        updateUnivTitle(selectedUnivObj.name);
        // TODO : showErrorModal 넣어야함
        router.push(
          `/auth/signup/university-cluster?universityId=${selectedUniv}`
        );
      }
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

  const animatedContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animationProgress.value, [0, 1], [60, 0]);
    return {
      transform: [{ translateY }],
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animationTitle.value, [1, 0], [1, 0]);

    return {
      opacity,
    };
  });

  const animatedListStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animationProgress.value, [0, 1], [0, 1]);
    const translateY = interpolate(animationProgress.value, [0, 1], [50, 0]);
    return {
      opacity,
      transform: [{ translateY }],
      display: animationProgress.value === 0 ? "none" : "flex",
    };
  });

  return (
    <DefaultLayout className="flex-1 ">
      {!showHeader && <PalePurpleGradient />}
      <View style={[styles.container]}>
        {!showHeader && <UniversityLogos logoSize={64} />}

        <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
          <RNText style={styles.welcome}>
            대학생만 모인 곳, 당신의 이상형을 찾아드려요
          </RNText>
          <RNText style={styles.title}>지금 다니는 학교를 검색해보세요</RNText>
        </Animated.View>
        <Animated.View
          style={[animatedContainerStyle, { width: "100%", zIndex: 10 }]}
        >
          <View style={styles.searchWrapper}>
            <SearchIcon width={16} height={16} style={{ marginRight: 8 }} />
            <TextInput
              value={searchText}
              onBlur={handleBlur}
              onChangeText={setSearchText}
              placeholder="대학교 이름을 검색해주세요"
              placeholderTextColor="#9B94AB"
              style={styles.input}
              onFocus={handleFocus}
            />
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.listAndBottomContainer, animatedListStyle]}
        >
          <Loading.Lottie
            title="대학 목록을 로딩중입니다.."
            loading={isLoading}
          >
            <FlashList
              extraData={selectedUniv}
              data={filteredUniv}
              renderItem={({ item }) => (
                <UniversityCard
                  onClick={handleClickUniv(item.id)}
                  isSelected={item.id === selectedUniv}
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
