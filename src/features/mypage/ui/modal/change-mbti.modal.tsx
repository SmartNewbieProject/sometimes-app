import { Alert, View } from "react-native";
import { Text, Button } from "@/src/shared/ui";
import { useMbti } from "@/src/features/mypage/hooks";
import Loading from "@/src/features/loading";
import { MbtiSelector } from "@/src/widgets/mbti-selector";
import { useState, useEffect } from "react";
import { useModal } from "@/src/shared/hooks/use-modal";
import { platform } from "@/src/shared/libs";

export const ChangeMbtiModal = () => {
  const { mbti, isLoading, updateMbti, isUpdating } = useMbti();
  const [mbtiValue, setMbtiValue] = useState<string>(mbti ?? '');
  const { hideModal } = useModal();
  
  const onUpdateMbti = () => {
    updateMbti(mbtiValue);
    hideModal();
    platform({
      ios: () => {
        Alert.alert('MBTI 변경 완료', 'MBTI가 변경되었어요.');
      },
      android: () => {
        Alert.alert('MBTI 변경 완료', 'MBTI가 변경되었어요.');
      },
      web: () => {
        window.alert('MBTI가 변경되었어요.');
      },
    });
  };

  useEffect(() => {
    setMbtiValue(mbti ?? '');
  }, [mbti]);

  if (isLoading) {
    return <Loading.Page title="MBTI 를 불러오고 있어요" />;
  }

  if (isUpdating) {
    return <Loading.Page title="MBTI 를 변경하고 있어요" />;
  }

  return (
    <View className="flex flex-col items-center gap-y-4 ">
      <View className="flex flex-col w-full">
      <Text className="text-2xl font-bold" textColor="black">MBTI 변경</Text>
      <Text className="text-md mt-1.5" textColor="gray">
        MBTI를 설정하지 않으면 목·일 21시 매칭에서 제외될 수 있어요.
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
          나중에 할래요.
        </Button>
        <Button
          variant="primary"
          onPress={onUpdateMbti}
        >
          변경할게요
        </Button>
      </View>
    </View>
  );
};