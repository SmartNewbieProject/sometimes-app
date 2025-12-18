import { Alert, StyleSheet, View } from "react-native";
import { Text, Button } from "@/src/shared/ui";
import { useMbti } from "@/src/features/mypage/hooks";
import Loading from "@/src/features/loading";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import { useState, useEffect } from "react";
import { useModal } from "@/src/shared/hooks/use-modal";
import { platform } from "@/src/shared/libs";
import { useTranslation } from "react-i18next";


export const ChangeMbtiModal = () => {
  const { mbti, isLoading, updateMbti, isUpdating } = useMbti();
  const [mbtiValue, setMbtiValue] = useState<string>(mbti ?? '');
  const { hideModal } = useModal();
  const { t } = useTranslation();

  const onUpdateMbti = () => {
    updateMbti(mbtiValue);
    hideModal();
    platform({
      ios: () => {
        Alert.alert(t('features.mypage.mbti_변경_완료'), t('features.mypage.mbti가_변경되었어요'));
      },
      android: () => {
        Alert.alert(t('features.mypage.mbti_변경_완료'), t('features.mypage.mbti가_변경되었어요'));
      },
      web: () => {
        window.alert(t('features.mypage.mbti가_변경되었어요'));
      },
    });
  };

  useEffect(() => {
    setMbtiValue(mbti ?? '');
  }, [mbti]);

  if (isLoading) {
    return <Loading.Page title={t('features.mypage.mbti_를_불러오고_있어요')} />;
  }

  if (isUpdating) {
    return <Loading.Page title={t('features.mypage.mbti_를_변경하고_있어요')} />;
  }

  return (
    <View style={mbtiStyles.container}>
      <View style={mbtiStyles.headerContainer}>
        <Text style={mbtiStyles.title} textColor="black">{t('features.mypage.mbti_변경')}</Text>
        <Text style={mbtiStyles.subtitle} textColor="gray">
          {t('features.mypage.not_mbti_set')}
        </Text>
      </View>

      <MbtiSelector
        value={mbtiValue}
        onChange={setMbtiValue}
        onBlur={() => {}}
      />

      <View style={mbtiStyles.buttonRow}>
        <Button
          variant="outline"
          onPress={hideModal}
        >
          {t('features.mypage.나중에_할래요')}
        </Button>
        <Button
          variant="primary"
          onPress={onUpdateMbti}
        >
          {t('features.mypage.변경할게요')}
        </Button>
      </View>
    </View>
  );
};

const mbtiStyles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  headerContainer: {
    flexDirection: "column",
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    justifyContent: "center",
  },
});
