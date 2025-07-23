import { useInterestForm } from "@/src/features/interest/hooks";

import colors from "@/src/shared/constants/colors";
import { Button } from "@/src/shared/ui";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function InterestGoodMbti() {
  const { goodMbti, updateForm } = useInterestForm();
  const onUpdateMbti = (mbti: string) => {
    updateForm("goodMbti", mbti);
  };

  const onClickButton = () => {
    updateForm("goodMbti", null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>당신이 좋아하는 MBTI</Text>
      <View style={styles.bar} />
      <MbtiSelector
        value={goodMbti}
        key={goodMbti ?? "none"}
        onChange={onUpdateMbti}
        justifyContent="flex-start"
        onBlur={() => {}}
      />
      <View style={styles.buttonContainer}>
        <Button
          onPress={onClickButton}
          variant={goodMbti ? "outline" : "primary"}
          size="sm"
        >
          상관없음
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 40,
    paddingHorizontal: 28,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-start",
  },
  bar: {
    marginTop: 6,
    marginBottom: 10,
    height: 0.5,
    backgroundColor: "#E7E9EC",
  },
});

export default InterestGoodMbti;
