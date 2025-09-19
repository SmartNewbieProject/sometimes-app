import { Header as H } from '@widgets/header';
import { Text } from '@shared/ui';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { t } = useTranslation();
  return (
    <H.Container>
      <H.Left mode="back-button" />

      <H.Center>
        <Text size="lg" textColor="black" weight="semibold">
          {t("ui.rematch.header_title")}
        </Text>
      </H.Center>

    </H.Container>
  );
};
