import { useInterestForm } from "@/src/features/interest/hooks";

import colors from "@/src/shared/constants/colors";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { Button } from "@/src/shared/ui";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from "react-native";


function InterestGoodMbti() {
  const { goodMbti, updateForm } = useInterestForm();
  const { t } = useTranslation();
  const onUpdateMbti = (mbti: string) => {
    updateForm("goodMbti", mbti);
  };

  const onClickButton = () => {
    updateForm("goodMbti", null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("features.profile-edit.ui.interest.good_mbti.title")}</Text>
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
          {t("features.profile-edit.ui.interest.good_mbti.no_preference")}
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
    fontWeight: 600,
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
    backgroundColor: semanticColors.surface.other,
  },
});

export default InterestGoodMbti;
