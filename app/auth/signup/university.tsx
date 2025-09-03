import { TwoButtons } from "@/src/features/layout/ui";
import { DefaultLayout } from "@/src/features/layout/ui";
import useUniversityHook from "@/src/features/signup/hooks/use-university-hook";
import UniversityCard from "@/src/features/signup/ui/university/university-card";
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

  const [isFocused, setIsFocused] = useState(false);
  const animationProgress = useSharedValue(0);

  const handleFocus = () => {
    console.log("isFocuesed", isFocused);
    if (!isFocused) {
      setIsFocused(true);
      animationProgress.value = withTiming(1, { duration: 350 });
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
      router.push(
        `/auth/signup/university-details?universityName=${selectedUniv}`
      );
    });
  };

  useEffect(() => {
    const onBackPress = () => {
      if (isFocused) {
        setIsFocused(false);
        setSearchText("");
        animationProgress.value = withTiming(0, { duration: 350 });
        Keyboard.dismiss();
        return true;
      }
      router.navigate("/auth/signup/area");
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(animationProgress.value, [0, 1], [100, 0]);
    return {
      transform: [{ translateY }],
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animationProgress.value, [0, 1], [1, 0]);
    const translateY = interpolate(animationProgress.value, [0, 1], [0, -50]);
    return {
      opacity,
      transform: [{ translateY }],
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
    <DefaultLayout className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Animated.View style={[styles.titleContainer, animatedTitleStyle]}>
            <RNText style={styles.title}>어느 대학에 재학중이신가요?</RNText>
          </Animated.View>

          <Animated.View style={[animatedContainerStyle, { width: "100%" }]}>
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
                  router.navigate("/auth/signup/area");
                }}
              />
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    position: "absolute",
    alignItems: "center",
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
});
