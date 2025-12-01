import { DefaultLayout, TwoButtons } from "@/src/features/layout/ui";
import { semanticColors } from '../../../src/shared/constants/colors';
import { useSignupProgress } from "@/src/features/signup/hooks";
import { getAreaByCode } from "@/src/features/signup/lib";
import useUniversitiesByArea from "@/src/features/signup/queries/use-universities-by-area";
import UniversityCard from "@/src/features/signup/ui/university/university-card";
import PinIcon from "@assets/icons/pin.svg";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";

import { BackHandler, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function UniversityCluster() {
  const {
    form: { universityId },
    univTitle,
    regions,
  } = useSignupProgress();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data } = useUniversitiesByArea(regions);

  const areaList = regions.length > 0 ? getAreaByCode(regions[0]) : [];
  const sortedData = data
    ? [...data.sort((a, b) => a.name.localeCompare(b.name, "ko"))]
    : [];
  const onBackPress = () => {
    router.navigate("/auth/signup/university");
    return true;
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );
    return () => subscription.remove();
  }, []);

  const handleNext = () => {
    router.push(`/auth/signup/university-details?universityId=${universityId}`);
  };
  return (
    <DefaultLayout style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <LottieView
          source={require("@assets/icons/lottie/check-icon.json")}
          loop={false}
          autoPlay
          style={{ width: 200, height: 200 }}
        />
      </View>
      <View style={{ alignItems: "center" }}>
        {univTitle.length > 6 ? (
          <>
            <Text
              style={[
                styles.title,
                { fontSize: univTitle.includes("폴리텍") ? 22 : 32 },
              ]}
            >
              {univTitle}
            </Text>
            <Text style={styles.title}>선택 완료!</Text>
          </>
        ) : (
          <Text style={styles.title}>{univTitle} 선택 완료!</Text>
        )}
      </View>
      <View style={styles.clusterContainer}>
        <PinIcon />
        <View style={{ gap: 6 }}>
          <Text style={styles.clusterLabel}>소속 클러스터</Text>
          <Text style={styles.clusterText}>
            {areaList.join("/")}권 클러스터
          </Text>
          <Text style={styles.clusterDesc}>
            같은 클러스터의 아래 학교들의 재학생분과 매칭돼요
          </Text>
        </View>
      </View>
      <ScrollView style={styles.univContainer}>
        <FlashList
          data={sortedData}
          renderItem={({ item }) => (
            <UniversityCard onClick={() => {}} isSelected={false} item={item} />
          )}
          estimatedItemSize={90}
          contentContainerStyle={{ paddingBottom: 160 }}
        />
      </ScrollView>
      <View style={styles.bottomContainer}>
        <TwoButtons
          disabledNext={false}
          onClickNext={handleNext}
          onClickPrevious={() => {
            onBackPress();
          }}
        />
      </View>
    </DefaultLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: semanticColors.surface.secondary,
  },
  title: {
    fontSize: 32,
    alignSelf: "center",
    fontWeight: 700,
    fontFamily: "Pretendard-ExtraBold",
  },
  clusterContainer: {
    padding: 16,
    marginTop: 24,
    marginHorizontal: 16,
    flexDirection: "row",
    backgroundColor: semanticColors.surface.background,
    borderRadius: 12,
    gap: 12,
  },
  clusterLabel: {
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
  },
  clusterText: {
    fontSize: 18,
    fontWeight: 600,
    fontFamily: "Pretendard-SemiBold",
  },
  clusterDesc: {
    fontSize: 12,
    fontWeight: 400,
    color: semanticColors.text.primary,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 16,
    backgroundColor: semanticColors.surface.background,
  },
  univContainer: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 24,
  },
});

export default UniversityCluster;
