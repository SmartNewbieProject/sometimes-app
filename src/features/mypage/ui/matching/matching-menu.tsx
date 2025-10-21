import { useMatchingFilters } from "@/src/features/mypage/hooks/use-matching-filter";
import { Text } from "@/src/shared/ui";
import { StyleSheet, View } from "react-native";
import MatchingCard from "./matching-card";

const MatchingMenu = () => {
  const {
    filters,
    isLoading,
    error,
    toggleAvoidDepartment,
    toggleAvoidUniversity,
  } = useMatchingFilters();
  console.log("toggle", filters?.avoidDepartment, filters?.avoidUniversity);
  if (error) {
    return <Text>오류 발생: {error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>매칭 설정</Text>
      <View style={styles.bar} />
      <View style={styles.contentContainer}>
        <MatchingCard
          title="같은 학과 매칭 제외"
          isOn={filters?.avoidDepartment || false}
          toggle={toggleAvoidDepartment}
        />
        <MatchingCard
          title="같은 학교 매칭 제외"
          isOn={filters?.avoidUniversity || false}
          toggle={toggleAvoidUniversity}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,
    lineHeight: 21.6,
  },
  bar: {
    marginTop: 5,
    marginBottom: 10,
    height: 1,
    width: "100%",
    backgroundColor: "#E7E9EC",
  },
  contentContainer: {
    gap: 10,
    paddingHorizontal: 2,
  },
});

export default MatchingMenu;
