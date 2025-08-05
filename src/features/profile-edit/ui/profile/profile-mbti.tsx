import { useMyInfoForm } from "@/src/features/my-info/hooks";
import { useMbti } from "@/src/features/mypage/hooks";
import colors from "@/src/shared/constants/colors";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function ProfileMbti() {
  const { mbti, updateForm } = useMyInfoForm();
  const onUpdateMbti = (mbti: string) => {
    updateForm("mbti", mbti);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MBTI</Text>
      <View style={styles.bar} />
      <MbtiSelector
        value={mbti}
        key={mbti ?? "none"}
        onChange={onUpdateMbti}
        justifyContent="flex-start"
        onBlur={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 40,
    paddingHorizontal: 28,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontFamily: "Pretendard-SemiBold",
    fontWeight: 600,

    lineHeight: 22,
  },
  bar: {
    marginTop: 6,
    marginBottom: 10,
    height: 0.5,
    backgroundColor: "#E7E9EC",
  },
});

export default ProfileMbti;
