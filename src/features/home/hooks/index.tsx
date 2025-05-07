import { useStorage } from "@/src/shared/hooks/use-storage";
import { useCheckPreferenceFillQuery } from "../queries";
import { useCallback, useEffect } from "react";
import { useModal } from "@/src/shared/hooks/use-modal";
import { View } from "react-native";
import { Text } from "@/src/shared/ui";
import { dayUtils } from "@/src/shared/libs";
import { router } from "expo-router";

type CheckPreferences = {
  isLater: boolean;
  latestDate: string | null;
};

export const useRedirectPreferences = () => {
  const { data: isPreferenceFill = true } = useCheckPreferenceFillQuery();
  const { value: latest, setValue, loading } = useStorage<CheckPreferences>({
    key: 'redirect-preferences',
  });
  const { showModal } = useModal();

  const checkShowAgain = useCallback(() => {
    if (loading) return false;
    if (!latest && isPreferenceFill) {
      return true;
    }

    if (!latest?.isLater && !isPreferenceFill) {
      return true;
    }
    const now = dayUtils.create();
    const diff = now.diff(latest?.latestDate, 'day');
    return diff > 1;
  }, [latest, isPreferenceFill, loading]);

  const confirm = useCallback(() =>
    setValue({
      isLater: true,
      latestDate: dayUtils.create().format('YYYY-MM-DD HH:mm:ss'),
    }), []);

  const onRedirect = useCallback(() => {
    confirm();
    router.navigate('/interest');
  }, []);

  useEffect(() => {
    const check = checkShowAgain();
    console.table(`checkShowAgain(): ${check}`);

    if (!check) {
      return;
    }

    showModal({
      customTitle: (
        <Text size="md" weight="bold" textColor="black" className="mb-2">
          회원님의 이상형 정보가 없어요!
        </Text>
      ),
      children: (
        <View className="flex flex-col">
          <Text size="sm" textColor="black">
            나에게 맞는 연인 매칭을 위해
          </Text>
          <Text size="sm" textColor="black">
            회원님의 이상형 정보를 등록하시겠어요?
          </Text>
        </View>
      ),
      primaryButton: {
        text: '등록할게요!',
        onClick: onRedirect,
      },
      secondaryButton: {
        text: '나중에 할게요',
        onClick: confirm,
      },
    });
  }, [checkShowAgain]);

  return {
    ...latest,
    isPreferenceFill,
  };
}
