import { Header as H } from '@widgets/header';
import { Text } from '@shared/ui';

export const Header = () => {
  return (
    <H.Container>
      <H.Left mode="back-button" />

      <H.Center>
        <Text size="lg" textColor="black" weight="semibold">
          매칭권
        </Text>
      </H.Center>

    </H.Container>
  );
};
