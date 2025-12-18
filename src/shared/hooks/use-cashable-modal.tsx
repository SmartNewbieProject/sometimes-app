import { useModal } from "@hooks/use-modal";
import { semanticColors } from '../constants/semantic-colors';
import {StyleSheet, View} from "react-native";
import {router} from "expo-router";
import {Text} from "@ui/text";
import { useTranslation } from "react-i18next";

type CashableModalProps = {
  title?: string;
  textContent: string;
};

export const useCashableModal = () => {
  const { showModal, hideModal } = useModal();
  const { t } = useTranslation();

  const show = ({ title, textContent }: CashableModalProps) => {
    return showModal({
      showLogo: true,
      showParticle: true,
      customTitle: (
          <View style={styles.title}>
            <Text size="20" weight="bold" textColor="black">
              {title ?? t("shareds.hooks.use_cashable_modal.title")}
            </Text>
          </View>
      ),
      children: (
          <View style={styles.content}>
            <Text textColor="black" weight="bold" style={styles.descriptionTitle}>
              {t("shareds.hooks.use_cashable_modal.description")}
            </Text>

          <Text style={styles.description}>
            {textContent}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("shareds.hooks.use_cashable_modal.charge_button"),
        onClick: () => router.push('/purchase/gem-store'),
      },
      secondaryButton: {
        text: t("shareds.hooks.use_cashable_modal.cancel_button"),
        onClick: hideModal,
      },
    });
  };

  return { show };

};

const styles = StyleSheet.create({
  title: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
  },
  descriptionTitle: {
    fontSize: 15,
  },
  description: {
    color: semanticColors.text.disabled,
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
});

export { styles as ModalStyles };