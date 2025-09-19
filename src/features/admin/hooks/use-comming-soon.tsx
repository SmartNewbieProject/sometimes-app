// TODO: Internationalization failed for this file. Manual intervention required.
import { useModal } from "@/src/shared/hooks/use-modal";
import { Text } from '@shared/ui';
import { View } from 'react-native';
import { useTranslation } from "react-i18next";


export const useCommingSoon = () => {
  const { showModal } = useModal();
  const { t } = useTranslation();

  const showCommingSoonModal = () => {
    showModal({
      customTitle:
        <Text textColor="purple" weight="semibold" className="text-[18px] pb-2">
          {t("features.admin.hooks.use_comming_soon.modal_title")}
        </Text>,
      children: (
        <View> 
          <Text size="md" textColor="black" weight="light">
            {t("features.admin.hooks.use_comming_soon.modal_body")}
          </Text>
        </View>
      ),
      primaryButton: {
        text: t("global.confirm"),
        onClick: () => { },
      },
    });
  };

  return showCommingSoonModal;
};