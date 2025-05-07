import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from '@shared/ui';
import { View } from 'react-native';

export const useCommingSoon = () => {
  const { showModal } = useModal();

  const showCommingSoonModal = () => {
    showModal({
      customTitle:
        <Text textColor="purple" weight="semibold" className="text-[18px] pb-2">
          준비중인 기능입니다.
        </Text>,
      children:
        <View>
          <Text size="md" textColor="black" weight="light">
            완성되면 더 편리하게 이용하실 수 있어요!
          </Text>
        </View>,
      primaryButton: {
        text: "확인",
        onClick: () => { },
      },
    });
  };

  return showCommingSoonModal;
};
