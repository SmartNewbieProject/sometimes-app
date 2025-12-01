import { Alert, View } from "react-native";
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
    <View className="flex flex-col items-center gap-y-4 ">
      <View className="flex flex-col w-full">
      <Text className="text-2xl font-bold" textColor="black">{t('features.mypage.mbti_변경')}</Text>
      <Text className="text-md mt-1.5" textColor="gray">
        {t('features.mypage.not_mbti_set')}
      </Text>
      </View>

      <MbtiSelector 
        value={mbtiValue}
        onChange={setMbtiValue} 
        onBlur={() => {}} 
      />

      <View className="flex flex-row items-center gap-x-2 mt-4 justify-center">
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
