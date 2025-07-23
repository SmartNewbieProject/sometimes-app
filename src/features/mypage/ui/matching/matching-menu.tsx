import { useCommingSoon } from "@/src/features/admin/hooks";
import { useModal } from "@/src/shared/hooks/use-modal";
import { ImageResources } from "@/src/shared/libs";
import { AnnounceCard, Button, Text } from "@/src/shared/ui";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import CustomSwitch from "../custom-switch";
import { ChangeMbtiModal } from "../modal/change-mbti.modal";
import MatchingCard from "./matching-card";

const MatchingMenu = () => {
  const showCommingSoon = useCommingSoon();
  const [department, setDepartment] = useState(false);
  const [univ, setUniv] = useState(false);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>매칭 설정</Text>
      <View style={styles.bar} />
      <View style={styles.contentContainer}>
        <MatchingCard
          title="같은 학과 매칭 제외"
          isOn={department}
          toggle={showCommingSoon}
        />
        <MatchingCard
          title="같은 학교 매칭 제외"
          isOn={univ}
          toggle={showCommingSoon}
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
