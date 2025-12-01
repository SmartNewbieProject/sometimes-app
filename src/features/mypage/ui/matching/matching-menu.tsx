import { useMatchingFilters } from "@/src/features/mypage/hooks/use-matching-filter";
import { semanticColors } from '../../../../shared/constants/colors';
import { Text } from "@/src/shared/ui";
import { StyleSheet, View } from "react-native";
import MatchingCard from "./matching-card";
import { useTranslation } from "react-i18next";




const MatchingMenu = () => {
  const { t } = useTranslation();
  const {
    filters,
    isLoading,
    isUpdating,
    error,
    toggleAvoidDepartment,
    toggleAvoidUniversity,
  } = useMatchingFilters();
  console.log("toggle", filters?.avoidDepartment, filters?.avoidUniversity);
  if (error) {
    return <Text>{t('features.mypage.error')}{error.message}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('features.mypage.matching_setting')}</Text>
      <View style={styles.bar} />
      <View style={styles.contentContainer}>
        <MatchingCard
          title={t('features.mypage.ex_same_class')}
          isOn={filters?.avoidDepartment || false}
          toggle={toggleAvoidDepartment}
          disabled={isUpdating}
        />
        <MatchingCard
          title={t('features.mypage.ex_same_school')}
          isOn={filters?.avoidUniversity || false}
          toggle={toggleAvoidUniversity}
          disabled={isUpdating}
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
    color: semanticColors.text.primary,
    fontSize: 18,
    fontFamily: "semibold",
    fontWeight: 600,
    lineHeight: 21.6,
  },
  bar: {
    marginTop: 5,
    marginBottom: 10,
    height: 1,
    width: "100%",
    backgroundColor: semanticColors.surface.background,
  },
  contentContainer: {
    gap: 10,
    paddingHorizontal: 2,
  },
});

export default MatchingMenu;