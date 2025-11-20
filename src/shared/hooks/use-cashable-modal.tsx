import {useModal} from "@hooks/use-modal";
import { semanticColors } from '../constants/colors';
import {StyleSheet, View} from "react-native";
import {router} from "expo-router";
import {Text} from "@ui/text";

type CashableModalProps = {
  title?: string;
  textContent: string;
};

export const useCashableModal = () => {
  const { showModal, hideModal } = useModal();

  const show = ({ title, textContent }: CashableModalProps) => {
    return showModal({
      showLogo: true,
      customTitle: (
          <View style={styles.title}>
            <Text size="20" weight="bold" textColor="black">
              {title ?? '💔 구슬이 부족해요!'}
            </Text>
          </View>
      ),
      children: (
          <View style={styles.content}>
            <Text textColor="black" weight="bold" className="text-[15px]">
              이 기능을 사용하려면 구슬이 더 필요해요
            </Text>

            <Text style={styles.description} className="text-text-disabled">
              {textContent}
            </Text>
        </View>
      ),
      primaryButton: {
        text: '구슬 충전',
        onClick: () => router.push('/purchase/gem-store'),
      },
      secondaryButton: {
        text: '아니요',
        onClick: hideModal,
      },
    });
  };

  return { show };

};

const styles = StyleSheet.create({
  title: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    marginTop: 8,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  description: {
    color: semanticColors.text.disabled,
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center'
  },
});

export { styles as ModalStyles };