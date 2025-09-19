import { useCommingSoon } from "@/src/features/admin/hooks";
import { useMatchingFilters } from "@/src/features/mypage/hooks/use-matching-filter";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageResources } from "@/src/shared/libs";
import { AnnounceCard, Button, Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import CustomSwitch from "../custom-switch";
import { ChangeMbtiModal } from "../modal/change-mbti.modal";
import MatchingCard from "./matching-card";
import { useTranslation } from "react-i18next";



const MatchingMenu = () => {
  const showCommingSoon = useCommingSoon();
  const { t } = useTranslation();
  const {
    filters,
    isLoading,
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
        />
        <MatchingCard
          title={t('features.mypage.ex_same_school')}
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